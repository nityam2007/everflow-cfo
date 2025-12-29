import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth-utils';
import { db } from '@/lib/db';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PageHeader } from '@/components/page-header';
import { ASSIGNMENT_STATUS_COLORS } from '@/lib/constants';
import Link from 'next/link';
import { FileText, Building, Clock, DollarSign } from 'lucide-react';

interface Assignment {
  id: string;
  status: string;
  assignedAt: Date;
  lead: {
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
    createdAt: Date;
  };
}

export default async function PartnerDashboardPage() {
  const session = await getSession();

  if (!session?.user || session.user.userType !== 'partner') {
    redirect('/login');
  }

  // Get partner record
  const partner = await db.partner.findUnique({
    where: { id: session.user.id },
    select: { id: true, companyName: true },
  });

  if (!partner) {
    redirect('/login');
  }

  // Get assigned leads
  const assignments = await db.partnerAssignment.findMany({
    where: { partnerId: partner.id },
    include: {
      lead: {
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
          createdAt: true,
        },
      },
    },
    orderBy: { assignedAt: 'desc' },
  }) as Assignment[];

  // Stats
  const totalAssigned = assignments.length;
  const pending = assignments.filter((a: Assignment) => a.status === 'PENDING').length;
  const inProgress = assignments.filter((a: Assignment) => a.status === 'IN_PROGRESS').length;
  const completed = assignments.filter((a: Assignment) => a.status === 'COMPLETED').length;

  return (
    <div className="space-y-8">
      <PageHeader
        title={`Welcome, ${partner.companyName}`}
        description="View and manage leads assigned to your organization"
      />

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Total Assigned
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-light text-[var(--color-foreground)]">{totalAssigned}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Pending
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-light text-[var(--color-warning)]">{pending}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              In Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-light text-[var(--color-wotc)]">{inProgress}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Completed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-light text-[var(--color-success)]">{completed}</p>
          </CardContent>
        </Card>
      </div>

      {/* Assigned Leads Table */}
      <Card>
        <CardHeader>
          <CardTitle>Assigned Leads</CardTitle>
          <CardDescription>
            Leads assigned to your organization for processing
          </CardDescription>
        </CardHeader>
        <CardContent>
          {assignments.length === 0 ? (
            <div className="py-12 text-center">
              <FileText className="mx-auto h-12 w-12 text-[var(--color-foreground-subtle)]" />
              <p className="mt-4 text-[var(--color-foreground-muted)]">
                No leads assigned yet.
              </p>
              <p className="text-sm text-[var(--color-foreground-muted)]">
                Check back later for new assignments.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[var(--color-border)] text-left text-sm text-[var(--color-foreground-muted)]">
                    <th className="pb-3 font-medium">Business</th>
                    <th className="pb-3 font-medium">Contact</th>
                    <th className="pb-3 font-medium">Estimated Range</th>
                    <th className="pb-3 font-medium">Credits</th>
                    <th className="pb-3 font-medium">Status</th>
                    <th className="pb-3 font-medium">Assigned</th>
                    <th className="pb-3 font-medium"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--color-border)]">
                  {assignments.map((assignment: Assignment) => (
                    <tr key={assignment.id} className="text-sm">
                      <td className="py-4">
                        <div className="flex items-center gap-2">
                          <Building className="h-4 w-4 text-[var(--color-foreground-muted)]" />
                          <div>
                            <p className="font-medium text-[var(--color-foreground)]">
                              {assignment.lead.companyName}
                            </p>
                            <p className="text-xs text-[var(--color-foreground-muted)] capitalize">
                              {assignment.lead.industry}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4">
                        <p className="text-[var(--color-foreground)]">{assignment.lead.contactName}</p>
                        <p className="text-xs text-[var(--color-foreground-muted)]">
                          {assignment.lead.email}
                        </p>
                      </td>
                      <td className="py-4">
                        <div className="flex items-center gap-1 text-[var(--color-foreground)]">
                          <DollarSign className="h-4 w-4 text-[var(--color-foreground-muted)]" />
                          <span>
                            {formatCurrency(assignment.lead.estimatedMin)} –{' '}
                            {formatCurrency(assignment.lead.estimatedMax)}
                          </span>
                        </div>
                      </td>
                      <td className="py-4">
                        <div className="flex flex-wrap gap-1">
                          {assignment.lead.creditFlags.slice(0, 2).map((flag: string) => (
                            <Badge key={flag} variant="outline" className="text-xs">
                              {flag}
                            </Badge>
                          ))}
                          {assignment.lead.creditFlags.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{assignment.lead.creditFlags.length - 2}
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td className="py-4">
                        <Badge variant={ASSIGNMENT_STATUS_COLORS[assignment.status]}>
                          {assignment.status.replace('_', ' ')}
                        </Badge>
                      </td>
                      <td className="py-4 text-[var(--color-foreground-muted)]">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDate(assignment.assignedAt)}
                        </div>
                      </td>
                      <td className="py-4">
                        <Link
                          href={`/partner/leads/${assignment.lead.id}`}
                          className="text-[var(--brand-primary)] hover:underline"
                        >
                          View
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
