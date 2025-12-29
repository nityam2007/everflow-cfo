import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getServerSession } from '@/lib/auth-utils';
import { z } from 'zod';

const updateStatusSchema = z.object({
  status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED']),
});

// PATCH - Update assignment status (partner only)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession();

  // Must be authenticated as partner
  if (!session?.user || session.user.userType !== 'partner') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  try {
    const body = await request.json();
    const data = updateStatusSchema.parse(body);

    // Verify the assignment belongs to this partner
    const assignment = await db.partnerAssignment.findFirst({
      where: {
        id,
        partnerId: session.user.id,
      },
    });

    if (!assignment) {
      return NextResponse.json(
        { error: 'Assignment not found' },
        { status: 404 }
      );
    }

    // Update status
    const updated = await db.partnerAssignment.update({
      where: { id },
      data: {
        status: data.status,
        completedAt: data.status === 'COMPLETED' ? new Date() : null,
      },
    });

    // Create audit log
    await db.auditLog.create({
      data: {
        action: 'LEAD_STATUS_CHANGED',
        entityType: 'PARTNER_ASSIGNMENT',
        entityId: id,
        partnerId: session.user.id,
        oldValues: { status: assignment.status },
        newValues: { status: data.status },
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error('Error updating assignment status:', error);
    return NextResponse.json(
      { error: 'Failed to update status' },
      { status: 500 }
    );
  }
}
