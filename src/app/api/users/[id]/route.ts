// NextResponse not needed - using secure helpers
import bcrypt from 'bcryptjs';
import { requireAdmin, getSession } from '@/lib/auth-utils';
import { db } from '@/lib/db';
import {
  isValidId,
  sanitizeString,
  sanitizeEmail,
  strongPasswordSchema,
  secureJsonResponse,
  secureErrorResponse,
} from '@/lib/security';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET single user
export async function GET(request: Request, { params }: RouteParams) {
  try {
    await requireAdmin();
    const { id } = await params;

    // Validate ID format
    if (!isValidId(id)) {
      return secureErrorResponse('Invalid user ID', 400);
    }

    const user = await db.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        _count: { select: { assignedLeads: true } },
      },
    });

    if (!user) {
      return secureErrorResponse('User not found', 404);
    }

    return secureJsonResponse(user);
  } catch {
    return secureErrorResponse('Unauthorized', 401);
  }
}

// PATCH update user
export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    await requireAdmin();
    const { id } = await params;

    // Validate ID format
    if (!isValidId(id)) {
      return secureErrorResponse('Invalid user ID', 400);
    }

    const session = await getSession();
    const body = await request.json();

    const { name, email, password, role, isActive } = body;

    // Validate password if provided
    if (password) {
      const passwordResult = strongPasswordSchema.safeParse(password);
      if (!passwordResult.success) {
        return secureErrorResponse(passwordResult.error.errors[0].message, 400);
      }
    }

    // Build update data with sanitization
    const updateData: {
      name?: string;
      email?: string;
      password?: string;
      role?: 'ADMIN' | 'STAFF';
      isActive?: boolean;
    } = {};

    if (name !== undefined) updateData.name = sanitizeString(name);
    if (email !== undefined) updateData.email = sanitizeEmail(email);
    if (role !== undefined && ['ADMIN', 'STAFF'].includes(role)) updateData.role = role;
    if (isActive !== undefined) updateData.isActive = isActive;

    // Hash new password if provided
    if (password) {
      updateData.password = await bcrypt.hash(password, 12);
    }

    // Check if email is already taken by another user
    if (email) {
      const existing = await db.user.findFirst({
        where: { 
          email: sanitizeEmail(email),
          id: { not: id },
        },
      });
      if (existing) {
        return secureErrorResponse('Email already in use', 400);
      }
    }

    const user = await db.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
      },
    });

    // Audit log
    await db.auditLog.create({
      data: {
        action: 'USER_UPDATED',
        entityType: 'user',
        entityId: id,
        userId: session!.user.id,
        newValues: { 
          name: updateData.name,
          email: updateData.email,
          role: updateData.role,
          isActive: updateData.isActive,
          passwordChanged: !!password,
        },
      },
    });

    return secureJsonResponse(user);
  } catch {
    return secureErrorResponse('Failed to update user', 500);
  }
}

// DELETE user (soft delete - deactivate)
export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    await requireAdmin();
    const { id } = await params;

    // Validate ID format
    if (!isValidId(id)) {
      return secureErrorResponse('Invalid user ID', 400);
    }

    const session = await getSession();

    await db.user.update({
      where: { id },
      data: { isActive: false },
    });

    // Audit log
    await db.auditLog.create({
      data: {
        action: 'USER_DEACTIVATED',
        entityType: 'user',
        entityId: id,
        userId: session!.user.id,
      },
    });

    return secureJsonResponse({ success: true });
  } catch {
    return secureErrorResponse('Failed to deactivate user', 500);
  }
}
