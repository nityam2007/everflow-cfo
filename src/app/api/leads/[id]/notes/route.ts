import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { z } from 'zod';
import { sanitizeString, isValidId, secureJsonResponse, secureErrorResponse } from '@/lib/security';

const noteSchema = z.object({
  content: z.string().min(1).max(10000),
});

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(request: NextRequest, { params }: RouteParams) {
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
    const parsed = noteSchema.safeParse(body);

    if (!parsed.success) {
      return secureErrorResponse('Content is required', 400);
    }

    // Sanitize content
    const content = sanitizeString(parsed.data.content);

    // Check if user has access to this lead
    const lead = await db.lead.findUnique({
      where: { id },
      select: { id: true, assignedStaffId: true },
    });

    if (!lead) {
      return secureErrorResponse('Lead not found', 404);
    }

    // Staff can only add notes to their assigned leads
    if (session.user.role === 'STAFF' && lead.assignedStaffId !== session.user.id) {
      return secureErrorResponse('Forbidden', 403);
    }

    // Create note
    const note = await db.leadNote.create({
      data: {
        content,
        leadId: id,
        userId: session.user.id,
      },
    });

    // Audit log
    await db.auditLog.create({
      data: {
        action: 'NOTE_ADDED',
        entityType: 'lead_note',
        entityId: note.id,
        leadId: id,
        userId: session.user.id,
        newValues: { contentPreview: content.slice(0, 100) },
      },
    });

    return secureJsonResponse({ success: true, noteId: note.id }, 201);
  } catch (error) {
    console.error('Note creation error:', error);
    return secureErrorResponse('Internal server error', 500);
  }
}
