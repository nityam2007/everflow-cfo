import { NextResponse } from 'next/server';
import { requireAdmin, getSession } from '@/lib/auth-utils';
import { db } from '@/lib/db';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET single partner
export async function GET(request: Request, { params }: RouteParams) {
  try {
    await requireAdmin();
    const { id } = await params;

    const partner = await db.partner.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        companyName: true,
        email: true,
        phone: true,
        isActive: true,
        createdAt: true,
        _count: { select: { assignments: true } },
      },
    });

    if (!partner) {
      return NextResponse.json({ error: 'Partner not found' }, { status: 404 });
    }

    return NextResponse.json(partner);
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}

// PATCH update partner
export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    await requireAdmin();
    const { id } = await params;
    const session = await getSession();
    const body = await request.json();

    const { name, companyName, email, phone, isActive } = body;

    // Build update data
    const updateData: {
      name?: string;
      companyName?: string;
      email?: string;
      phone?: string | null;
      isActive?: boolean;
    } = {};

    if (name !== undefined) updateData.name = name;
    if (companyName !== undefined) updateData.companyName = companyName;
    if (email !== undefined) updateData.email = email.toLowerCase();
    if (phone !== undefined) updateData.phone = phone;
    if (isActive !== undefined) updateData.isActive = isActive;

    // Check if email is already taken by another partner
    if (email) {
      const existing = await db.partner.findFirst({
        where: { 
          email: email.toLowerCase(),
          id: { not: id },
        },
      });
      if (existing) {
        return NextResponse.json({ error: 'Email already in use' }, { status: 400 });
      }
    }

    const partner = await db.partner.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        companyName: true,
        email: true,
        phone: true,
        isActive: true,
      },
    });

    // Audit log
    await db.auditLog.create({
      data: {
        action: 'PARTNER_UPDATED',
        entityType: 'partner',
        entityId: id,
        userId: session!.user.id,
        newValues: updateData,
      },
    });

    return NextResponse.json(partner);
  } catch {
    return NextResponse.json({ error: 'Failed to update partner' }, { status: 500 });
  }
}

// DELETE partner (soft delete - deactivate)
export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    await requireAdmin();
    const { id } = await params;
    const session = await getSession();

    await db.partner.update({
      where: { id },
      data: { isActive: false },
    });

    // Audit log
    await db.auditLog.create({
      data: {
        action: 'PARTNER_DEACTIVATED',
        entityType: 'partner',
        entityId: id,
        userId: session!.user.id,
      },
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to deactivate partner' }, { status: 500 });
  }
}
