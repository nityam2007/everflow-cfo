'use client';

import { useEffect, useState } from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  Users, 
  CreditCard,
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
  RefreshCw,
  Search,
  Filter
} from 'lucide-react';
import { PageHeader } from '@/components/page-header';

interface Payment {
  id: string;
  amount: number;
  currency: string;
  status: string;
  created: number;
  customer: string | null;
  description?: string;
  metadata?: Record<string, string>;
  receipt_email?: string;
  // New fields from database
  customerName?: string;
  customerPhone?: string;
  productKey?: string;
  source?: string;
  partner?: {
    id: string;
    name: string;
    email: string;
    phone?: string;
    companyName: string;
  };
  billingAddress?: {
    city?: string;
    country?: string;
    line1?: string;
    line2?: string;
    postal_code?: string;
    state?: string;
  };
}

interface Subscription {
  id: string;
  status: string;
  customer: string;
  current_period_start: number;
  current_period_end: number;
  items?: {
    data: Array<{
      price: {
        unit_amount: number;
        currency: string;
        recurring?: {
          interval: string;
        };
        product?: string;
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
    hour: '2-digit',
    minute: '2-digit',
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
    incomplete: { color: 'bg-yellow-100 text-yellow-800', icon: <Clock className="h-3 w-3" /> },
    trialing: { color: 'bg-blue-100 text-blue-800', icon: <Clock className="h-3 w-3" /> },
  };

  const config = statusConfig[status] || { color: 'bg-gray-100 text-gray-800', icon: null };

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
      {config.icon}
      {status.charAt(0).toUpperCase() + status.slice(1).replace(/_/g, ' ')}
    </span>
  );
}

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'payments' | 'subscriptions'>('payments');

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/stripe/payments');
      const data = await response.json();
      
      if (data.error) {
        setError(data.error);
      } else {
        setPayments(data.payments || []);
        setSubscriptions(data.subscriptions || []);
      }
    } catch {
      setError('Failed to load payment data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Calculate stats
  const totalRevenue = payments
    .filter(p => p.status === 'succeeded')
    .reduce((sum, p) => sum + p.amount, 0);
  
  const thisMonthPayments = payments.filter(p => {
    const paymentDate = new Date(p.created * 1000);
    const now = new Date();
    return paymentDate.getMonth() === now.getMonth() && 
           paymentDate.getFullYear() === now.getFullYear();
  });

  const thisMonthRevenue = thisMonthPayments
    .filter(p => p.status === 'succeeded')
    .reduce((sum, p) => sum + p.amount, 0);

  const activeSubscriptions = subscriptions.filter(s => s.status === 'active').length;

  // Filter payments
  const filteredPayments = payments.filter(p => {
    const matchesSearch = 
      p.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.receipt_email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.customerName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.customerPhone || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.partner?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.partner?.companyName || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

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
        title="Payments & Billing"
        description="View and manage all customer payments and subscriptions"
      />

      {error && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg">
          <p className="text-sm">{error}</p>
          <p className="text-xs mt-1 text-yellow-600">
            Note: In sandbox mode, some features may be limited.
          </p>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border border-[var(--color-border)] rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(totalRevenue, 'usd')}
              </p>
            </div>
            <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white border border-[var(--color-border)] rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">This Month</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(thisMonthRevenue, 'usd')}
              </p>
            </div>
            <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white border border-[var(--color-border)] rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Transactions</p>
              <p className="text-2xl font-bold text-gray-900">{payments.length}</p>
            </div>
            <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <CreditCard className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white border border-[var(--color-border)] rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Active Subscriptions</p>
              <p className="text-2xl font-bold text-gray-900">{activeSubscriptions}</p>
            </div>
            <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <Users className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border border-[var(--color-border)] rounded-lg overflow-hidden">
        <div className="border-b border-[var(--color-border)]">
          <div className="flex">
            <button
              onClick={() => setActiveTab('payments')}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'payments'
                  ? 'border-[var(--brand-primary)] text-[var(--brand-primary)]'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Payments ({payments.length})
            </button>
            <button
              onClick={() => setActiveTab('subscriptions')}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'subscriptions'
                  ? 'border-[var(--brand-primary)] text-[var(--brand-primary)]'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Subscriptions ({subscriptions.length})
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="px-6 py-4 border-b border-[var(--color-border)] flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-[200px] max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by ID, email, or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-[var(--color-border)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-[var(--color-border)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]"
            >
              <option value="all">All Status</option>
              <option value="succeeded">Succeeded</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
              <option value="canceled">Canceled</option>
            </select>
          </div>

          <button
            onClick={fetchData}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Refresh"
          >
            <RefreshCw className="h-4 w-4 text-gray-500" />
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          {activeTab === 'payments' ? (
            filteredPayments.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <DollarSign className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p>No payments found</p>
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Product
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
                  {filteredPayments.map((payment) => (
                    <tr key={payment.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(payment.created)}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="space-y-0.5">
                          <p className="font-medium text-gray-900">
                            {payment.customerName || payment.partner?.name || 'N/A'}
                          </p>
                          <p className="text-gray-500 text-xs">
                            {payment.receipt_email || payment.partner?.email || ''}
                          </p>
                          {(payment.customerPhone || payment.partner?.phone) && (
                            <p className="text-gray-400 text-xs">
                              📞 {payment.customerPhone || payment.partner?.phone}
                            </p>
                          )}
                          {payment.partner?.companyName && payment.partner.companyName !== payment.partner.name && (
                            <p className="text-gray-400 text-xs">
                              🏢 {payment.partner.companyName}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 max-w-xs">
                        <p className="font-medium">{payment.description || payment.productKey || '-'}</p>
                        {payment.source === 'database' && (
                          <span className="text-xs text-green-600">● Verified</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                        {formatCurrency(payment.amount, payment.currency)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(payment.status)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )
          ) : (
            subscriptions.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <CreditCard className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p>No subscriptions found</p>
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Subscription ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Period End
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {subscriptions.map((sub) => (
                    <tr key={sub.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                        {sub.id.slice(0, 20)}...
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {sub.customer}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                        {sub.items?.data[0]?.price?.unit_amount 
                          ? `${formatCurrency(sub.items.data[0].price.unit_amount, sub.items.data[0].price.currency)}/${sub.items.data[0].price.recurring?.interval || 'one-time'}`
                          : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(sub.current_period_end)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(sub.status)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )
          )}
        </div>
      </div>
    </div>
  );
}
