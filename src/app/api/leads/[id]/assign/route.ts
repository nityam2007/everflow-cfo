import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { z } from 'zod';
import { isValidId, secureJsonResponse, secureErrorResponse } from '@/lib/security';

const assignSchema = z.object({
  staffId: z.string().nullable(), // null to unassign
});

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'ADMIN') {
      return secureErrorResponse('Unauthorized', 401);
    }

    const { id } = await params;
    
    // Validate ID format
    if (!isValidId(id)) {
      return secureErrorResponse('Invalid lead ID', 400);
    }

    const body = await request.json();
    const parsed = assignSchema.safeParse(body);

    if (!parsed.success) {
      return secureErrorResponse('Invalid staff ID', 400);
    }

    const { staffId } = parsed.data;

    // Validate staff ID format (if not null)
    if (staffId !== null && !isValidId(staffId)) {
      return secureErrorResponse('Invalid staff ID format', 400);
    }

    // Verify lead exists
    const lead = await db.lead.findUnique({
      where: { id },
      select: { id: true, assignedStaffId: true },
    });

    if (!lead) {
      return secureErrorResponse('Lead not found', 404);
    }

    let staffName = 'Unassigned';

    // Verify staff exists (if assigning)
    if (staffId !== null) {
      const staff = await db.user.findUnique({
        where: { id: staffId },
        select: { id: true, name: true },
      });

      if (!staff) {
        return secureErrorResponse('Staff not found', 404);
      }
      staffName = staff.name;
    }

    const oldStaffId = lead.assignedStaffId;

    // Update lead
    await db.lead.update({
      where: { id },
      data: {
        assignedStaffId: staffId,
        assignedAt: staffId ? new Date() : null,
        // Set to NEW if unassigning, ASSIGNED if assigning to new staff
        status: staffId === null ? 'NEW' : (lead.assignedStaffId ? undefined : 'ASSIGNED'),
      },
    });

    // Audit log
    await db.auditLog.create({
      data: {
        action: staffId === null ? 'LEAD_UNASSIGNED' : 'LEAD_ASSIGNED',
        entityType: 'lead',
        entityId: id,
        leadId: id,
        userId: session.user.id,
        newValues: { oldStaffId, newStaffId: staffId, staffName },
      },
    });

    return secureJsonResponse({ success: true });
  } catch (error) {
    console.error('Assignment error:', error);
    return secureErrorResponse('Internal server error', 500);
  }
}
