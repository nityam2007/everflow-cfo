import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth } from '@/lib/auth-utils';

// GET /api/rules/[id] - Get specific rules by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    
    const rules = await db.estimatorRules.findUnique({
      where: { id },
      include: { createdBy: { select: { id: true, name: true, email: true } } }
    });

    if (!rules) {
      return NextResponse.json({ error: 'Rules not found' }, { status: 404 });
    }

    return NextResponse.json(rules);
  } catch (error) {
    console.error('Error fetching rules:', error);
    return NextResponse.json({ error: 'Failed to fetch rules' }, { status: 500 });
  }
}

// PUT /api/rules/[id] - Update rules (Admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth();
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const { effectiveDate, description, rulesConfig, setActive } = body;

    const existing = await db.estimatorRules.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Rules not found' }, { status: 404 });
    }

    // If setting as active, deactivate all other rules first
    if (setActive) {
      await db.estimatorRules.updateMany({
        where: { isActive: true, id: { not: id } },
        data: { isActive: false }
      });
    }

    const updated = await db.estimatorRules.update({
      where: { id },
      data: {
        ...(effectiveDate && { effectiveDate: new Date(effectiveDate) }),
        ...(description !== undefined && { description }),
        ...(rulesConfig && { rulesConfig }),
        ...(setActive !== undefined && { isActive: setActive })
      },
      include: { createdBy: { select: { id: true, name: true, email: true } } }
    });

    // Audit log
    await db.auditLog.create({
      data: {
        action: 'UPDATE_RULES',
        entityType: 'estimator_rules',
        entityId: id,
        oldValues: { isActive: existing.isActive },
        newValues: { isActive: updated.isActive, description: updated.description },
        userId: session.user.id
      }
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating rules:', error);
    return NextResponse.json({ error: 'Failed to update rules' }, { status: 500 });
  }
}

// DELETE /api/rules/[id] - Delete rules (Admin only, cannot delete active)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth();
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { id } = await params;

    const existing = await db.estimatorRules.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Rules not found' }, { status: 404 });
    }

    if (existing.isActive) {
      return NextResponse.json(
        { error: 'Cannot delete active rules. Activate another version first.' },
        { status: 400 }
      );
    }

    await db.estimatorRules.delete({ where: { id } });

    // Audit log
    await db.auditLog.create({
      data: {
        action: 'DELETE_RULES',
        entityType: 'estimator_rules',
        entityId: id,
        oldValues: { version: existing.version },
        userId: session.user.id
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting rules:', error);
    return NextResponse.json({ error: 'Failed to delete rules' }, { status: 500 });
  }
}
