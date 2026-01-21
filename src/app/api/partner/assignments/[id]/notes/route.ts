import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { getServerSession } from '@/lib/auth-utils';
import { z } from 'zod';
import { isValidId, sanitizeString, secureJsonResponse, secureErrorResponse } from '@/lib/security';

const addNoteSchema = z.object({
  content: z.string().min(1, 'Note content is required').max(10000),
});

// POST - Add a note to assignment (partner only)
export async function POST(
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
    const data = addNoteSchema.parse(body);

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

    // Create note with sanitized content
    const note = await db.partnerLeadNote.create({
      data: {
        assignmentId: id,
        content: sanitizeString(data.content),
      },
    });

    return secureJsonResponse(note, 201);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return secureErrorResponse(error.errors[0].message, 400);
    }

    console.error('Error adding note:', error);
    return secureErrorResponse('Failed to add note', 500);
  }
}

// GET - Get notes for assignment
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
    return secureErrorResponse('Invalid assignment ID', 400);
  }

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
    return secureErrorResponse('Assignment not found', 404);
  }

  const notes = await db.partnerLeadNote.findMany({
    where: { assignmentId: id },
    orderBy: { createdAt: 'desc' },
  });

  return secureJsonResponse(notes);
}
