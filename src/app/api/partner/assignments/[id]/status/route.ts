import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { getServerSession } from '@/lib/auth-utils';
import { z } from 'zod';
import { isValidId, secureJsonResponse, secureErrorResponse } from '@/lib/security';

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
    return secureErrorResponse('Unauthorized', 401);
  }

  const { id } = await params;

  // Validate ID format
  if (!isValidId(id)) {
    return secureErrorResponse('Invalid assignment ID', 400);
  }

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
      return secureErrorResponse('Assignment not found', 404);
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

    return secureJsonResponse(updated);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return secureErrorResponse(error.errors[0].message, 400);
    }

    console.error('Error updating assignment status:', error);
    return secureErrorResponse('Failed to update status', 500);
  }
}
