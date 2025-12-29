import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { cache } from '@/lib/redis';
import { leadSubmissionSchema } from '@/lib/validations';
import { calculateEstimate, CURRENT_RULES_VERSION } from '@/lib/estimation-engine';

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    const rateKey = `rate:lead:${ip}`;
    const { allowed, remaining } = await cache.rateLimit(rateKey, 10, 3600); // 10 per hour

    if (!allowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { status: 429, headers: { 'X-RateLimit-Remaining': remaining.toString() } }
      );
    }

    const body = await request.json();
    const parsed = leadSubmissionSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { estimator, identity, source } = parsed.data;

    // Calculate estimate with versioned rules
    const estimation = calculateEstimate(estimator);

    // Create lead with rules version for auditability
    const lead = await db.lead.create({
      data: {
        companyName: identity.companyName,
        contactName: identity.contactName,
        email: identity.email.toLowerCase(),
        phone: identity.phone,
        industry: estimator.industry,
        inputsJson: estimator,
        estimatedMin: estimation.estimatedMin,
        estimatedMax: estimation.estimatedMax,
        creditFlags: estimation.creditFlags,
        eligibility: estimation.eligibility,
        rulesVersion: estimation.rulesVersion,
        explanations: estimation.explanations,
        source: source || 'direct',
        status: 'NEW',
      },
    });

    // Create audit log
    await db.auditLog.create({
      data: {
        action: 'LEAD_CREATED',
        entityType: 'lead',
        entityId: lead.id,
        leadId: lead.id,
        newValues: { 
          source, 
          ip,
          rulesVersion: estimation.rulesVersion,
          creditFlags: estimation.creditFlags,
        },
      },
    });

    return NextResponse.json({ leadId: lead.id }, { status: 201 });
  } catch (error) {
    console.error('Lead creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
