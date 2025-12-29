import Link from 'next/link';
import { getSession } from '@/lib/auth-utils';
import { db } from '@/lib/db';
import { formatCurrency, formatDateShort } from '@/lib/utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/page-header';
import { LEAD_STATUS_COLORS } from '@/lib/constants';
import { Eye } from 'lucide-react';
import { ExportButton } from './export-button';

export default async function LeadsPage() {
  const session = await getSession();
  const isAdmin = session?.user?.role === 'ADMIN';

  // Fetch leads based on role
  const leads = await db.lead.findMany({
    where: isAdmin ? {} : { assignedStaffId: session?.user?.id },
    orderBy: { createdAt: 'desc' },
    include: {
      assignedStaff: {
        select: { name: true },
      },
    },
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Leads"
        description={isAdmin ? 'All leads in the system' : 'Leads assigned to you'}
      >
        {isAdmin && <ExportButton />}
      </PageHeader>

      <Card>
        <CardHeader>
          <CardTitle>Lead Pipeline</CardTitle>
          <CardDescription>{leads.length} total leads</CardDescription>
        </CardHeader>
        <CardContent>
          {leads.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-[var(--color-foreground-muted)]">No leads found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[var(--color-border)] text-left text-sm text-[var(--color-foreground-muted)]">
                    <th className="pb-3 font-medium">Company</th>
                    <th className="pb-3 font-medium">Contact</th>
                    <th className="pb-3 font-medium">Industry</th>
                    <th className="pb-3 font-medium">Est. Range</th>
                    <th className="pb-3 font-medium">Credits</th>
                    <th className="pb-3 font-medium">Status</th>
                    {isAdmin && <th className="pb-3 font-medium">Assigned To</th>}
                    <th className="pb-3 font-medium">Created</th>
                    <th className="pb-3 font-medium"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--color-border)]">
                  {leads.map((lead) => (
                    <tr key={lead.id} className="text-sm">
                      <td className="py-4 font-medium text-[var(--color-foreground)]">{lead.companyName}</td>
                      <td className="py-4">
                        <div>
                          <p className="text-[var(--color-foreground)]">{lead.contactName}</p>
                          <p className="text-xs text-[var(--color-foreground-muted)]">{lead.email}</p>
                        </div>
                      </td>
                      <td className="py-4 capitalize text-[var(--color-foreground)]">{lead.industry}</td>
                      <td className="py-4">
                        <span className="font-medium text-[var(--color-foreground)]">
                          {formatCurrency(lead.estimatedMin)} - {formatCurrency(lead.estimatedMax)}
                        </span>
                      </td>
                      <td className="py-4">
                        <div className="flex gap-1">
                          {lead.creditFlags.map((flag) => (
                            <Badge key={flag} variant="outline" className="text-xs">
                              {flag}
                            </Badge>
                          ))}
                        </div>
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
          )}
        </CardContent>
      </Card>
    </div>
  );
}
