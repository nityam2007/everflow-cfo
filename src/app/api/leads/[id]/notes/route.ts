import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { z } from 'zod';

const noteSchema = z.object({
  content: z.string().min(1),
});

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const parsed = noteSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 });
    }

    const { content } = parsed.data;

    // Check if user has access to this lead
    const lead = await db.lead.findUnique({
      where: { id },
      select: { id: true, assignedStaffId: true },
    });

    if (!lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }

    // Staff can only add notes to their assigned leads
    if (session.user.role === 'STAFF' && lead.assignedStaffId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
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
        performedById: session.user.id,
        details: { contentPreview: content.slice(0, 100) },
      },
    });

    return NextResponse.json({ success: true, noteId: note.id }, { status: 201 });
  } catch (error) {
    console.error('Note creation error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
