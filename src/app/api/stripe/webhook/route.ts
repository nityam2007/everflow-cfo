import { NextRequest, NextResponse } from 'next/server';
import { stripe, PRODUCTS } from '@/lib/stripe';
import { db } from '@/lib/db';
import Stripe from 'stripe';

// Helper to get product name from product key
function getProductName(productKey: string): string {
  const product = PRODUCTS[productKey as keyof typeof PRODUCTS];
  return product?.name || productKey;
}

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json(
      { error: 'Missing signature' },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    // In production, use your webhook secret
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    
    if (webhookSecret && webhookSecret.startsWith('whsec_')) {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } else {
      // For development without webhook secret
      event = JSON.parse(body) as Stripe.Event;
    }
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    );
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        console.log('Checkout completed:', session.id);
        
        // Extract customer details
        const customerEmail = session.customer_details?.email || session.customer_email || '';
        const customerName = session.customer_details?.name || customerEmail.split('@')[0] || 'Customer';
        const customerPhone = session.customer_details?.phone || null;
        const billingAddress = session.customer_details?.address;
        const productKey = session.metadata?.productKey || 'UNKNOWN';
        const customerId = typeof session.customer === 'string' ? session.customer : session.customer?.id || null;
        
        if (customerEmail) {
          // Create or update Partner (client account)
          const partner = await db.partner.upsert({
            where: { email: customerEmail },
            update: {
              stripeCustomerId: customerId,
              stripePaymentStatus: session.payment_status,
              stripeProductKey: productKey,
              stripeAmount: session.amount_total,
              stripeCurrency: session.currency,
              stripeSessionId: session.id,
              stripePaidAt: new Date(),
              phone: customerPhone || undefined,
            },
            create: {
              email: customerEmail,
              name: customerName,
              companyName: customerName, // Can be updated later
              phone: customerPhone,
              stripeCustomerId: customerId,
              stripePaymentStatus: session.payment_status,
              stripeProductKey: productKey,
              stripeAmount: session.amount_total,
              stripeCurrency: session.currency,
              stripeSessionId: session.id,
              stripePaidAt: new Date(),
              isActive: true,
            },
          });
          
          // Create Payment record for admin tracking
          await db.payment.create({
            data: {
              partnerId: partner.id,
              stripeSessionId: session.id,
              stripeCustomerId: customerId,
              stripePaymentIntent: typeof session.payment_intent === 'string' 
                ? session.payment_intent 
                : session.payment_intent?.id || null,
              customerEmail: customerEmail,
              customerName: customerName,
              customerPhone: customerPhone,
              productKey: productKey,
              productName: getProductName(productKey),
              amount: session.amount_total || 0,
              currency: session.currency || 'usd',
              status: session.payment_status || 'unknown',
              billingCity: billingAddress?.city || null,
              billingCountry: billingAddress?.country || null,
              billingLine1: billingAddress?.line1 || null,
              billingLine2: billingAddress?.line2 || null,
              billingPostalCode: billingAddress?.postal_code || null,
              billingState: billingAddress?.state || null,
              metadata: session.metadata as object || null,
              paidAt: new Date(),
            },
          });
          
          console.log(`Created/updated partner ${partner.id} for ${customerEmail}`);
        }
        break;
      }

      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log('Payment succeeded:', paymentIntent.id);
        // Payment record already created on checkout.session.completed
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log('Payment failed:', paymentIntent.id);
        
        // Update payment record if exists
        const email = paymentIntent.receipt_email;
        if (email) {
          await db.payment.updateMany({
            where: { 
              stripePaymentIntent: paymentIntent.id 
            },
            data: { 
              status: 'failed' 
            },
          });
        }
        break;
      }

      case 'customer.subscription.created': {
        const subscription = event.data.object as Stripe.Subscription;
        console.log('Subscription created:', subscription.id);
        // Handle new subscription
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        console.log('Subscription updated:', subscription.id);
        // Handle subscription update
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        console.log('Subscription cancelled:', subscription.id);
        // Handle subscription cancellation
        break;
      }

      case 'invoice.paid': {
        const invoice = event.data.object as Stripe.Invoice;
        console.log('Invoice paid:', invoice.id);
        // Handle paid invoice
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        console.log('Invoice payment failed:', invoice.id);
        // Handle failed invoice payment
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
