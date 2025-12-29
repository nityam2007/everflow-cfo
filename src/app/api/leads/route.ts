import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { cache } from '@/lib/redis';
import { leadSubmissionSchema } from '@/lib/validations';
import { calculateEstimate, CURRENT_RULES_VERSION } from '@/lib/estimation-engine';
import {
  sanitizeString,
  sanitizeEmail,
  sanitizePhone,
  getClientIP,
  secureJsonResponse,
  secureErrorResponse,
  rateLimits,
  hashForLogging,
} from '@/lib/security';

export async function POST(request: NextRequest) {
  try {
    // Get real client IP with proxy support
    const ip = getClientIP(request);
    const ipHash = hashForLogging(ip);
    
    // Rate limiting with configured limits
    const rateKey = `rate:lead:${ip}`;
    const { allowed, remaining } = await cache.rateLimit(
      rateKey, 
      rateLimits.leadSubmission.maxRequests, 
      Math.floor(rateLimits.leadSubmission.windowMs / 1000)
    );

    if (!allowed) {
      console.warn(`[SECURITY] Rate limit exceeded for lead submission: ${ipHash}`);
      const response = secureErrorResponse('Rate limit exceeded. Please try again later.', 429);
      response.headers.set('X-RateLimit-Remaining', remaining.toString());
      response.headers.set('Retry-After', Math.floor(rateLimits.leadSubmission.windowMs / 1000).toString());
      return response;
    }

    const body = await request.json();
    const parsed = leadSubmissionSchema.safeParse(body);

    if (!parsed.success) {
      return secureErrorResponse('Invalid input', 400);
    }

    const { estimator, identity, source } = parsed.data;

    // Sanitize all user inputs before storing
    const sanitizedIdentity = {
      companyName: sanitizeString(identity.companyName),
      contactName: sanitizeString(identity.contactName),
      email: sanitizeEmail(identity.email),
      phone: identity.phone ? sanitizePhone(identity.phone) : undefined,
    };

    // Calculate estimate with versioned rules
    const estimation = calculateEstimate(estimator);

    // Auto-create or find existing Partner (client) account
    let partner = await db.partner.findUnique({
      where: { email: sanitizedIdentity.email },
    });

    if (!partner) {
      // Create new client account
      partner = await db.partner.create({
        data: {
          name: sanitizedIdentity.contactName,
          companyName: sanitizedIdentity.companyName,
          email: sanitizedIdentity.email,
          phone: sanitizedIdentity.phone,
          isActive: true,
        },
      });
    }

    // Create lead linked to client account
    const lead = await db.lead.create({
      data: {
        companyName: sanitizedIdentity.companyName,
        contactName: sanitizedIdentity.contactName,
        email: sanitizedIdentity.email,
        phone: sanitizedIdentity.phone,
        industry: estimator.industry,
        inputsJson: estimator,
        estimatedMin: estimation.estimatedMin,
        estimatedMax: estimation.estimatedMax,
        creditFlags: estimation.creditFlags,
        eligibility: estimation.eligibility,
        rulesVersion: estimation.rulesVersion,
        explanations: estimation.explanations,
        source: sanitizeString(source || 'direct'),
        status: 'NEW',
        partnerId: partner.id, // Link to client account
      },
    });

    // Create audit log (don't store raw IP for privacy)
    await db.auditLog.create({
      data: {
        action: 'LEAD_CREATED',
        entityType: 'lead',
        entityId: lead.id,
        leadId: lead.id,
        newValues: { 
          source: sanitizeString(source || 'direct'), 
          ipHash,
          rulesVersion: estimation.rulesVersion,
          creditFlags: estimation.creditFlags,
        },
      },
    });

    return secureJsonResponse({ leadId: lead.id }, 201);
  } catch (error) {
    console.error('Lead creation error:', error);
    return secureErrorResponse('Internal server error', 500);
  }
}
