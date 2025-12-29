import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth } from '@/lib/auth-utils';
import { rulesV1_0_0 } from '@/lib/rules/estimator-rules';

// GET /api/rules - List all rules versions or get active
export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get('active') === 'true';
    const version = searchParams.get('version');

    if (version) {
      // Get specific version
      const rules = await db.estimatorRules.findUnique({
        where: { version },
        include: { createdBy: { select: { id: true, name: true, email: true } } }
      });
      
      if (!rules) {
        return NextResponse.json({ error: 'Rules version not found' }, { status: 404 });
      }
      
      return NextResponse.json(rules);
    }

    if (activeOnly) {
      // Get active rules only
      const activeRules = await db.estimatorRules.findFirst({
        where: { isActive: true },
        include: { createdBy: { select: { id: true, name: true, email: true } } }
      });
      
      return NextResponse.json(activeRules);
    }

    // Get all rules
    const allRules = await db.estimatorRules.findMany({
      orderBy: { createdAt: 'desc' },
      include: { createdBy: { select: { id: true, name: true, email: true } } }
    });

    return NextResponse.json(allRules);
  } catch (error) {
    console.error('Error fetching rules:', error);
    return NextResponse.json({ error: 'Failed to fetch rules' }, { status: 500 });
  }
}

// POST /api/rules - Create new rules version (Admin only)
export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth();
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const body = await request.json();
    const { version, effectiveDate, description, rulesConfig, setActive } = body;

    if (!version || !effectiveDate || !rulesConfig) {
      return NextResponse.json(
        { error: 'Version, effectiveDate, and rulesConfig are required' },
        { status: 400 }
      );
    }

    // Check if version already exists
    const existing = await db.estimatorRules.findUnique({
      where: { version }
    });

    if (existing) {
      return NextResponse.json(
        { error: `Rules version ${version} already exists` },
        { status: 409 }
      );
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
        version,
        effectiveDate: new Date(effectiveDate),
        description,
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
        newValues: { version, isActive: newRules.isActive },
        userId: session.user.id
      }
    });

    return NextResponse.json(newRules, { status: 201 });
  } catch (error) {
    console.error('Error creating rules:', error);
    return NextResponse.json({ error: 'Failed to create rules' }, { status: 500 });
  }
}

// Helper function to seed default rules if none exist
// Not exported - used internally or from seed script
async function seedDefaultRules() {
  const existingRules = await db.estimatorRules.findFirst();
  
  if (!existingRules) {
    await db.estimatorRules.create({
      data: {
        version: '1.0.0',
        effectiveDate: new Date('2024-12-01'),
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
