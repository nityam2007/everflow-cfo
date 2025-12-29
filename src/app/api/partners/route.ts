import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getServerSession } from '@/lib/auth-utils';
import { z } from 'zod';
import {
  sanitizeString,
  sanitizeEmail,
  sanitizePhone,
  secureJsonResponse,
  secureErrorResponse,
} from '@/lib/security';

const createPartnerSchema = z.object({
  name: z.string().min(2, 'Contact name must be at least 2 characters').max(100),
  companyName: z.string().min(2, 'Company name must be at least 2 characters').max(200),
  email: z.string().email('Invalid email address').max(255),
  phone: z.string().max(30).optional(),
});

// GET - List all partners (admin/staff only)
export async function GET() {
  const session = await getServerSession();

  if (!session?.user || !['ADMIN', 'STAFF'].includes(session.user.role)) {
    return secureErrorResponse('Unauthorized', 401);
  }

  const partners = await db.partner.findMany({
    orderBy: { createdAt: 'desc' },
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

  return secureJsonResponse(partners);
}

// POST - Create new partner (admin only)
export async function POST(request: NextRequest) {
  const session = await getServerSession();

  if (!session?.user || session.user.role !== 'ADMIN') {
    return secureErrorResponse('Unauthorized', 401);
  }

  try {
    const body = await request.json();
    const data = createPartnerSchema.parse(body);

    // Sanitize all inputs
    const sanitizedData = {
      name: sanitizeString(data.name),
      companyName: sanitizeString(data.companyName),
      email: sanitizeEmail(data.email),
      phone: data.phone ? sanitizePhone(data.phone) : undefined,
    };

    // Check if email already exists (in both User and Partner tables)
    const [existingUser, existingPartner] = await Promise.all([
      db.user.findUnique({ where: { email: sanitizedData.email } }),
      db.partner.findUnique({ where: { email: sanitizedData.email } }),
    ]);

    if (existingUser || existingPartner) {
      return secureErrorResponse('An account with this email already exists', 400);
    }

    // Create partner
    const partner = await db.partner.create({
      data: {
        name: sanitizedData.name,
        companyName: sanitizedData.companyName,
        email: sanitizedData.email,
        phone: sanitizedData.phone,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        companyName: true,
        email: true,
        phone: true,
        createdAt: true,
      },
    });

    // Create audit log
    await db.auditLog.create({
      data: {
        action: 'PARTNER_CREATED',
        entityType: 'PARTNER',
        entityId: partner.id,
        userId: session.user.id,
        newValues: {
          name: partner.name,
          companyName: partner.companyName,
          email: partner.email,
        },
      },
    });

    return secureJsonResponse(partner, 201);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return secureErrorResponse(error.errors[0].message, 400);
    }

    console.error('Error creating partner:', error);
    return secureErrorResponse('Failed to create partner', 500);
  }
}
