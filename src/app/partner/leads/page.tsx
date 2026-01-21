import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth-utils';
import { db } from '@/lib/db';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LEAD_STATUS_COLORS, PRODUCT_TYPES } from '@/lib/constants';
import Link from 'next/link';
import { FileText, DollarSign, ArrowRight, CreditCard, Tag } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';

async function getPartnerLeads(partnerId: string) {
  const leads = await db.lead.findMany({
    where: { partnerId },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      companyName: true,
      contactName: true,
      email: true,
      phone: true,
      estimatedMin: true,
      estimatedMax: true,
      status: true,
      createdAt: true,
      industry: true,
      productType: true,
      isPaid: true,
      paidAmount: true,
      isLeadOnly: true,
    },
  });
  return leads;
}

// Helper to get product label
const getProductLabel = (productType: string | null) => {
  if (!productType) return 'Estimator';
  const product = PRODUCT_TYPES[productType as keyof typeof PRODUCT_TYPES];
  return product?.label || productType;
};

export default async function PartnerLeadsPage() {
  const session = await getSession();

  if (!session?.user || session.user.userType !== 'partner') {
    redirect('/login');
  }

  const leads = await getPartnerLeads(session.user.id);

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Applications"
        description="View and track all your tax credit applications"
      />

      {leads.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="h-12 w-12 mx-auto text-[var(--color-foreground-muted)] opacity-50 mb-4" />
            <h3 className="text-lg font-semibold text-[var(--color-foreground)] mb-2">
              No Applications Yet
            </h3>
            <p className="text-[var(--color-foreground-muted)] mb-4">
              You haven&apos;t submitted any tax credit applications yet.
            </p>
            <Link
              href="/estimator"
              className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--brand-primary)] text-white rounded-md hover:opacity-90 transition"
            >
              Start New Application
              <ArrowRight className="h-4 w-4" />
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {/* Desktop Table */}
          <Card className="hidden md:block">
            <CardContent className="p-0">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-sm text-[var(--color-foreground-muted)] border-b border-[var(--color-border)]">
                    <th className="p-4 font-medium">Service</th>
                    <th className="p-4 font-medium">Value</th>
                    <th className="p-4 font-medium">Type</th>
                    <th className="p-4 font-medium">Status</th>
                    <th className="p-4 font-medium">Date</th>
                    <th className="p-4 font-medium"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--color-border)]">
                  {leads.map((lead) => {
                    const statusVariant = LEAD_STATUS_COLORS[lead.status as keyof typeof LEAD_STATUS_COLORS] || 'default';
                    
                    return (
                      <tr key={lead.id} className="hover:bg-[var(--color-background-alt)]">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg bg-[var(--brand-primary)]/10 flex items-center justify-center">
                              {lead.isPaid ? (
                                <CreditCard className="h-5 w-5 text-green-600" />
                              ) : (
                                <Tag className="h-5 w-5 text-[var(--brand-primary)]" />
                              )}
                            </div>
                            <div>
                              <p className="font-medium text-[var(--color-foreground)]">
                                {getProductLabel(lead.productType)}
                              </p>
                              <p className="text-sm text-[var(--color-foreground-muted)]">
                                {lead.companyName}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-1">
                            <DollarSign className="h-4 w-4 text-green-600" />
                            <span className="font-medium text-[var(--color-foreground)]">
                              {lead.isPaid && lead.paidAmount 
                                ? formatCurrency(lead.paidAmount / 100)
                                : `${formatCurrency(lead.estimatedMin)} - ${formatCurrency(lead.estimatedMax)}`
                              }
                            </span>
                          </div>
                        </td>
                        <td className="p-4">
                          <Badge variant={lead.isLeadOnly ? 'outline' : 'success'}>
                            {lead.isLeadOnly ? 'Inquiry' : 'Paid'}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <Badge variant={statusVariant}>
                            {lead.status.replace('_', ' ')}
                          </Badge>
                        </td>
                        <td className="p-4 text-sm text-[var(--color-foreground-muted)]">
                          {formatDate(lead.createdAt)}
                        </td>
                        <td className="p-4">
                          <Link
                            href={`/partner/leads/${lead.id}`}
                            className="text-[var(--brand-primary)] hover:underline text-sm font-medium"
                          >
                            View Details
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </CardContent>
          </Card>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-3">
            {leads.map((lead) => {
              const statusVariant = LEAD_STATUS_COLORS[lead.status as keyof typeof LEAD_STATUS_COLORS] || 'default';
              
              return (
                <Link key={lead.id} href={`/partner/leads/${lead.id}`}>
                  <Card className="hover:shadow-md transition">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg bg-[var(--brand-primary)]/10 flex items-center justify-center">
                            {lead.isPaid ? (
                              <CreditCard className="h-5 w-5 text-green-600" />
                            ) : (
                              <Tag className="h-5 w-5 text-[var(--brand-primary)]" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-[var(--color-foreground)]">
                              {getProductLabel(lead.productType)}
                            </p>
                            <p className="text-sm text-[var(--color-foreground-muted)]">
                              {lead.companyName}
                            </p>
                          </div>
                        </div>
                        <Badge variant={statusVariant}>
                          {lead.status.replace('_', ' ')}
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <Badge variant={lead.isLeadOnly ? 'outline' : 'success'} className="text-xs">
                            {lead.isLeadOnly ? 'Inquiry' : 'Paid'}
                          </Badge>
                          <span className="font-medium text-green-600">
                            {lead.isPaid && lead.paidAmount 
                              ? formatCurrency(lead.paidAmount / 100)
                              : formatCurrency(lead.estimatedMax)
                            }
                          </span>
                        </div>
                        <span className="text-sm text-[var(--color-foreground-muted)]">
                          {formatDate(lead.createdAt)}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
