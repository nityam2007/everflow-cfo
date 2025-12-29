import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getServerSession } from '@/lib/auth-utils';
import { z } from 'zod';
import { isValidId, sanitizeString, secureJsonResponse, secureErrorResponse } from '@/lib/security';

const assignPartnerSchema = z.object({
  partnerId: z.string().min(1, 'Partner ID is required'),
  notes: z.string().max(2000).optional(),
});

// POST - Assign a partner to a lead
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession();

  if (!session?.user || !['ADMIN', 'STAFF'].includes(session.user.role)) {
    return secureErrorResponse('Unauthorized', 401);
  }

  const { id } = await params;

  // Validate ID format
  if (!isValidId(id)) {
    return secureErrorResponse('Invalid lead ID', 400);
  }

  try {
    const body = await request.json();
    const data = assignPartnerSchema.parse(body);

    // Validate partner ID format
    if (!isValidId(data.partnerId)) {
      return secureErrorResponse('Invalid partner ID', 400);
    }

    // Check if lead exists
    const lead = await db.lead.findUnique({
      where: { id },
      select: { id: true, companyName: true },
    });

    if (!lead) {
      return secureErrorResponse('Lead not found', 404);
    }

    // Check if partner exists and is active
    const partner = await db.partner.findUnique({
      where: { id: data.partnerId },
      select: { id: true, companyName: true, isActive: true },
    });

    if (!partner) {
      return secureErrorResponse('Partner not found', 404);
    }

    if (!partner.isActive) {
      return secureErrorResponse('Cannot assign to inactive partner', 400);
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
      return secureErrorResponse('Lead is already assigned to this partner', 400);
    }

    // Sanitize notes if provided
    const sanitizedNotes = data.notes ? sanitizeString(data.notes) : undefined;

    // Create assignment
    const assignment = await db.partnerAssignment.create({
      data: {
        leadId: id,
        partnerId: data.partnerId,
        assignedById: session.user.id,
        notes: sanitizedNotes,
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

    return secureJsonResponse(assignment, 201);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return secureErrorResponse(error.errors[0].message, 400);
    }

    console.error('Error assigning partner:', error);
    return secureErrorResponse('Failed to assign partner', 500);
  }
}

// GET - Get partner assignments for a lead
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession();

  if (!session?.user) {
    return secureErrorResponse('Unauthorized', 401);
  }

  const { id } = await params;

  // Validate ID format
  if (!isValidId(id)) {
    return secureErrorResponse('Invalid lead ID', 400);
  }

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

  return secureJsonResponse(assignments);
}
