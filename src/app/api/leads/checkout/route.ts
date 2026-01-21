import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { cache } from '@/lib/redis';
import { sanitizeHtml, sanitizeEmail, sanitizePhone, getClientIP, secureJsonResponse, secureErrorResponse, rateLimits, hashForLogging } from '@/lib/security';
import { PAID_PRODUCT_KEYS } from '@/lib/stripe';

// Redis-based rate limiting for checkout
async function checkRateLimit(ip: string): Promise<{ allowed: boolean; remaining: number }> {
  const key = `rate:checkout:${ip}`;
  return cache.rateLimit(key, rateLimits.checkout.maxRequests, Math.floor(rateLimits.checkout.windowMs / 1000));
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting with Redis
    const ip = getClientIP(request);
    const ipHash = hashForLogging(ip);
    const { allowed, remaining } = await checkRateLimit(ip);
    
    if (!allowed) {
      console.warn(`[SECURITY] Rate limit exceeded for checkout: ${ipHash}`);
      const response = secureErrorResponse('Too many requests. Please try again later.', 429);
      response.headers.set('X-RateLimit-Remaining', remaining.toString());
      response.headers.set('Retry-After', Math.floor(rateLimits.checkout.windowMs / 1000).toString());
      return response;
    }

    const body = await request.json();
    const { amount } = body;
    
    // Sanitize all inputs
    const name = sanitizeHtml(body.name || '');
    const email = sanitizeEmail(body.email || '');
    const phone = sanitizePhone(body.phone || '');
    const companyName = sanitizeHtml(body.companyName || '');
    const productKey = sanitizeHtml(body.productKey || '');
    const productName = sanitizeHtml(body.productName || '');

    // Validate required fields
    if (!name || !email || !phone) {
      return secureErrorResponse('Name, email, and phone are required', 400);
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return secureErrorResponse('Invalid email format', 400);
    }

    // Validate productKey against allowed PAID products (v5.0.1)
    if (!(PAID_PRODUCT_KEYS as readonly string[]).includes(productKey)) {
      console.warn(`[SECURITY] Invalid product key attempted: ${productKey} from ${ipHash}`);
      return secureErrorResponse('Invalid product', 400);
    }

    // Determine product type for database
    const productTypeMapping: Record<string, string> = {
      'FINANCIAL_MODELING': 'FINANCIAL_MODELING',
      'SERIES_A_STACK': 'SERIES_A_STACK',
      'DUE_DILIGENCE': 'DUE_DILIGENCE',
      'TAX_COMPLIANCE': 'TAX_COMPLIANCE',
      'INDIVIDUAL_TAX': 'INDIVIDUAL_TAX',
    };
    
    const productType = productTypeMapping[productKey] || 'OTHER';
    
    // Determine lead source from product
    const leadSourceMapping: Record<string, string> = {
      'FINANCIAL_MODELING': 'CAPITAL',
      'SERIES_A_STACK': 'CAPITAL',
      'DUE_DILIGENCE': 'CAPITAL',
      'TAX_COMPLIANCE': 'TAX_BUSINESS',
      'INDIVIDUAL_TAX': 'TAX_INDIVIDUAL',
    };
    
    const leadSource = leadSourceMapping[productKey] || 'DIRECT';

    // Check for existing partner with this email
    let partner = await db.partner.findUnique({
      where: { email },
    });

    // Create or update partner
    if (partner) {
      partner = await db.partner.update({
        where: { email },
        data: {
          name,
          phone,
          companyName: companyName || partner.companyName,
          stripePaymentStatus: 'pending',
          stripeProductKey: productKey,
          stripeAmount: Math.round(amount * 100), // Convert to cents
        },
      });
    } else {
      partner = await db.partner.create({
        data: {
          name,
          email,
          phone,
          companyName: companyName || name,
          stripePaymentStatus: 'pending',
          stripeProductKey: productKey,
          stripeAmount: Math.round(amount * 100),
          isActive: true,
        },
      });
    }

    const finalCompanyName = companyName || name;

    // Upsert lead - update if exists, create if not
    const existingLead = await db.lead.findFirst({
      where: {
        email,
        companyName: finalCompanyName,
      },
    });

    let lead;
    if (existingLead) {
      // Update existing lead
      lead = await db.lead.update({
        where: { id: existingLead.id },
        data: {
          contactName: name,
          phone,
          status: 'NEW',
          source: `Checkout - ${productName}`,
          partnerId: partner.id,
          productType: productType as 'FINANCIAL_MODELING' | 'SERIES_A_STACK' | 'DUE_DILIGENCE' | 'TAX_COMPLIANCE' | 'INDIVIDUAL_TAX' | 'MANAGED_BACK_OFFICE' | 'FRACTIONAL_CFO' | 'RD_CREDIT' | 'FICA_TIP_CREDIT' | 'WOTC_CREDIT' | 'ESTIMATOR' | 'OTHER',
          leadSource: leadSource as 'DIRECT' | 'ESTIMATOR' | 'TAX_BUSINESS' | 'TAX_INDIVIDUAL' | 'CREDITS_RD' | 'CREDITS_FICA' | 'CREDITS_WOTC' | 'CAPITAL' | 'REFERRAL' | 'OTHER',
          isLeadOnly: false,
          isPaid: false, // Will be set to true after successful payment
          paidAmount: Math.round(amount * 100),
          inputsJson: {
            productKey,
            productName,
            amount,
            checkoutStartedAt: new Date().toISOString(),
          },
          creditFlags: [productKey],
          explanations: [`Purchase intent: ${productName}`],
          priority: getPriorityFromProduct(productKey),
        },
      });
    } else {
      // Create new lead
      lead = await db.lead.create({
        data: {
          companyName: finalCompanyName,
          contactName: name,
          email,
          phone,
          status: 'NEW',
          source: `Checkout - ${productName}`,
          partnerId: partner.id,
          productType: productType as 'FINANCIAL_MODELING' | 'SERIES_A_STACK' | 'DUE_DILIGENCE' | 'TAX_COMPLIANCE' | 'INDIVIDUAL_TAX' | 'MANAGED_BACK_OFFICE' | 'FRACTIONAL_CFO' | 'RD_CREDIT' | 'FICA_TIP_CREDIT' | 'WOTC_CREDIT' | 'ESTIMATOR' | 'OTHER',
          leadSource: leadSource as 'DIRECT' | 'ESTIMATOR' | 'TAX_BUSINESS' | 'TAX_INDIVIDUAL' | 'CREDITS_RD' | 'CREDITS_FICA' | 'CREDITS_WOTC' | 'CAPITAL' | 'REFERRAL' | 'OTHER',
          isLeadOnly: false,
          isPaid: false,
          paidAmount: Math.round(amount * 100),
          inputsJson: {
            productKey,
            productName,
            amount,
            checkoutStartedAt: new Date().toISOString(),
          },
          estimatedMin: 0,
          estimatedMax: 0,
          creditFlags: [productKey],
          eligibility: 'MODERATE',
          rulesVersion: '1.0.0',
          explanations: [`Purchase intent: ${productName}`],
          priority: getPriorityFromProduct(productKey),
        },
      });
    }

    // Create audit log
    await db.auditLog.create({
      data: {
        action: 'CHECKOUT_STARTED',
        entityType: 'lead',
        entityId: lead.id,
        leadId: lead.id,
        newValues: { 
          productKey, 
          productName, 
          amount, 
          ipHash,
          productType,
          leadSource,
        },
      },
    });

    // Invalidate caches
    await Promise.all([
      cache.invalidateDashboard(),
      cache.invalidatePartner(partner.id),
    ]);

    return secureJsonResponse({
      success: true,
      leadId: lead.id,
      partnerId: partner.id,
      customerName: name,
      customerEmail: email,
      customerPhone: phone,
      productType,
    });
  } catch (error) {
    console.error('Error creating checkout lead:', error);
    return secureErrorResponse('Failed to create lead', 500);
  }
}

/**
 * Helper: Get priority from product type (paid products = higher priority)
 */
function getPriorityFromProduct(productKey: string): number {
  const highPriority = ['SERIES_A_STACK', 'TAX_COMPLIANCE', 'INDIVIDUAL_TAX'];
  const urgentPriority = ['DUE_DILIGENCE'];
  
  if (urgentPriority.includes(productKey)) return 2;
  if (highPriority.includes(productKey)) return 1;
  return 0;
}
