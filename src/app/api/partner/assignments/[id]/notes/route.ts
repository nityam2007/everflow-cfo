import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getServerSession } from '@/lib/auth-utils';
import { z } from 'zod';

const addNoteSchema = z.object({
  content: z.string().min(1, 'Note content is required'),
});

// POST - Add a note to assignment (partner only)
export async function POST(
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
    const data = addNoteSchema.parse(body);

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

    // Create note
    const note = await db.partnerLeadNote.create({
      data: {
        assignmentId: id,
        content: data.content,
      },
    });

    return NextResponse.json(note, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error('Error adding note:', error);
    return NextResponse.json(
      { error: 'Failed to add note' },
      { status: 500 }
    );
  }
}

// GET - Get notes for assignment
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession();

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  // Check access - partner can only see their own, staff/admin can see all
  let assignment;
  
  if (session.user.userType === 'partner') {
    assignment = await db.partnerAssignment.findFirst({
      where: {
        id,
        partnerId: session.user.id,
      },
    });
  } else {
    assignment = await db.partnerAssignment.findUnique({
      where: { id },
    });
  }

  if (!assignment) {
    return NextResponse.json(
      { error: 'Assignment not found' },
      { status: 404 }
    );
  }

  const notes = await db.partnerLeadNote.findMany({
    where: { assignmentId: id },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(notes);
}
