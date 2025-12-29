import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth } from '@/lib/auth-utils';
import { isValidId, sanitizeString, secureJsonResponse, secureErrorResponse } from '@/lib/security';

// GET /api/rules/[id] - Get specific rules by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth();
    if (!session) {
      return secureErrorResponse('Unauthorized', 401);
    }

    const { id } = await params;
    
    // Validate ID format
    if (!isValidId(id)) {
      return secureErrorResponse('Invalid rules ID', 400);
    }
    
    const rules = await db.estimatorRules.findUnique({
      where: { id },
      include: { createdBy: { select: { id: true, name: true, email: true } } }
    });

    if (!rules) {
      return secureErrorResponse('Rules not found', 404);
    }

    return secureJsonResponse(rules);
  } catch (error) {
    console.error('Error fetching rules:', error);
    return secureErrorResponse('Failed to fetch rules', 500);
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
      return secureErrorResponse('Admin access required', 403);
    }

    const { id } = await params;

    // Validate ID format
    if (!isValidId(id)) {
      return secureErrorResponse('Invalid rules ID', 400);
    }

    const body = await request.json();
    const { effectiveDate, description, rulesConfig, setActive } = body;

    // Sanitize description
    const sanitizedDescription = description !== undefined 
      ? sanitizeString(description).substring(0, 500) 
      : undefined;

    const existing = await db.estimatorRules.findUnique({ where: { id } });
    if (!existing) {
      return secureErrorResponse('Rules not found', 404);
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
        ...(sanitizedDescription !== undefined && { description: sanitizedDescription }),
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

    return secureJsonResponse(updated);
  } catch (error) {
    console.error('Error updating rules:', error);
    return secureErrorResponse('Failed to update rules', 500);
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
      return secureErrorResponse('Admin access required', 403);
    }

    const { id } = await params;

    // Validate ID format
    if (!isValidId(id)) {
      return secureErrorResponse('Invalid rules ID', 400);
    }

    const existing = await db.estimatorRules.findUnique({ where: { id } });
    if (!existing) {
      return secureErrorResponse('Rules not found', 404);
    }

    if (existing.isActive) {
      return secureErrorResponse('Cannot delete active rules. Activate another version first.', 400);
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

    return secureJsonResponse({ success: true });
  } catch (error) {
    console.error('Error deleting rules:', error);
    return secureErrorResponse('Failed to delete rules', 500);
  }
}
