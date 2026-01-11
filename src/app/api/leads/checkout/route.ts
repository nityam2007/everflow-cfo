import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sanitizeHtml, sanitizeEmail, sanitizePhone } from '@/lib/security';

// Simple in-memory rate limiting for checkout (10 requests per IP per hour)
const checkoutRateLimit = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const record = checkoutRateLimit.get(ip);
  
  if (!record || now > record.resetAt) {
    checkoutRateLimit.set(ip, { count: 1, resetAt: now + 3600000 }); // 1 hour
    return false;
  }
  
  if (record.count >= 10) {
    return true;
  }
  
  record.count++;
  return false;
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 
               request.headers.get('x-real-ip') || 
               'unknown';
    
    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    let { name, email, phone, companyName, productKey, productName, amount } = body;

    // Sanitize all inputs
    name = sanitizeHtml(name || '');
    email = sanitizeEmail(email || '');
    phone = sanitizePhone(phone || '');
    companyName = sanitizeHtml(companyName || '');
    productKey = sanitizeHtml(productKey || '');
    productName = sanitizeHtml(productName || '');

    // Validate required fields
    if (!name || !email || !phone) {
      return NextResponse.json(
        { error: 'Name, email, and phone are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Validate productKey against allowed products
    const validProductKeys = [
      'FINANCIAL_MODELING', 'SERIES_A_STACK', 'DUE_DILIGENCE',
      'TAX_COMPLIANCE', 'MANAGED_BACK_OFFICE', 'FRACTIONAL_CFO'
    ];
    if (!validProductKeys.includes(productKey)) {
      return NextResponse.json(
        { error: 'Invalid product' },
        { status: 400 }
      );
    }

    // Validate required fields
    if (!name || !email || !phone) {
      return NextResponse.json(
        { error: 'Name, email, and phone are required' },
        { status: 400 }
      );
    }

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
          inputsJson: {
            productKey,
            productName,
            amount,
            checkoutStartedAt: new Date().toISOString(),
          },
          creditFlags: [productKey],
          explanations: [`Purchase intent: ${productName}`],
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
        },
      });
    }

    return NextResponse.json({
      success: true,
      leadId: lead.id,
      partnerId: partner.id,
      customerName: name,
      customerEmail: email,
      customerPhone: phone,
    });
  } catch (error) {
    console.error('Error creating checkout lead:', error);
    return NextResponse.json(
      { error: 'Failed to create lead' },
      { status: 500 }
    );
  }
}
