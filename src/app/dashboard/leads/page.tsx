import Link from 'next/link';
import { getSession } from '@/lib/auth-utils';
import { db } from '@/lib/db';
import { formatCurrency, formatDateShort } from '@/lib/utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/page-header';
import { LEAD_STATUS_COLORS, PRODUCT_TYPES } from '@/lib/constants';
import { Eye, Star, DollarSign } from 'lucide-react';
import { ExportButton } from './export-button';

// Product type display helper
const getProductTypeLabel = (productType: string | null) => {
  if (!productType) return 'Estimator';
  const product = PRODUCT_TYPES[productType as keyof typeof PRODUCT_TYPES];
  return product?.label || productType;
};

// Lead source display helper
const getLeadSourceLabel = (leadSource: string | null) => {
  const sourceLabels: Record<string, string> = {
    DIRECT: 'Direct',
    ESTIMATOR: 'Estimator',
    TAX_BUSINESS: 'Tax (Business)',
    TAX_INDIVIDUAL: 'Tax (Individual)',
    CREDITS_RD: 'R&D Credit',
    CREDITS_FICA: 'FICA Tip',
    CREDITS_WOTC: 'WOTC',
    CAPITAL: 'Capital',
    REFERRAL: 'Referral',
    OTHER: 'Other',
  };
  return leadSource ? sourceLabels[leadSource] || leadSource : 'Direct';
};

// Priority icon component
const PriorityIcon = ({ priority }: { priority: number | null }) => {
  if (!priority || priority === 0) return null;
  const colorClass = priority === 2 ? 'text-red-600' : priority === 1 ? 'text-orange-500' : 'text-gray-400';
  const label = priority === 2 ? 'Urgent' : priority === 1 ? 'High Priority' : 'Normal';
  return (
    <span title={label}>
      <Star className={`h-4 w-4 fill-current ${colorClass}`} />
    </span>
  );
};

export default async function LeadsPage() {
  const session = await getSession();
  const isAdmin = session?.user?.role === 'ADMIN';

  // Fetch leads based on role with priority sorting
  const leads = await db.lead.findMany({
    where: isAdmin ? {} : { assignedStaffId: session?.user?.id },
    orderBy: [
      { priority: 'desc' },
      { createdAt: 'desc' },
    ],
    include: {
      assignedStaff: {
        select: { name: true },
      },
    },
  });

  // Calculate stats
  const paidLeads = leads.filter(l => l.isPaid).length;
  const leadOnlyLeads = leads.filter(l => l.isLeadOnly).length;
  const highPriorityLeads = leads.filter(l => l.priority && l.priority >= 1).length;

  return (
    <div className="space-y-4 sm:space-y-6">
      <PageHeader
        title="Leads"
        description={isAdmin ? 'All leads in the system' : 'Leads assigned to you'}
      >
        {isAdmin && <ExportButton />}
      </PageHeader>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="p-3">
          <p className="text-xs text-[var(--color-foreground-muted)]">Total Leads</p>
          <p className="text-2xl font-bold text-[var(--color-foreground)]">{leads.length}</p>
        </Card>
        <Card className="p-3">
          <p className="text-xs text-[var(--color-foreground-muted)]">Paid</p>
          <p className="text-2xl font-bold text-green-600">{paidLeads}</p>
        </Card>
        <Card className="p-3">
          <p className="text-xs text-[var(--color-foreground-muted)]">Lead-Only</p>
          <p className="text-2xl font-bold text-blue-600">{leadOnlyLeads}</p>
        </Card>
        <Card className="p-3">
          <p className="text-xs text-[var(--color-foreground-muted)]">High Priority</p>
          <p className="text-2xl font-bold text-orange-500">{highPriorityLeads}</p>
        </Card>
      </div>

      <Card>
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="text-base sm:text-lg">Lead Pipeline</CardTitle>
          <CardDescription>{leads.length} total leads</CardDescription>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0">
          {leads.length === 0 ? (
            <div className="py-8 sm:py-12 text-center">
              <p className="text-[var(--color-foreground-muted)]">No leads found.</p>
            </div>
          ) : (
            <>
              {/* Mobile card layout */}
              <div className="lg:hidden space-y-3">
                {leads.map((lead) => (
                  <Link
                    key={lead.id}
                    href={`/dashboard/leads/${lead.id}`}
                    className="block border border-[var(--color-border)] p-3 sm:p-4 hover:border-[var(--brand-primary)] transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <PriorityIcon priority={lead.priority} />
                        <div>
                          <p className="font-medium text-[var(--color-foreground)] text-sm sm:text-base">{lead.companyName}</p>
                          <p className="text-xs text-[var(--color-foreground-muted)]">{lead.contactName}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {lead.isPaid && <DollarSign className="h-4 w-4 text-green-600" />}
                        <Badge variant={LEAD_STATUS_COLORS[lead.status]} className="text-xs">{lead.status}</Badge>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="secondary" className="text-xs">
                        {getProductTypeLabel(lead.productType)}
                      </Badge>
                      <span className="text-xs text-[var(--color-foreground-muted)]">
                        {getLeadSourceLabel(lead.leadSource)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-[var(--color-foreground)] text-sm">
                        {lead.isPaid && lead.paidAmount 
                          ? formatCurrency(lead.paidAmount / 100)
                          : `${formatCurrency(lead.estimatedMin)} - ${formatCurrency(lead.estimatedMax)}`
                        }
                      </span>
                      <span className="text-xs text-[var(--color-foreground-muted)]">
                        {formatDateShort(lead.createdAt)}
                      </span>
                    </div>
                    <div className="flex gap-1 mt-2 flex-wrap">
                      {lead.creditFlags.map((flag) => (
                        <Badge key={flag} variant="outline" className="text-xs">
                          {flag}
                        </Badge>
                      ))}
                    </div>
                  </Link>
                ))}
              </div>

              {/* Desktop table layout */}
              <div className="hidden lg:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[var(--color-border)] text-left text-sm text-[var(--color-foreground-muted)]">
                    <th className="pb-3 font-medium w-8"></th>
                    <th className="pb-3 font-medium">Company</th>
                    <th className="pb-3 font-medium">Product</th>
                    <th className="pb-3 font-medium">Source</th>
                    <th className="pb-3 font-medium">Value</th>
                    <th className="pb-3 font-medium">Type</th>
                    <th className="pb-3 font-medium">Status</th>
                    {isAdmin && <th className="pb-3 font-medium">Assigned</th>}
                    <th className="pb-3 font-medium">Created</th>
                    <th className="pb-3 font-medium"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--color-border)]">
                  {leads.map((lead) => (
                    <tr key={lead.id} className="text-sm">
                      <td className="py-4">
                        <PriorityIcon priority={lead.priority} />
                      </td>
                      <td className="py-4">
                        <div>
                          <p className="font-medium text-[var(--color-foreground)]">{lead.companyName}</p>
                          <p className="text-xs text-[var(--color-foreground-muted)]">{lead.contactName}</p>
                        </div>
                      </td>
                      <td className="py-4">
                        <Badge variant="secondary" className="text-xs">
                          {getProductTypeLabel(lead.productType)}
                        </Badge>
                      </td>
                      <td className="py-4 text-[var(--color-foreground-muted)]">
                        {getLeadSourceLabel(lead.leadSource)}
                      </td>
                      <td className="py-4">
                        <div className="flex items-center gap-1">
                          {lead.isPaid && <DollarSign className="h-3 w-3 text-green-600" />}
                          <span className="font-medium text-[var(--color-foreground)]">
                            {lead.isPaid && lead.paidAmount 
                              ? formatCurrency(lead.paidAmount / 100)
                              : `${formatCurrency(lead.estimatedMin)} - ${formatCurrency(lead.estimatedMax)}`
                            }
                          </span>
                        </div>
                      </td>
                      <td className="py-4">
                        <Badge variant={lead.isLeadOnly ? 'outline' : 'default'} className="text-xs">
                          {lead.isLeadOnly ? 'Lead' : 'Paid'}
                        </Badge>
                      </td>
                      <td className="py-4">
                        <Badge variant={LEAD_STATUS_COLORS[lead.status]}>{lead.status}</Badge>
                      </td>
                      {isAdmin && (
                        <td className="py-4 text-[var(--color-foreground-muted)]">
                          {lead.assignedStaff?.name || '—'}
                        </td>
                      )}
                      <td className="py-4 text-[var(--color-foreground-muted)]">
                        {formatDateShort(lead.createdAt)}
                      </td>
                      <td className="py-4">
                        <Link href={`/dashboard/leads/${lead.id}`}>
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
