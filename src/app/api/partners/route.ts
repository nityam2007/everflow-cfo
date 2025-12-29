import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getServerSession } from '@/lib/auth-utils';
import { z } from 'zod';

const createPartnerSchema = z.object({
  name: z.string().min(2, 'Contact name must be at least 2 characters'),
  companyName: z.string().min(2, 'Company name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
});

// GET - List all partners (admin/staff only)
export async function GET() {
  const session = await getServerSession();

  if (!session?.user || !['ADMIN', 'STAFF'].includes(session.user.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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

  return NextResponse.json(partners);
}

// POST - Create new partner (admin only)
export async function POST(request: NextRequest) {
  const session = await getServerSession();

  if (!session?.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const data = createPartnerSchema.parse(body);

    // Check if email already exists (in both User and Partner tables)
    const [existingUser, existingPartner] = await Promise.all([
      db.user.findUnique({ where: { email: data.email } }),
      db.partner.findUnique({ where: { email: data.email } }),
    ]);

    if (existingUser || existingPartner) {
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 400 }
      );
    }

    // Create partner
    const partner = await db.partner.create({
      data: {
        name: data.name,
        companyName: data.companyName,
        email: data.email,
        phone: data.phone,
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

    return NextResponse.json(partner, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error('Error creating partner:', error);
    return NextResponse.json(
      { error: 'Failed to create partner' },
      { status: 500 }
    );
  }
}
