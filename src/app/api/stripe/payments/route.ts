import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth';

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

    let payments: any[] = [];
    let subscriptions: any[] = [];
    let dbPayments: any[] = [];

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
        metadata: p.metadata,
        source: 'database',
      }));
    } catch (dbError) {
      console.error('Database fetch error:', dbError);
      // Continue with Stripe data if DB fails
    }

    // Also fetch from Stripe for real-time data
    try {
      if (customerId) {
        // Get payments for specific customer
        const paymentIntents = await stripe.paymentIntents.list({
          customer: customerId,
          limit,
        });

        const customerSubscriptions = await stripe.subscriptions.list({
          customer: customerId,
          limit: 10,
        });

        payments = paymentIntents.data.map(pi => ({
          ...pi,
          source: 'stripe',
        }));
        subscriptions = customerSubscriptions.data;
      } else if (isAdmin) {
        // Admin: get all recent payments from Stripe
        const paymentIntents = await stripe.paymentIntents.list({
          limit,
        });

        payments = paymentIntents.data.map(pi => ({
          id: pi.id,
          amount: pi.amount,
          currency: pi.currency,
          status: pi.status,
          created: pi.created,
          customer: pi.customer,
          description: pi.description,
          metadata: pi.metadata,
          receipt_email: pi.receipt_email,
          source: 'stripe',
        }));

        // Get all subscriptions
        const allSubscriptions = await stripe.subscriptions.list({
          limit: 50,
        });
        subscriptions = allSubscriptions.data;
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
