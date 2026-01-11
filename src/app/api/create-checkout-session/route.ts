import { NextRequest, NextResponse } from 'next/server';
import { createCheckoutSession, ProductKey, PRODUCTS } from '@/lib/stripe';
import { sanitizeHtml, sanitizeEmail, sanitizePhone } from '@/lib/security';

// Simple in-memory rate limiting (10 requests per IP per hour)
const sessionRateLimit = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const record = sessionRateLimit.get(ip);
  
  if (!record || now > record.resetAt) {
    sessionRateLimit.set(ip, { count: 1, resetAt: now + 3600000 }); // 1 hour
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

    let { 
      productKey, 
      customerEmail, 
      customerName,
      customerPhone,
      leadId,
      metadata = {}
    } = await request.json();

    // Sanitize inputs
    productKey = sanitizeHtml(productKey || '');
    customerEmail = sanitizeEmail(customerEmail || '');
    customerName = sanitizeHtml(customerName || '');
    customerPhone = sanitizePhone(customerPhone || '');
    leadId = sanitizeHtml(leadId || '');

    if (!productKey) {
      return NextResponse.json(
        { error: 'Product key is required' },
        { status: 400 }
      );
    }

    // Validate productKey against whitelist
    if (!PRODUCTS[productKey as ProductKey]) {
      return NextResponse.json(
        { error: 'Invalid product' },
        { status: 400 }
      );
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const successUrl = `${baseUrl}/payment/success?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${baseUrl}/payment/cancel`;

    const session = await createCheckoutSession(
      productKey as ProductKey,
      successUrl,
      cancelUrl,
      customerEmail,
      {
        leadId: leadId || '',
        customerName: customerName || '',
        customerPhone: customerPhone || '',
        ...metadata,
      }
    );

    return NextResponse.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
