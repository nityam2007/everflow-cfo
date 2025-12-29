import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { z } from 'zod';

const assignSchema = z.object({
  staffId: z.string(),
});

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const parsed = assignSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid staff ID' }, { status: 400 });
    }

    const { staffId } = parsed.data;

    // Verify lead exists
    const lead = await db.lead.findUnique({
      where: { id },
      select: { id: true, assignedStaffId: true },
    });

    if (!lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }

    // Verify staff exists
    const staff = await db.user.findUnique({
      where: { id: staffId },
      select: { id: true, name: true },
    });

    if (!staff) {
      return NextResponse.json({ error: 'Staff not found' }, { status: 404 });
    }

    const oldStaffId = lead.assignedStaffId;

    // Update lead
    await db.lead.update({
      where: { id },
      data: {
        assignedStaffId: staffId,
        assignedAt: new Date(),
        status: lead.assignedStaffId ? undefined : 'ASSIGNED',
      },
    });

    // Audit log
    await db.auditLog.create({
      data: {
        action: 'LEAD_ASSIGNED',
        entityType: 'lead',
        entityId: id,
        leadId: id,
        userId: session.user.id,
        newValues: { oldStaffId, newStaffId: staffId, staffName: staff.name },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Assignment error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
