import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
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

    let payments;
    let subscriptions;

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

      payments = paymentIntents.data;
      subscriptions = customerSubscriptions.data;
    } else if (isAdmin) {
      // Admin: get all recent payments
      const paymentIntents = await stripe.paymentIntents.list({
        limit,
      });

      const charges = await stripe.charges.list({
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
      }));

      // Get all subscriptions
      const allSubscriptions = await stripe.subscriptions.list({
        limit: 50,
      });
      subscriptions = allSubscriptions.data;
    } else {
      return NextResponse.json(
        { error: 'Customer ID required for non-admin users' },
        { status: 400 }
      );
    }

    return NextResponse.json({ 
      payments, 
      subscriptions,
      isAdmin 
    });
  } catch (error) {
    console.error('Error fetching payments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch payments' },
      { status: 500 }
    );
  }
}
