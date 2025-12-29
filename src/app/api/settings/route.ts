import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth } from '@/lib/auth-utils';

// GET /api/settings - Get all settings or by category
export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const key = searchParams.get('key');

    if (key) {
      const setting = await db.siteSetting.findUnique({
        where: { key },
        include: { updatedBy: { select: { id: true, name: true } } }
      });
      return NextResponse.json(setting);
    }

    const settings = await db.siteSetting.findMany({
      where: category ? { category } : undefined,
      orderBy: [{ category: 'asc' }, { key: 'asc' }],
      include: { updatedBy: { select: { id: true, name: true } } }
    });

    return NextResponse.json(settings);
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

// POST /api/settings - Create new setting (Admin only)
export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth();
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const body = await request.json();
    const { key, value, description, category } = body;

    if (!key || value === undefined) {
      return NextResponse.json(
        { error: 'Key and value are required' },
        { status: 400 }
      );
    }

    const existing = await db.siteSetting.findUnique({ where: { key } });
    if (existing) {
      return NextResponse.json(
        { error: `Setting with key "${key}" already exists` },
        { status: 409 }
      );
    }

    const setting = await db.siteSetting.create({
      data: {
        key,
        value,
        description,
        category: category || 'general',
        updatedById: session.user.id
      },
      include: { updatedBy: { select: { id: true, name: true } } }
    });

    await db.auditLog.create({
      data: {
        action: 'CREATE_SETTING',
        entityType: 'site_setting',
        entityId: setting.id,
        newValues: { key, category },
        userId: session.user.id
      }
    });

    return NextResponse.json(setting, { status: 201 });
  } catch (error) {
    console.error('Error creating setting:', error);
    return NextResponse.json({ error: 'Failed to create setting' }, { status: 500 });
  }
}

// PUT /api/settings - Update setting by key (Admin only)
export async function PUT(request: NextRequest) {
  try {
    const session = await requireAuth();
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const body = await request.json();
    const { key, value, description } = body;

    if (!key) {
      return NextResponse.json({ error: 'Key is required' }, { status: 400 });
    }

    const existing = await db.siteSetting.findUnique({ where: { key } });
    
    if (existing) {
      // Update existing
      const updated = await db.siteSetting.update({
        where: { key },
        data: {
          value,
          ...(description !== undefined && { description }),
          updatedById: session.user.id
        },
        include: { updatedBy: { select: { id: true, name: true } } }
      });

      await db.auditLog.create({
        data: {
          action: 'UPDATE_SETTING',
          entityType: 'site_setting',
          entityId: updated.id,
          oldValues: { value: existing.value },
          newValues: { value },
          userId: session.user.id
        }
      });

      return NextResponse.json(updated);
    } else {
      // Create new if doesn't exist (upsert behavior)
      const created = await db.siteSetting.create({
        data: {
          key,
          value,
          description,
          updatedById: session.user.id
        },
        include: { updatedBy: { select: { id: true, name: true } } }
      });

      return NextResponse.json(created, { status: 201 });
    }
  } catch (error) {
    console.error('Error updating setting:', error);
    return NextResponse.json({ error: 'Failed to update setting' }, { status: 500 });
  }
}

// DELETE /api/settings?key=xxx - Delete setting (Admin only)
export async function DELETE(request: NextRequest) {
  try {
    const session = await requireAuth();
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key');

    if (!key) {
      return NextResponse.json({ error: 'Key is required' }, { status: 400 });
    }

    const existing = await db.siteSetting.findUnique({ where: { key } });
    if (!existing) {
      return NextResponse.json({ error: 'Setting not found' }, { status: 404 });
    }

    await db.siteSetting.delete({ where: { key } });

    await db.auditLog.create({
      data: {
        action: 'DELETE_SETTING',
        entityType: 'site_setting',
        entityId: existing.id,
        oldValues: { key, value: existing.value },
        userId: session.user.id
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting setting:', error);
    return NextResponse.json({ error: 'Failed to delete setting' }, { status: 500 });
  }
}
