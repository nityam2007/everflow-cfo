import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { cache } from '@/lib/redis';
import { productLeadSchema } from '@/lib/validations';
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
import { LEAD_ONLY_PRODUCT_KEYS } from '@/lib/stripe';

/**
 * POST /api/leads/inquiry
 * Handles lead-only submissions (R&D Credit, Managed Back Office, Fractional CFO)
 * No payment required - just captures lead info for follow-up
 */
export async function POST(request: NextRequest) {
  try {
    // Get real client IP with proxy support
    const ip = getClientIP(request);
    const ipHash = hashForLogging(ip);
    
    // Rate limiting
    const rateKey = `rate:inquiry:${ip}`;
    const { allowed, remaining } = await cache.rateLimit(
      rateKey, 
      rateLimits.leadSubmission.maxRequests, 
      Math.floor(rateLimits.leadSubmission.windowMs / 1000)
    );

    if (!allowed) {
      console.warn(`[SECURITY] Rate limit exceeded for inquiry: ${ipHash}`);
      const response = secureErrorResponse('Rate limit exceeded. Please try again later.', 429);
      response.headers.set('X-RateLimit-Remaining', remaining.toString());
      return response;
    }

    const body = await request.json();
    const parsed = productLeadSchema.safeParse(body);

    if (!parsed.success) {
      console.error('Inquiry validation error:', parsed.error.errors);
      return secureErrorResponse('Invalid input', 400);
    }

    const { identity, estimator, source, productType } = parsed.data;

    // Validate this is a lead-only product
    // Cast to string for comparison since productTypes schema is wider than ProductKey
    if (!LEAD_ONLY_PRODUCT_KEYS.includes(productType as typeof LEAD_ONLY_PRODUCT_KEYS[number])) {
      return secureErrorResponse('This product requires payment. Please use the checkout flow.', 400);
    }

    // Sanitize all user inputs
    const sanitizedIdentity = {
      companyName: sanitizeString(identity.companyName || 'Individual'),
      contactName: sanitizeString(identity.contactName),
      email: sanitizeEmail(identity.email),
      phone: identity.phone ? sanitizePhone(identity.phone) : undefined,
    };

    // Determine lead source from product type
    const leadSourceMap: Record<string, string> = {
      MANAGED_BACK_OFFICE: 'TAX_BUSINESS',
      FRACTIONAL_CFO: 'TAX_BUSINESS',
      RD_CREDIT: 'CREDITS_RD',
      FICA_TIP_CREDIT: 'CREDITS_FICA',
      WOTC_CREDIT: 'CREDITS_WOTC',
    };
    const leadSource = leadSourceMap[productType] || 'DIRECT';

    // Determine credit flags from product type
    const creditFlagsMap: Record<string, string[]> = {
      RD_CREDIT: ['RD'],
      FICA_TIP_CREDIT: ['TIP'],
      WOTC_CREDIT: ['WOTC'],
    };
    const creditFlags = creditFlagsMap[productType] || [];

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

    // Create lead as lead-only (no payment required)
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
        isLeadOnly: true,
        isPaid: false,
        estimatedMin: 0,
        estimatedMax: 0,
        creditFlags,
        eligibility: 'MODERATE',
        rulesVersion: '5.0.1',
        source: sanitizeString(source || 'direct'),
        status: 'NEW',
        priority: getInquiryPriority(productType),
        partnerId: partner.id,
      },
    });

    // Create audit log
    await db.auditLog.create({
      data: {
        action: 'INQUIRY_CREATED',
        entityType: 'lead',
        entityId: lead.id,
        leadId: lead.id,
        newValues: { 
          source: sanitizeString(source || 'direct'), 
          ipHash,
          productType,
          leadSource,
          isLeadOnly: true,
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
      productType,
      message: 'Inquiry submitted successfully. Our team will contact you within 24-48 hours.',
    }, 201);
  } catch (error) {
    console.error('Inquiry creation error:', error);
    return secureErrorResponse('Internal server error', 500);
  }
}

/**
 * Helper: Get priority for inquiry products
 */
function getInquiryPriority(productType: string): number {
  // R&D Credit is high priority (potential high value)
  if (productType === 'RD_CREDIT') return 1;
  // Fractional CFO is medium priority (recurring revenue)
  if (productType === 'FRACTIONAL_CFO') return 1;
  // Others are normal priority
  return 0;
}
