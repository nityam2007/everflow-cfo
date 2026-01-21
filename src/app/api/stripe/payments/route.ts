import { NextRequest, NextResponse } from 'next/server';
import { stripe, PRODUCTS } from '@/lib/stripe';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth';
import Stripe from 'stripe';

// Payment record shape from our processing
interface PaymentRecord {
  id: string;
  stripeSessionId?: string;
  amount: number;
  currency: string;
  status: string;
  created: number;
  paidAt?: number | null;
  description: string | null;
  productKey?: string | null;
  customer: string | null;
  receipt_email: string | null | undefined;
  customerName?: string | null | undefined;
  customerPhone?: string | null | undefined;
  billingAddress?: {
    city?: string | null;
    country?: string | null;
    line1?: string | null;
    line2?: string | null;
    postal_code?: string | null;
    state?: string | null;
  } | null;
  partner?: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    companyName: string;
  } | null;
  metadata?: Record<string, string> | null;
  source: 'database' | 'stripe';
}

// Helper to get product name from product key
function getProductName(productKey: string): string {
  const product = PRODUCTS[productKey as keyof typeof PRODUCTS];
  return product?.name || productKey || 'Unknown Product';
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get('customerId');
    const limit = parseInt(searchParams.get('limit') || '100');
    const isAdmin = session.user.role === 'ADMIN';

    // If customerId is provided and user is not admin, verify ownership
    if (customerId && !isAdmin) {
      // In production, verify the customer belongs to this user
    }

    let payments: PaymentRecord[] = [];
    let subscriptions: Stripe.Subscription[] = [];
    let dbPayments: PaymentRecord[] = [];

    // Always fetch from database first (our records)
    try {
      const dbRecords = await db.payment.findMany({
        where: customerId ? { stripeCustomerId: customerId } : {},
        orderBy: { createdAt: 'desc' },
        take: limit,
        include: {
          partner: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              companyName: true,
            },
          },
        },
      });

      dbPayments = dbRecords.map((p) => ({
        id: p.id,
        stripeSessionId: p.stripeSessionId,
        amount: p.amount,
        currency: p.currency,
        status: p.status,
        created: Math.floor(p.createdAt.getTime() / 1000),
        paidAt: p.paidAt ? Math.floor(p.paidAt.getTime() / 1000) : null,
        description: p.productName,
        productKey: p.productKey,
        customer: p.stripeCustomerId,
        receipt_email: p.customerEmail,
        customerName: p.customerName,
        customerPhone: p.customerPhone,
        billingAddress: {
          city: p.billingCity,
          country: p.billingCountry,
          line1: p.billingLine1,
          line2: p.billingLine2,
          postal_code: p.billingPostalCode,
          state: p.billingState,
        },
        partner: p.partner,
        metadata: p.metadata as Record<string, string> | null,
        source: 'database',
      }));
    } catch (dbError) {
      console.error('Database fetch error:', dbError);
      // Continue with Stripe data if DB fails
    }

    // Also fetch from Stripe for real-time data
    try {
      if (isAdmin) {
        // Admin: get checkout sessions (has customer info) instead of payment intents
        const checkoutSessions = await stripe.checkout.sessions.list({
          limit,
          expand: ['data.customer'],
        });

        payments = checkoutSessions.data
          .filter(cs => cs.payment_status === 'paid')
          .map(cs => ({
            id: cs.id,
            amount: cs.amount_total || 0,
            currency: cs.currency || 'usd',
            status: cs.payment_status === 'paid' ? 'succeeded' : cs.payment_status,
            created: cs.created,
            customer: typeof cs.customer === 'string' ? cs.customer : cs.customer?.id || null,
            description: getProductName(cs.metadata?.productKey || ''),
            productKey: cs.metadata?.productKey,
            metadata: cs.metadata,
            receipt_email: cs.customer_details?.email || cs.customer_email,
            customerName: cs.metadata?.customerName || cs.customer_details?.name,
            customerPhone: cs.metadata?.customerPhone || cs.customer_details?.phone,
            billingAddress: cs.customer_details?.address,
            source: 'stripe',
          }));

        // Get all subscriptions
        const allSubscriptions = await stripe.subscriptions.list({
          limit: 50,
        });
        subscriptions = allSubscriptions.data;
      } else if (customerId) {
        // Get payments for specific customer
        const customerSessions = await stripe.checkout.sessions.list({
          customer: customerId,
          limit,
        });

        payments = customerSessions.data
          .filter(cs => cs.payment_status === 'paid')
          .map(cs => ({
            id: cs.id,
            amount: cs.amount_total || 0,
            currency: cs.currency || 'usd',
            status: cs.payment_status === 'paid' ? 'succeeded' : cs.payment_status,
            created: cs.created,
            customer: customerId,
            description: getProductName(cs.metadata?.productKey || ''),
            productKey: cs.metadata?.productKey,
            metadata: cs.metadata,
            receipt_email: cs.customer_details?.email,
            customerName: cs.metadata?.customerName || cs.customer_details?.name,
            customerPhone: cs.metadata?.customerPhone || cs.customer_details?.phone,
            source: 'stripe',
          }));

        const customerSubscriptions = await stripe.subscriptions.list({
          customer: customerId,
          limit: 10,
        });
        subscriptions = customerSubscriptions.data;
      }
    } catch (stripeError) {
      console.error('Stripe fetch error:', stripeError);
      // Continue with database data if Stripe fails
    }

    // Merge and deduplicate: prefer database records, add Stripe-only records
    const dbSessionIds = new Set(dbPayments.map(p => p.stripeSessionId));
    const stripeOnlyPayments = payments.filter(p => !dbSessionIds.has(p.id));
    
    // Combined payments: DB records first (richer data), then Stripe-only
    const combinedPayments = [...dbPayments, ...stripeOnlyPayments];

    return NextResponse.json({ 
      payments: combinedPayments,
      dbPayments, // Separate for admin to see database records
      stripePayments: payments, // Separate for admin to see Stripe records
      subscriptions,
      isAdmin 
    });
  } catch (error) {
    console.error('Error fetching payments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch payments', payments: [], subscriptions: [] },
      { status: 200 }
    );
  }
}
