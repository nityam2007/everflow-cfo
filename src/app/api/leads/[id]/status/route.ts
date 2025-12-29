import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { z } from 'zod';
import { isValidId, secureJsonResponse, secureErrorResponse } from '@/lib/security';

const statusSchema = z.object({
  status: z.enum(['NEW', 'ASSIGNED', 'IN_PROGRESS', 'CLOSED', 'LOST']),
});

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user) {
      return secureErrorResponse('Unauthorized', 401);
    }

    const { id } = await params;
    
    // Validate ID format
    if (!isValidId(id)) {
      return secureErrorResponse('Invalid lead ID', 400);
    }

    const body = await request.json();
    const parsed = statusSchema.safeParse(body);

    if (!parsed.success) {
      return secureErrorResponse('Invalid status', 400);
    }

    const { status } = parsed.data;

    // Check if user has access to this lead
    const lead = await db.lead.findUnique({
      where: { id },
      select: { id: true, status: true, assignedStaffId: true, partnerId: true },
    });

    if (!lead) {
      return secureErrorResponse('Lead not found', 404);
    }

    // Staff can only update their assigned leads
    if (session.user.role === 'STAFF' && lead.assignedStaffId !== session.user.id) {
      return secureErrorResponse('Forbidden', 403);
    }

    const oldStatus = lead.status;

    // Update lead
    await db.lead.update({
      where: { id },
      data: { status },
    });

    // Audit log
    await db.auditLog.create({
      data: {
        action: 'LEAD_STATUS_CHANGED',
        entityType: 'lead',
        entityId: id,
        leadId: id,
        userId: session.user.id,
        oldValues: { status: oldStatus },
        newValues: { status },
      },
    });

    // Invalidate caches
    const { cache } = await import('@/lib/redis');
    await cache.invalidateLead(id, lead.partnerId || undefined);

    return secureJsonResponse({ success: true });
  } catch (error) {
    console.error('Status update error:', error);
    return secureErrorResponse('Internal server error', 500);
  }
}
