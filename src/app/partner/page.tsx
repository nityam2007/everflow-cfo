import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth-utils';
import { db } from '@/lib/db';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PageHeader } from '@/components/page-header';
import { LEAD_STATUS_COLORS } from '@/lib/constants';
import Link from 'next/link';
import { FileText, Building, Clock, DollarSign, CheckCircle, XCircle, Loader2 } from 'lucide-react';

interface ClientLead {
  id: string;
  companyName: string;
  contactName: string;
  email: string;
  phone: string | null;
  estimatedMin: number;
  estimatedMax: number;
  creditFlags: string[];
  eligibility: string;
  industry: string | null;
  status: string;
  createdAt: Date;
}

export default async function PartnerDashboardPage() {
  const session = await getSession();

  if (!session?.user || session.user.userType !== 'partner') {
    redirect('/login');
  }

  // Get partner record with their leads
  const partner = await db.partner.findUnique({
    where: { id: session.user.id },
    select: { 
      id: true, 
      name: true,
      companyName: true,
      leads: {
        select: {
          id: true,
          companyName: true,
          contactName: true,
          email: true,
          phone: true,
          estimatedMin: true,
          estimatedMax: true,
          creditFlags: true,
          eligibility: true,
          industry: true,
          status: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!partner) {
    redirect('/login');
  }

  const leads = partner.leads as ClientLead[];

  // Stats based on lead status
  const totalApplications = leads.length;
  const inReview = leads.filter((l) => ['NEW', 'ASSIGNED', 'IN_PROGRESS'].includes(l.status)).length;
  const approved = leads.filter((l) => l.status === 'CLOSED').length;
  const declined = leads.filter((l) => l.status === 'LOST').length;

  return (
    <div className="space-y-8">
      <PageHeader
        title={`Welcome, ${partner.name || partner.companyName}`}
        description="Track your tax credit applications"
      />

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Total Applications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-light text-[var(--color-foreground)]">{totalApplications}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Loader2 className="h-4 w-4 text-[var(--color-warning)]" />
              In Review
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-light text-[var(--color-warning)]">{inReview}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-[var(--color-success)]" />
              Approved
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-light text-[var(--color-success)]">{approved}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <XCircle className="h-4 w-4 text-[var(--color-error)]" />
              Declined
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-light text-[var(--color-error)]">{declined}</p>
          </CardContent>
        </Card>
      </div>

      {/* Applications Table */}
      <Card>
        <CardHeader>
          <CardTitle>Your Applications</CardTitle>
          <CardDescription>
            Track the status of your tax credit applications
          </CardDescription>
        </CardHeader>
        <CardContent>
          {leads.length === 0 ? (
            <div className="py-12 text-center">
              <FileText className="mx-auto h-12 w-12 text-[var(--color-foreground-subtle)]" />
              <p className="mt-4 text-[var(--color-foreground-muted)]">
                No applications yet.
              </p>
              <p className="text-sm text-[var(--color-foreground-muted)]">
                <Link href="/estimator" className="text-[var(--brand-primary)] hover:underline">
                  Start your first application
                </Link>
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[var(--color-border)] text-left text-sm text-[var(--color-foreground-muted)]">
                    <th className="pb-3 font-medium">Business</th>
                    <th className="pb-3 font-medium">Estimated Credits</th>
                    <th className="pb-3 font-medium">Credit Types</th>
                    <th className="pb-3 font-medium">Status</th>
                    <th className="pb-3 font-medium">Submitted</th>
                    <th className="pb-3 font-medium"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--color-border)]">
                  {leads.map((lead: ClientLead) => (
                    <tr key={lead.id} className="text-sm">
                      <td className="py-4">
                        <div className="flex items-center gap-2">
                          <Building className="h-4 w-4 text-[var(--color-foreground-muted)]" />
                          <div>
                            <p className="font-medium text-[var(--color-foreground)]">
                              {lead.companyName}
                            </p>
                            <p className="text-xs text-[var(--color-foreground-muted)] capitalize">
                              {lead.industry}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4">
                        <div className="flex items-center gap-1 text-[var(--color-foreground)]">
                          <DollarSign className="h-4 w-4 text-[var(--color-foreground-muted)]" />
                          <span>
                            {formatCurrency(lead.estimatedMin)} –{' '}
                            {formatCurrency(lead.estimatedMax)}
                          </span>
                        </div>
                      </td>
                      <td className="py-4">
                        <div className="flex flex-wrap gap-1">
                          {lead.creditFlags.slice(0, 2).map((flag: string) => (
                            <Badge key={flag} variant="outline" className="text-xs">
                              {flag}
                            </Badge>
                          ))}
                          {lead.creditFlags.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{lead.creditFlags.length - 2}
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td className="py-4">
                        <Badge variant={LEAD_STATUS_COLORS[lead.status] || 'outline'}>
                          {lead.status.replace('_', ' ')}
                        </Badge>
                      </td>
                      <td className="py-4 text-[var(--color-foreground-muted)]">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDate(lead.createdAt)}
                        </div>
                      </td>
                      <td className="py-4">
                        <Link
                          href={`/partner/leads/${lead.id}`}
                          className="text-[var(--brand-primary)] hover:underline"
                        >
                          Details
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
