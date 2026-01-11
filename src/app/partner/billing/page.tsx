import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth-utils';
import { db } from '@/lib/db';
import { stripe, PRODUCTS } from '@/lib/stripe';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CreditCard, DollarSign, Calendar, CheckCircle, Clock, FileText } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';

// Helper to get product name
function getProductName(productKey: string): string {
  const product = PRODUCTS[productKey as keyof typeof PRODUCTS];
  return product?.name || productKey || 'Service Payment';
}

interface PaymentData {
  id: string;
  amount: number;
  currency: string;
  status: string;
  productName: string;
  productKey: string;
  paidAt: Date | null;
  createdAt: Date;
  source: 'database' | 'stripe';
}

async function getPartnerPayments(partnerId: string, partnerEmail: string): Promise<PaymentData[]> {
  const payments: PaymentData[] = [];

  // First, get payments from database
  try {
    const dbPayments = await db.payment.findMany({
      where: { partnerId },
      orderBy: { createdAt: 'desc' },
    });

    for (const p of dbPayments) {
      payments.push({
        id: p.id,
        amount: p.amount,
        currency: p.currency,
        status: p.status,
        productName: p.productName || 'Service Payment',
        productKey: p.productKey,
        paidAt: p.paidAt,
        createdAt: p.createdAt,
        source: 'database',
      });
    }
  } catch (e) {
    console.error('Error fetching DB payments:', e);
  }

  // Also fetch from Stripe checkout sessions by email
  try {
    // Get all recent checkout sessions and filter by email
    const sessions = await stripe.checkout.sessions.list({
      limit: 100,
      expand: ['data.customer'],
    });

    // Filter to paid sessions matching this email, not already in DB
    const dbSessionIds = new Set(payments.map(p => p.id));
    
    for (const session of sessions.data) {
      const sessionEmail = session.customer_details?.email || session.customer_email;
      
      if (
        session.payment_status === 'paid' && 
        sessionEmail?.toLowerCase() === partnerEmail.toLowerCase() &&
        !dbSessionIds.has(session.id)
      ) {
        payments.push({
          id: session.id,
          amount: session.amount_total || 0,
          currency: session.currency || 'usd',
          status: 'succeeded',
          productName: getProductName(session.metadata?.productKey || ''),
          productKey: session.metadata?.productKey || '',
          paidAt: session.created ? new Date(session.created * 1000) : null,
          createdAt: new Date(session.created * 1000),
          source: 'stripe',
        });
      }
    }
  } catch (e) {
    console.error('Error fetching Stripe payments:', e);
  }

  // Sort by date descending
  payments.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  return payments;
}

async function getPartnerInfo(partnerId: string) {
  const partner = await db.partner.findUnique({
    where: { id: partnerId },
    select: {
      id: true,
      name: true,
      email: true,
      stripeCustomerId: true,
      stripePaymentStatus: true,
      stripeProductKey: true,
      stripeAmount: true,
      stripePaidAt: true,
    },
  });
  return partner;
}

function getStatusBadge(status: string) {
  const statusConfig: Record<string, { color: string; icon: React.ReactNode }> = {
    succeeded: { color: 'bg-green-100 text-green-800', icon: <CheckCircle className="h-3 w-3" /> },
    paid: { color: 'bg-green-100 text-green-800', icon: <CheckCircle className="h-3 w-3" /> },
    pending: { color: 'bg-yellow-100 text-yellow-800', icon: <Clock className="h-3 w-3" /> },
    processing: { color: 'bg-blue-100 text-blue-800', icon: <Clock className="h-3 w-3" /> },
    failed: { color: 'bg-red-100 text-red-800', icon: null },
  };
  
  const config = statusConfig[status] || { color: 'bg-gray-100 text-gray-800', icon: null };
  
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
      {config.icon}
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

export default async function PartnerBillingPage() {
  const session = await getSession();

  if (!session?.user || session.user.userType !== 'partner') {
    redirect('/login');
  }

  const [payments, partner] = await Promise.all([
    getPartnerPayments(session.user.id, session.user.email),
    getPartnerInfo(session.user.id),
  ]);

  const totalSpent = payments
    .filter(p => p.status === 'paid' || p.status === 'succeeded')
    .reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Billing & Payments"
        description="View your payment history and invoices"
      />

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-[var(--brand-primary)]/10 flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-[var(--brand-primary)]" />
              </div>
              <div>
                <p className="text-sm text-[var(--color-foreground-muted)]">Total Spent</p>
                <p className="text-2xl font-bold text-[var(--color-foreground)]">
                  {formatCurrency(totalSpent / 100)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-green-100 flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-[var(--color-foreground-muted)]">Payments Made</p>
                <p className="text-2xl font-bold text-[var(--color-foreground)]">
                  {payments.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center">
                <CreditCard className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-[var(--color-foreground-muted)]">Account Status</p>
                <p className="text-lg font-semibold text-green-600">
                  Active
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payment History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Payment History
          </CardTitle>
        </CardHeader>
        <CardContent>
          {payments.length === 0 ? (
            <div className="text-center py-12">
              <CreditCard className="h-12 w-12 mx-auto text-[var(--color-foreground-muted)] opacity-50 mb-4" />
              <p className="text-[var(--color-foreground-muted)]">No payments yet</p>
              <p className="text-sm text-[var(--color-foreground-muted)] mt-1">
                Your payment history will appear here
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-sm text-[var(--color-foreground-muted)] border-b border-[var(--color-border)]">
                      <th className="pb-3 font-medium">Date</th>
                      <th className="pb-3 font-medium">Description</th>
                      <th className="pb-3 font-medium">Amount</th>
                      <th className="pb-3 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--color-border)]">
                    {payments.map((payment) => (
                      <tr key={payment.id} className="text-sm">
                        <td className="py-4">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-[var(--color-foreground-muted)]" />
                            {payment.paidAt ? formatDate(payment.paidAt) : formatDate(payment.createdAt)}
                          </div>
                        </td>
                        <td className="py-4">
                          <p className="font-medium text-[var(--color-foreground)]">
                            {payment.productName || 'Service Payment'}
                          </p>
                          <p className="text-xs text-[var(--color-foreground-muted)]">
                            {payment.productKey}
                          </p>
                        </td>
                        <td className="py-4 font-medium">
                          {formatCurrency(payment.amount / 100)}
                        </td>
                        <td className="py-4">
                          {getStatusBadge(payment.status)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="md:hidden space-y-3">
                {payments.map((payment) => (
                  <div 
                    key={payment.id}
                    className="p-4 rounded-lg border border-[var(--color-border)] bg-[var(--color-background)]"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-medium text-[var(--color-foreground)]">
                          {payment.productName || 'Service Payment'}
                        </p>
                        <p className="text-xs text-[var(--color-foreground-muted)]">
                          {payment.paidAt ? formatDate(payment.paidAt) : formatDate(payment.createdAt)}
                        </p>
                      </div>
                      {getStatusBadge(payment.status)}
                    </div>
                    <p className="text-lg font-bold text-[var(--color-foreground)]">
                      {formatCurrency(payment.amount / 100)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
