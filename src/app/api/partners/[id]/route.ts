import { NextResponse } from 'next/server';
import { requireAdmin, getSession } from '@/lib/auth-utils';
import { db } from '@/lib/db';
import {
  isValidId,
  sanitizeString,
  sanitizeEmail,
  sanitizePhone,
  secureJsonResponse,
  secureErrorResponse,
} from '@/lib/security';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET single partner
export async function GET(request: Request, { params }: RouteParams) {
  try {
    await requireAdmin();
    const { id } = await params;

    // Validate ID format
    if (!isValidId(id)) {
      return secureErrorResponse('Invalid partner ID', 400);
    }

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
      return secureErrorResponse('Partner not found', 404);
    }

    return secureJsonResponse(partner);
  } catch {
    return secureErrorResponse('Unauthorized', 401);
  }
}

// PATCH update partner
export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    await requireAdmin();
    const { id } = await params;

    // Validate ID format
    if (!isValidId(id)) {
      return secureErrorResponse('Invalid partner ID', 400);
    }

    const session = await getSession();
    const body = await request.json();

    const { name, companyName, email, phone, isActive } = body;

    // Build update data with sanitization
    const updateData: {
      name?: string;
      companyName?: string;
      email?: string;
      phone?: string | null;
      isActive?: boolean;
    } = {};

    if (name !== undefined) updateData.name = sanitizeString(name);
    if (companyName !== undefined) updateData.companyName = sanitizeString(companyName);
    if (email !== undefined) updateData.email = sanitizeEmail(email);
    if (phone !== undefined) updateData.phone = phone ? sanitizePhone(phone) : null;
    if (isActive !== undefined) updateData.isActive = isActive;

    // Check if email is already taken by another partner
    if (email) {
      const existing = await db.partner.findFirst({
        where: { 
          email: sanitizeEmail(email),
          id: { not: id },
        },
      });
      if (existing) {
        return secureErrorResponse('Email already in use', 400);
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

    return secureJsonResponse(partner);
  } catch {
    return secureErrorResponse('Failed to update partner', 500);
  }
}

// DELETE partner (soft delete - deactivate)
export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    await requireAdmin();
    const { id } = await params;

    // Validate ID format
    if (!isValidId(id)) {
      return secureErrorResponse('Invalid partner ID', 400);
    }

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

    return secureJsonResponse({ success: true });
  } catch {
    return secureErrorResponse('Failed to deactivate partner', 500);
  }
}
