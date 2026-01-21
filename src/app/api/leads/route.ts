import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { cache } from '@/lib/redis';
import { leadSubmissionSchema, productLeadSchema } from '@/lib/validations';
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
import { isProductPaid } from '@/lib/stripe';

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
    
    // Determine if this is a product lead or estimator lead
    const isProductLead = body.productType && body.productType !== 'ESTIMATOR';
    
    if (isProductLead) {
      // Handle product-specific lead (Tax, Credits, Capital)
      return handleProductLead(body, ipHash);
    } else {
      // Handle legacy estimator lead
      return handleEstimatorLead(body, ipHash);
    }
  } catch (error) {
    console.error('Lead creation error:', error);
    return secureErrorResponse('Internal server error', 500);
  }
}

/**
 * Handle product-specific leads (Tax, Credits, Capital)
 */
async function handleProductLead(body: Record<string, unknown>, ipHash: string) {
  const parsed = productLeadSchema.safeParse(body);

  if (!parsed.success) {
    console.error('Product lead validation error:', parsed.error.errors);
    return secureErrorResponse('Invalid input', 400);
  }

  const { identity, estimator, source, productType, leadOnly } = parsed.data;

  // Sanitize all user inputs
  const sanitizedIdentity = {
    companyName: sanitizeString(identity.companyName || 'Individual'),
    contactName: sanitizeString(identity.contactName),
    email: sanitizeEmail(identity.email),
    phone: identity.phone ? sanitizePhone(identity.phone) : undefined,
  };

  // Determine lead source from product type
  const leadSource = getLeadSourceFromProduct(productType);
  const isLeadOnly = leadOnly || !isProductPaid(productType);

  // Auto-create or find existing Partner (client) account
  let partner = await db.partner.findUnique({
    where: { email: sanitizedIdentity.email },
  });

  if (!partner) {
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

  // Create lead with product info
  const lead = await db.lead.create({
    data: {
      companyName: sanitizedIdentity.companyName,
      contactName: sanitizedIdentity.contactName,
      email: sanitizedIdentity.email,
      phone: sanitizedIdentity.phone,
      industry: (estimator as Record<string, unknown>)?.industry as string || null,
      inputsJson: estimator ? JSON.parse(JSON.stringify(estimator)) : {},
      productType: productType as 'FINANCIAL_MODELING' | 'SERIES_A_STACK' | 'DUE_DILIGENCE' | 'TAX_COMPLIANCE' | 'INDIVIDUAL_TAX' | 'MANAGED_BACK_OFFICE' | 'FRACTIONAL_CFO' | 'RD_CREDIT' | 'FICA_TIP_CREDIT' | 'WOTC_CREDIT' | 'ESTIMATOR' | 'OTHER',
      leadSource: leadSource as 'DIRECT' | 'ESTIMATOR' | 'TAX_BUSINESS' | 'TAX_INDIVIDUAL' | 'CREDITS_RD' | 'CREDITS_FICA' | 'CREDITS_WOTC' | 'CAPITAL' | 'REFERRAL' | 'OTHER',
      isLeadOnly,
      estimatedMin: 0,
      estimatedMax: 0,
      creditFlags: getCreditFlagsFromProduct(productType),
      eligibility: 'MODERATE',
      rulesVersion: CURRENT_RULES_VERSION,
      source: sanitizeString(source || 'direct'),
      status: 'NEW',
      priority: getPriorityFromProduct(productType),
      partnerId: partner.id,
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
        source: sanitizeString(source || 'direct'), 
        ipHash,
        productType,
        leadSource,
        isLeadOnly,
      },
    },
  });

  // Invalidate caches
  await Promise.all([
    cache.invalidateDashboard(),
    cache.invalidatePartner(partner.id),
  ]);

  return secureJsonResponse({ 
    leadId: lead.id,
    isLeadOnly,
    productType,
  }, 201);
}

/**
 * Handle legacy estimator leads
 */
async function handleEstimatorLead(body: Record<string, unknown>, ipHash: string) {
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
      productType: 'ESTIMATOR',
      leadSource: 'ESTIMATOR',
      isLeadOnly: true,
      estimatedMin: estimation.estimatedMin,
      estimatedMax: estimation.estimatedMax,
      creditFlags: estimation.creditFlags,
      eligibility: estimation.eligibility,
      rulesVersion: estimation.rulesVersion,
      explanations: estimation.explanations,
      source: sanitizeString(source || 'direct'),
      status: 'NEW',
      partnerId: partner.id,
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
        source: sanitizeString(source || 'direct'), 
        ipHash,
        rulesVersion: estimation.rulesVersion,
        creditFlags: estimation.creditFlags,
        productType: 'ESTIMATOR',
      },
    },
  });

  // Invalidate caches
  await Promise.all([
    cache.invalidateDashboard(),
    cache.invalidatePartner(partner.id),
  ]);

  return secureJsonResponse({ leadId: lead.id }, 201);
}

/**
 * Helper: Get lead source from product type
 */
function getLeadSourceFromProduct(productType: string): string {
  const mapping: Record<string, string> = {
    FINANCIAL_MODELING: 'CAPITAL',
    SERIES_A_STACK: 'CAPITAL',
    DUE_DILIGENCE: 'CAPITAL',
    TAX_COMPLIANCE: 'TAX_BUSINESS',
    INDIVIDUAL_TAX: 'TAX_INDIVIDUAL',
    MANAGED_BACK_OFFICE: 'TAX_BUSINESS',
    FRACTIONAL_CFO: 'TAX_BUSINESS',
    RD_CREDIT: 'CREDITS_RD',
    FICA_TIP_CREDIT: 'CREDITS_FICA',
    WOTC_CREDIT: 'CREDITS_WOTC',
  };
  return mapping[productType] || 'OTHER';
}

/**
 * Helper: Get credit flags from product type
 */
function getCreditFlagsFromProduct(productType: string): string[] {
  const mapping: Record<string, string[]> = {
    RD_CREDIT: ['RD'],
    FICA_TIP_CREDIT: ['TIP'],
    WOTC_CREDIT: ['WOTC'],
  };
  return mapping[productType] || [];
}

/**
 * Helper: Get priority from product type (paid products = higher priority)
 */
function getPriorityFromProduct(productType: string): number {
  const highPriority = ['SERIES_A_STACK', 'TAX_COMPLIANCE', 'INDIVIDUAL_TAX'];
  const urgentPriority = ['DUE_DILIGENCE'];
  
  if (urgentPriority.includes(productType)) return 2;
  if (highPriority.includes(productType)) return 1;
  return 0;
}
