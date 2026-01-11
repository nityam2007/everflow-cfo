import { NextRequest, NextResponse } from 'next/server';
import { createCheckoutSession, ProductKey } from '@/lib/stripe';

export async function POST(request: NextRequest) {
  try {
    const { productKey, customerEmail } = await request.json();

    if (!productKey) {
      return NextResponse.json(
        { error: 'Product key is required' },
        { status: 400 }
      );
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const successUrl = `${baseUrl}/payment/success?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${baseUrl}/#${productKey.toLowerCase().replace(/_/g, '-')}`;

    const session = await createCheckoutSession(
      productKey as ProductKey,
      successUrl,
      cancelUrl,
      customerEmail
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
