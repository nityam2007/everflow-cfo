import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { getServerSession } from '@/lib/auth-utils';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import {
  strongPasswordSchema,
  sanitizeEmail,
  sanitizeString,
  secureJsonResponse,
  secureErrorResponse,
} from '@/lib/security';

const createUserSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email address').max(255),
  password: strongPasswordSchema,
  role: z.enum(['ADMIN', 'STAFF']),
});

// GET - List all users (admin only)
export async function GET() {
  const session = await getServerSession();

  if (!session?.user || session.user.role !== 'ADMIN') {
    return secureErrorResponse('Unauthorized', 401);
  }

  const users = await db.user.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      createdAt: true,
    },
  });

  return secureJsonResponse(users);
}

// POST - Create new user (admin only)
export async function POST(request: NextRequest) {
  const session = await getServerSession();

  if (!session?.user || session.user.role !== 'ADMIN') {
    return secureErrorResponse('Unauthorized', 401);
  }

  try {
    const body = await request.json();
    const data = createUserSchema.parse(body);

    // Sanitize inputs
    const sanitizedEmail = sanitizeEmail(data.email);
    const sanitizedName = sanitizeString(data.name);

    // Check if email already exists
    const existingUser = await db.user.findUnique({
      where: { email: sanitizedEmail },
    });

    if (existingUser) {
      return secureErrorResponse('A user with this email already exists', 400);
    }

    // Hash password with high cost factor
    const hashedPassword = await bcrypt.hash(data.password, 12);

    // Create user (using correct field name from schema)
    const user = await db.user.create({
      data: {
        name: sanitizedName,
        email: sanitizedEmail,
        password: hashedPassword,
        role: data.role,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    // Create audit log
    await db.auditLog.create({
      data: {
        action: 'USER_CREATED',
        entityType: 'USER',
        entityId: user.id,
        userId: session.user.id,
        newValues: {
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
    });

    return secureJsonResponse(user, 201);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return secureErrorResponse(error.errors[0].message, 400);
    }

    console.error('Error creating user:', error);
    return secureErrorResponse('Failed to create user', 500);
  }
}
