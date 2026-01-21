import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth } from '@/lib/auth-utils';
import { rulesV1_0_0 } from '@/lib/rules/estimator-rules';
import { sanitizeString, secureJsonResponse, secureErrorResponse } from '@/lib/security';

// GET /api/rules - List all rules versions or get active
export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth();
    if (!session) {
      return secureErrorResponse('Unauthorized', 401);
    }

    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get('active') === 'true';
    const version = searchParams.get('version');

    if (version) {
      // Sanitize version string to prevent injection
      const sanitizedVersion = sanitizeString(version).substring(0, 20);
      
      // Get specific version
      const rules = await db.estimatorRules.findUnique({
        where: { version: sanitizedVersion },
        include: { createdBy: { select: { id: true, name: true, email: true } } }
      });
      
      if (!rules) {
        return secureErrorResponse('Rules version not found', 404);
      }
      
      return secureJsonResponse(rules);
    }

    if (activeOnly) {
      // Get active rules only
      const activeRules = await db.estimatorRules.findFirst({
        where: { isActive: true },
        include: { createdBy: { select: { id: true, name: true, email: true } } }
      });
      
      return secureJsonResponse(activeRules);
    }

    // Get all rules
    const allRules = await db.estimatorRules.findMany({
      orderBy: { createdAt: 'desc' },
      include: { createdBy: { select: { id: true, name: true, email: true } } }
    });

    return secureJsonResponse(allRules);
  } catch (error) {
    console.error('Error fetching rules:', error);
    return secureErrorResponse('Failed to fetch rules', 500);
  }
}

// POST /api/rules - Create new rules version (Admin only)
export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth();
    if (!session || session.user.role !== 'ADMIN') {
      return secureErrorResponse('Admin access required', 403);
    }

    const body = await request.json();
    const { version, effectiveDate, description, rulesConfig, setActive } = body;

    if (!version || !effectiveDate || !rulesConfig) {
      return secureErrorResponse('Version, effectiveDate, and rulesConfig are required', 400);
    }

    // Sanitize inputs
    const sanitizedVersion = sanitizeString(version).substring(0, 20);
    const sanitizedDescription = description ? sanitizeString(description).substring(0, 500) : undefined;

    // Check if version already exists
    const existing = await db.estimatorRules.findUnique({
      where: { version: sanitizedVersion }
    });

    if (existing) {
      return secureErrorResponse(`Rules version ${sanitizedVersion} already exists`, 409);
    }

    // If setting as active, deactivate all other rules first
    if (setActive) {
      await db.estimatorRules.updateMany({
        where: { isActive: true },
        data: { isActive: false }
      });
    }

    const newRules = await db.estimatorRules.create({
      data: {
        version: sanitizedVersion,
        effectiveDate: new Date(effectiveDate),
        description: sanitizedDescription,
        rulesConfig,
        isActive: setActive || false,
        createdById: session.user.id
      },
      include: { createdBy: { select: { id: true, name: true, email: true } } }
    });

    // Audit log
    await db.auditLog.create({
      data: {
        action: 'CREATE_RULES',
        entityType: 'estimator_rules',
        entityId: newRules.id,
        newValues: { version: sanitizedVersion, isActive: newRules.isActive },
        userId: session.user.id
      }
    });

    return secureJsonResponse(newRules, 201);
  } catch (error) {
    console.error('Error creating rules:', error);
    return secureErrorResponse('Failed to create rules', 500);
  }
}

// Helper function to seed default rules if none exist
// This function should be called from seed scripts, not exported from route
// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function seedDefaultRules() {
  const existingRules = await db.estimatorRules.findFirst();
  
  if (!existingRules) {
    await db.estimatorRules.create({
      data: {
        version: '1.0.0',
        effectiveDate: new Date('2025-12-29'),
        description: 'Initial conservative estimation rules based on statutory limits',
        isActive: true,
        rulesConfig: JSON.parse(JSON.stringify({
          employeeRanges: rulesV1_0_0.employeeRanges,
          payrollRanges: rulesV1_0_0.payrollRanges,
          credits: rulesV1_0_0.credits
        }))
      }
    });
  }
}
