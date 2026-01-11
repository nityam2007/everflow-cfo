'use client';

import { useEffect, useState } from 'react';
import { 
  CreditCard, 
  FileText, 
  Calendar, 
  DollarSign, 
  ExternalLink,
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { PageHeader } from '@/components/page-header';

interface Payment {
  id: string;
  amount: number;
  currency: string;
  status: string;
  created: number;
  description?: string;
  metadata?: Record<string, string>;
}

interface Subscription {
  id: string;
  status: string;
  current_period_start: number;
  current_period_end: number;
  plan?: {
    amount: number;
    currency: string;
    interval: string;
  };
  items?: {
    data: Array<{
      price: {
        unit_amount: number;
        currency: string;
        recurring?: {
          interval: string;
        };
      };
    }>;
  };
}

function formatCurrency(amount: number, currency: string) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(amount / 100);
}

function formatDate(timestamp: number) {
  return new Date(timestamp * 1000).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function getStatusBadge(status: string) {
  const statusConfig: Record<string, { color: string; icon: React.ReactNode }> = {
    succeeded: { color: 'bg-green-100 text-green-800', icon: <CheckCircle2 className="h-3 w-3" /> },
    active: { color: 'bg-green-100 text-green-800', icon: <CheckCircle2 className="h-3 w-3" /> },
    paid: { color: 'bg-green-100 text-green-800', icon: <CheckCircle2 className="h-3 w-3" /> },
    pending: { color: 'bg-yellow-100 text-yellow-800', icon: <Clock className="h-3 w-3" /> },
    processing: { color: 'bg-blue-100 text-blue-800', icon: <Clock className="h-3 w-3" /> },
    requires_payment_method: { color: 'bg-yellow-100 text-yellow-800', icon: <Clock className="h-3 w-3" /> },
    failed: { color: 'bg-red-100 text-red-800', icon: <XCircle className="h-3 w-3" /> },
    canceled: { color: 'bg-gray-100 text-gray-800', icon: <XCircle className="h-3 w-3" /> },
    cancelled: { color: 'bg-gray-100 text-gray-800', icon: <XCircle className="h-3 w-3" /> },
  };

  const config = statusConfig[status] || { color: 'bg-gray-100 text-gray-800', icon: null };

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
      {config.icon}
      {status.charAt(0).toUpperCase() + status.slice(1).replace(/_/g, ' ')}
    </span>
  );
}

export default function BillingPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBillingData = async () => {
    setLoading(true);
    setError(null);
    try {
      // In production, get customerId from user session/database
      const response = await fetch('/api/stripe/payments');
      const data = await response.json();
      
      if (data.error) {
        setError(data.error);
      } else {
        setPayments(data.payments || []);
        setSubscriptions(data.subscriptions || []);
      }
    } catch (err) {
      setError('Failed to load billing data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBillingData();
  }, []);

  const openCustomerPortal = async () => {
    try {
      // In production, get customerId from user session/database
      const response = await fetch('/api/stripe/create-portal-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerId: 'cus_example' }), // Replace with actual customer ID
      });
      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      console.error('Failed to open customer portal:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--brand-primary)]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Billing & Payments"
        description="Manage your subscriptions and view payment history"
      />

      {error && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg">
          <p className="text-sm">{error}</p>
          <p className="text-xs mt-1 text-yellow-600">
            Note: In sandbox mode, some features may be limited.
          </p>
        </div>
      )}

      {/* Active Subscriptions */}
      <div className="bg-white border border-[var(--color-border)] rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-[var(--color-border)] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-[var(--brand-primary)]" />
            <h2 className="text-lg font-semibold">Active Subscriptions</h2>
          </div>
          <button
            onClick={fetchBillingData}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Refresh"
          >
            <RefreshCw className="h-4 w-4 text-gray-500" />
          </button>
        </div>
        <div className="p-6">
          {subscriptions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <CreditCard className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p>No active subscriptions</p>
              <p className="text-sm mt-1">Your subscription details will appear here</p>
            </div>
          ) : (
            <div className="space-y-4">
              {subscriptions.map((sub) => (
                <div
                  key={sub.id}
                  className="border border-[var(--color-border)] rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="font-medium text-gray-900">
                        {sub.items?.data[0]?.price?.recurring?.interval === 'month' 
                          ? 'Monthly Subscription' 
                          : 'Annual Subscription'}
                      </p>
                      <p className="text-sm text-gray-500">
                        {sub.items?.data[0]?.price?.unit_amount 
                          ? formatCurrency(sub.items.data[0].price.unit_amount, sub.items.data[0].price.currency)
                          : 'N/A'}
                        {sub.items?.data[0]?.price?.recurring?.interval && 
                          ` / ${sub.items.data[0].price.recurring.interval}`}
                      </p>
                    </div>
                    {getStatusBadge(sub.status)}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      Next billing: {formatDate(sub.current_period_end)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          <button
            onClick={openCustomerPortal}
            className="mt-4 inline-flex items-center gap-2 text-[var(--brand-primary)] hover:underline text-sm font-medium"
          >
            Manage Subscription
            <ExternalLink className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Payment History */}
      <div className="bg-white border border-[var(--color-border)] rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-[var(--color-border)] flex items-center gap-2">
          <FileText className="h-5 w-5 text-[var(--brand-primary)]" />
          <h2 className="text-lg font-semibold">Payment History</h2>
        </div>
        <div className="overflow-x-auto">
          {payments.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <DollarSign className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p>No payment history</p>
              <p className="text-sm mt-1">Your payments will appear here after your first transaction</p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {payments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(payment.created)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {payment.description || payment.metadata?.productKey || 'Payment'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {formatCurrency(payment.amount, payment.currency)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(payment.status)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
