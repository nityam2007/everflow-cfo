import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { requireAdmin, getSession } from '@/lib/auth-utils';
import { db } from '@/lib/db';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET single user
export async function GET(request: Request, { params }: RouteParams) {
  try {
    await requireAdmin();
    const { id } = await params;

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
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}

// PATCH update user
export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    await requireAdmin();
    const { id } = await params;
    const session = await getSession();
    const body = await request.json();

    const { name, email, password, role, isActive } = body;

    // Build update data
    const updateData: {
      name?: string;
      email?: string;
      password?: string;
      role?: 'ADMIN' | 'STAFF';
      isActive?: boolean;
    } = {};

    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email.toLowerCase();
    if (role !== undefined) updateData.role = role;
    if (isActive !== undefined) updateData.isActive = isActive;

    // Hash new password if provided
    if (password && password.length >= 6) {
      updateData.password = await bcrypt.hash(password, 12);
    }

    // Check if email is already taken by another user
    if (email) {
      const existing = await db.user.findFirst({
        where: { 
          email: email.toLowerCase(),
          id: { not: id },
        },
      });
      if (existing) {
        return NextResponse.json({ error: 'Email already in use' }, { status: 400 });
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

    return NextResponse.json(user);
  } catch {
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
}

// DELETE user (soft delete - deactivate)
export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    await requireAdmin();
    const { id } = await params;
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

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to deactivate user' }, { status: 500 });
  }
}
