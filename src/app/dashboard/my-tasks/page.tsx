import { getSession } from '@/lib/auth-utils';
import { db } from '@/lib/db';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PageHeader } from '@/components/page-header';
import { formatCurrency, formatDate } from '@/lib/utils';
import { LEAD_STATUS_COLORS, ELIGIBILITY_COLORS } from '@/lib/constants';
import { ClipboardList, Clock, CheckCircle, AlertCircle, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export default async function MyTasksPage() {
  const session = await getSession();
  
  // Only staff can access this page
  if (session?.user?.role === 'ADMIN') {
    redirect('/dashboard');
  }

  const staffId = session?.user?.id;

  // Fetch assigned leads with different statuses
  const [newLeads, inProgressLeads, recentlyUpdatedLeads, totalAssigned] = await Promise.all([
    db.lead.findMany({
      where: { assignedStaffId: staffId, status: 'NEW' },
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: {
        notes: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    }),
    db.lead.findMany({
      where: { assignedStaffId: staffId, status: 'IN_PROGRESS' },
      orderBy: { updatedAt: 'desc' },
      take: 10,
      include: {
        notes: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    }),
    db.lead.findMany({
      where: { assignedStaffId: staffId },
      orderBy: { updatedAt: 'desc' },
      take: 5,
    }),
    db.lead.count({ where: { assignedStaffId: staffId } }),
  ]);

  // Calculate stats
  const pendingCount = newLeads.length;
  const activeCount = inProgressLeads.length;
  const closedCount = await db.lead.count({
    where: { assignedStaffId: staffId, status: 'CLOSED' },
  });

  const stats = [
    {
      title: 'Pending Review',
      value: pendingCount,
      icon: Clock,
      description: 'New leads awaiting action',
      color: 'text-yellow-600',
    },
    {
      title: 'In Progress',
      value: activeCount,
      icon: TrendingUp,
      description: 'Currently being processed',
      color: 'text-blue-600',
    },
    {
      title: 'Completed',
      value: closedCount,
      icon: CheckCircle,
      description: 'Successfully closed',
      color: 'text-green-600',
    },
    {
      title: 'Total Assigned',
      value: totalAssigned,
      icon: ClipboardList,
      description: 'All time assignments',
      color: 'text-gray-600',
    },
  ];

  return (
    <div className="space-y-6 lg:space-y-8">
      <PageHeader
        title="My Tasks"
        description="Your assigned leads and current workload"
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2 p-3 sm:p-4 lg:p-6 lg:pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent className="p-3 sm:p-4 lg:p-6 pt-0">
              <div className="text-lg sm:text-xl lg:text-2xl font-light text-[var(--color-foreground)]">{stat.value}</div>
              <p className="text-xs text-[var(--color-foreground-muted)] hidden sm:block">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Priority: New Leads Requiring Attention */}
      <Card className="border-l-4 border-l-yellow-500">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-yellow-500" />
            <div>
              <CardTitle>Requires Attention</CardTitle>
              <CardDescription>New leads that need your review</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {newLeads.length === 0 ? (
            <p className="text-center text-[var(--color-foreground-muted)] py-8">
              No new leads requiring attention. Great work! 🎉
            </p>
          ) : (
            <div className="space-y-2 sm:space-y-3">
              {newLeads.map((lead) => (
                <Link
                  key={lead.id}
                  href={`/dashboard/leads/${lead.id}`}
                  className="flex flex-col sm:flex-row sm:items-center justify-between border border-[var(--color-border)] p-3 sm:p-4 hover:bg-[var(--color-background-alt)] transition-colors gap-2 sm:gap-4"
                >
                  <div className="space-y-1">
                    <p className="font-medium text-[var(--color-foreground)] text-sm sm:text-base">{lead.companyName}</p>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant={LEAD_STATUS_COLORS[lead.status]} className="text-xs">
                        {lead.status.replace('_', ' ')}
                      </Badge>
                      <Badge variant={ELIGIBILITY_COLORS[lead.eligibility]} className="text-xs">
                        {lead.eligibility}
                      </Badge>
                      <span className="text-xs text-[var(--color-foreground-muted)]">
                        {lead.contactName} • {lead.industry}
                      </span>
                    </div>
                  </div>
                  <div className="text-left sm:text-right flex sm:flex-col items-center sm:items-end gap-2 sm:gap-0">
                    <p className="font-medium text-[var(--color-foreground)] text-sm sm:text-base">
                      {formatCurrency(lead.estimatedMin)} - {formatCurrency(lead.estimatedMax)}
                    </p>
                    <p className="text-xs text-[var(--color-foreground-muted)]">
                      Created {formatDate(lead.createdAt)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* In Progress Leads */}
      <Card className="border-l-4 border-l-blue-500">
        <CardHeader>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-500" />
            <div>
              <CardTitle>In Progress</CardTitle>
              <CardDescription>Leads you&apos;re currently working on</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {inProgressLeads.length === 0 ? (
            <p className="text-center text-[var(--color-foreground-muted)] py-8">
              No leads in progress. Start working on pending leads above.
            </p>
          ) : (
            <div className="space-y-2 sm:space-y-3">
              {inProgressLeads.map((lead) => (
                <Link
                  key={lead.id}
                  href={`/dashboard/leads/${lead.id}`}
                  className="flex flex-col sm:flex-row sm:items-center justify-between border border-[var(--color-border)] p-3 sm:p-4 hover:bg-[var(--color-background-alt)] transition-colors gap-2 sm:gap-4"
                >
                  <div className="space-y-1">
                    <p className="font-medium text-[var(--color-foreground)] text-sm sm:text-base">{lead.companyName}</p>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant={ELIGIBILITY_COLORS[lead.eligibility]} className="text-xs">
                        {lead.eligibility}
                      </Badge>
                      <span className="text-xs text-[var(--color-foreground-muted)]">
                        {lead.contactName} • {lead.industry}
                      </span>
                    </div>
                    {lead.notes[0] && (
                      <p className="text-xs text-[var(--color-foreground-muted)] truncate max-w-md">
                        Last note: {lead.notes[0].content.substring(0, 60)}...
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-[var(--color-foreground)]">
                      {formatCurrency(lead.estimatedMax)}
                    </p>
                    <p className="text-xs text-[var(--color-foreground-muted)]">
                      Updated {formatDate(lead.updatedAt)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Your recently updated leads</CardDescription>
        </CardHeader>
        <CardContent>
          {recentlyUpdatedLeads.length === 0 ? (
            <p className="text-center text-[var(--color-foreground-muted)] py-8">
              No recent activity.
            </p>
          ) : (
            <div className="space-y-2">
              {recentlyUpdatedLeads.map((lead) => (
                <Link
                  key={lead.id}
                  href={`/dashboard/leads/${lead.id}`}
                  className="flex items-center justify-between p-3 hover:bg-[var(--color-background-alt)] transition-colors rounded"
                >
                  <div className="flex items-center gap-3">
                    <Badge variant={LEAD_STATUS_COLORS[lead.status]} className="text-xs">
                      {lead.status.replace('_', ' ')}
                    </Badge>
                    <span className="text-sm text-[var(--color-foreground)]">{lead.companyName}</span>
                  </div>
                  <span className="text-xs text-[var(--color-foreground-muted)]">
                    {formatDate(lead.updatedAt)}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
