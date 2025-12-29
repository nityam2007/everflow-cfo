import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getServerSession } from '@/lib/auth-utils';
import { z } from 'zod';

const assignPartnerSchema = z.object({
  partnerId: z.string().min(1, 'Partner ID is required'),
  notes: z.string().optional(),
});

// POST - Assign a partner to a lead
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession();

  if (!session?.user || !['ADMIN', 'STAFF'].includes(session.user.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  try {
    const body = await request.json();
    const data = assignPartnerSchema.parse(body);

    // Check if lead exists
    const lead = await db.lead.findUnique({
      where: { id },
      select: { id: true, companyName: true },
    });

    if (!lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }

    // Check if partner exists and is active
    const partner = await db.partner.findUnique({
      where: { id: data.partnerId },
      select: { id: true, companyName: true, isActive: true },
    });

    if (!partner) {
      return NextResponse.json({ error: 'Partner not found' }, { status: 404 });
    }

    if (!partner.isActive) {
      return NextResponse.json(
        { error: 'Cannot assign to inactive partner' },
        { status: 400 }
      );
    }

    // Check if already assigned to this partner
    const existingAssignment = await db.partnerAssignment.findFirst({
      where: {
        leadId: id,
        partnerId: data.partnerId,
        status: { in: ['PENDING', 'IN_PROGRESS'] },
      },
    });

    if (existingAssignment) {
      return NextResponse.json(
        { error: 'Lead is already assigned to this partner' },
        { status: 400 }
      );
    }

    // Create assignment
    const assignment = await db.partnerAssignment.create({
      data: {
        leadId: id,
        partnerId: data.partnerId,
        assignedById: session.user.id,
        notes: data.notes,
        status: 'PENDING',
      },
      include: {
        partner: {
          select: { companyName: true },
        },
      },
    });

    // Create audit log
    await db.auditLog.create({
      data: {
        action: 'LEAD_ASSIGNED',
        entityType: 'LEAD',
        entityId: id,
        userId: session.user.id,
        newValues: {
          partnerId: data.partnerId,
          partnerName: partner.companyName,
          assignmentId: assignment.id,
        },
      },
    });

    return NextResponse.json(assignment, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error('Error assigning partner:', error);
    return NextResponse.json(
      { error: 'Failed to assign partner' },
      { status: 500 }
    );
  }
}

// GET - Get partner assignments for a lead
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession();

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  const assignments = await db.partnerAssignment.findMany({
    where: { leadId: id },
    include: {
      partner: {
        select: { id: true, name: true, companyName: true },
      },
      assignedBy: {
        select: { id: true, name: true },
      },
    },
    orderBy: { assignedAt: 'desc' },
  });

  return NextResponse.json(assignments);
}
