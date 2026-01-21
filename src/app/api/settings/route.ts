import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth } from '@/lib/auth-utils';
import { sanitizeString, secureJsonResponse, secureErrorResponse } from '@/lib/security';

// GET /api/settings - Get all settings or by category
export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth();
    if (!session) {
      return secureErrorResponse('Unauthorized', 401);
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const key = searchParams.get('key');

    if (key) {
      const sanitizedKey = sanitizeString(key).substring(0, 100);
      const setting = await db.siteSetting.findUnique({
        where: { key: sanitizedKey },
        include: { updatedBy: { select: { id: true, name: true } } }
      });
      return secureJsonResponse(setting);
    }

    const settings = await db.siteSetting.findMany({
      where: category ? { category: sanitizeString(category).substring(0, 50) } : undefined,
      orderBy: [{ category: 'asc' }, { key: 'asc' }],
      include: { updatedBy: { select: { id: true, name: true } } }
    });

    return secureJsonResponse(settings);
  } catch (error) {
    console.error('Error fetching settings:', error);
    return secureErrorResponse('Failed to fetch settings', 500);
  }
}

// POST /api/settings - Create new setting (Admin only)
export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth();
    if (!session || session.user.role !== 'ADMIN') {
      return secureErrorResponse('Admin access required', 403);
    }

    const body = await request.json();
    const { key, value, description, category } = body;

    if (!key || value === undefined) {
      return secureErrorResponse('Key and value are required', 400);
    }

    // Sanitize inputs
    const sanitizedKey = sanitizeString(key).substring(0, 100);
    const sanitizedDescription = description ? sanitizeString(description).substring(0, 500) : undefined;
    const sanitizedCategory = category ? sanitizeString(category).substring(0, 50) : 'general';

    const existing = await db.siteSetting.findUnique({ where: { key: sanitizedKey } });
    if (existing) {
      return secureErrorResponse(`Setting with key "${sanitizedKey}" already exists`, 409);
    }

    const setting = await db.siteSetting.create({
      data: {
        key: sanitizedKey,
        value,
        description: sanitizedDescription,
        category: sanitizedCategory,
        updatedById: session.user.id
      },
      include: { updatedBy: { select: { id: true, name: true } } }
    });

    await db.auditLog.create({
      data: {
        action: 'CREATE_SETTING',
        entityType: 'site_setting',
        entityId: setting.id,
        newValues: { key: sanitizedKey, category: sanitizedCategory },
        userId: session.user.id
      }
    });

    return secureJsonResponse(setting, 201);
  } catch (error) {
    console.error('Error creating setting:', error);
    return secureErrorResponse('Failed to create setting', 500);
  }
}

// PUT /api/settings - Update setting by key (Admin only)
export async function PUT(request: NextRequest) {
  try {
    const session = await requireAuth();
    if (!session || session.user.role !== 'ADMIN') {
      return secureErrorResponse('Admin access required', 403);
    }

    const body = await request.json();
    const { key, value, description } = body;

    if (!key) {
      return secureErrorResponse('Key is required', 400);
    }

    const sanitizedKey = sanitizeString(key).substring(0, 100);
    const sanitizedDescription = description !== undefined ? sanitizeString(description).substring(0, 500) : undefined;

    const existing = await db.siteSetting.findUnique({ where: { key: sanitizedKey } });
    
    if (existing) {
      // Update existing
      const updated = await db.siteSetting.update({
        where: { key: sanitizedKey },
        data: {
          value,
          ...(sanitizedDescription !== undefined && { description: sanitizedDescription }),
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

      return secureJsonResponse(updated);
    } else {
      // Create new if doesn't exist (upsert behavior)
      const created = await db.siteSetting.create({
        data: {
          key: sanitizedKey,
          value,
          description: sanitizedDescription,
          updatedById: session.user.id
        },
        include: { updatedBy: { select: { id: true, name: true } } }
      });

      return secureJsonResponse(created, 201);
    }
  } catch (error) {
    console.error('Error updating setting:', error);
    return secureErrorResponse('Failed to update setting', 500);
  }
}

// DELETE /api/settings?key=xxx - Delete setting (Admin only)
export async function DELETE(request: NextRequest) {
  try {
    const session = await requireAuth();
    if (!session || session.user.role !== 'ADMIN') {
      return secureErrorResponse('Admin access required', 403);
    }

    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key');

    if (!key) {
      return secureErrorResponse('Key is required', 400);
    }

    const sanitizedKey = sanitizeString(key).substring(0, 100);
    const existing = await db.siteSetting.findUnique({ where: { key: sanitizedKey } });
    if (!existing) {
      return secureErrorResponse('Setting not found', 404);
    }

    await db.siteSetting.delete({ where: { key: sanitizedKey } });

    await db.auditLog.create({
      data: {
        action: 'DELETE_SETTING',
        entityType: 'site_setting',
        entityId: existing.id,
        oldValues: { key: sanitizedKey, value: existing.value },
        userId: session.user.id
      }
    });

    return secureJsonResponse({ success: true });
  } catch (error) {
    console.error('Error deleting setting:', error);
    return secureErrorResponse('Failed to delete setting', 500);
  }
}
