import { getSession } from '@/lib/auth-utils';
import { db } from '@/lib/db';
import { cache } from '@/lib/redis';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PageHeader } from '@/components/page-header';
import { formatCurrency, formatDate } from '@/lib/utils';
import { LEAD_STATUS_COLORS, ELIGIBILITY_COLORS, ASSIGNMENT_STATUS_COLORS } from '@/lib/constants';
import { Users, DollarSign, TrendingUp, Clock, Building2, CheckCircle } from 'lucide-react';
import Link from 'next/link';

interface DashboardStats {
  totalLeads: number;
  newLeads: number;
  inProgressLeads: number;
  closedLeads: number;
  partnersCount: number;
  assignmentsCount: number;
  totalEstimatedValue: number;
}

interface RecentLead {
  id: string;
  companyName: string;
  status: string;
  eligibility: string;
  estimatedMax: number;
  createdAt: Date;
}

async function getDashboardStats(userId: string, isAdmin: boolean): Promise<DashboardStats> {
  const cacheKey = cache.keys.dashboardStats(userId, isAdmin);
  
  return cache.getOrFetch(cacheKey, async () => {
    const whereClause = isAdmin ? {} : { assignedStaffId: userId };

    const [totalLeads, newLeads, inProgressLeads, closedLeads, partnersCount, assignmentsCount] = await Promise.all([
      db.lead.count({ where: whereClause }),
      db.lead.count({ where: { ...whereClause, status: 'NEW' } }),
      db.lead.count({ where: { ...whereClause, status: 'IN_PROGRESS' } }),
      db.lead.count({ where: { ...whereClause, status: 'CLOSED' } }),
      isAdmin ? db.partner.count({ where: { isActive: true } }) : 0,
      isAdmin ? db.partnerAssignment.count({ where: { status: { in: ['PENDING', 'IN_PROGRESS'] } } }) : 0,
    ]);

    // Calculate total estimated value
    const leads = await db.lead.findMany({
      where: whereClause,
      select: { estimatedMin: true, estimatedMax: true },
    });

    const totalEstimatedValue = leads.reduce(
      (sum, lead) => sum + (lead.estimatedMin + lead.estimatedMax) / 2,
      0
    );

    return {
      totalLeads,
      newLeads,
      inProgressLeads,
      closedLeads,
      partnersCount,
      assignmentsCount,
      totalEstimatedValue,
    };
  }, cache.ttl.dashboardStats);
}

export default async function DashboardPage() {
  const session = await getSession();
  const isAdmin = session?.user?.role === 'ADMIN';
  const userId = session?.user?.id || 'anonymous';

  // Fetch cached stats
  const stats = await getDashboardStats(userId, isAdmin);

  // Recent leads (not cached - always fresh)
  const whereClause = isAdmin ? {} : { assignedStaffId: userId };
  const recentLeads = await db.lead.findMany({
    where: whereClause,
    orderBy: { createdAt: 'desc' },
    take: 5,
    select: {
      id: true,
      companyName: true,
      status: true,
      eligibility: true,
      estimatedMax: true,
      createdAt: true,
    },
  }) as RecentLead[];

  // Recent partner activity (admin only)
  const recentAssignments = isAdmin
    ? await db.partnerAssignment.findMany({
        orderBy: { assignedAt: 'desc' },
        take: 5,
        include: {
          partner: { select: { companyName: true } },
          lead: { select: { companyName: true } },
        },
      })
    : [];

  const statCards = [
    {
      title: 'Total Leads',
      value: stats.totalLeads,
      icon: Users,
      description: isAdmin ? 'All leads' : 'Assigned to you',
    },
    {
      title: 'New Leads',
      value: stats.newLeads,
      icon: Clock,
      description: 'Awaiting action',
    },
    {
      title: 'In Progress',
      value: stats.inProgressLeads,
      icon: TrendingUp,
      description: 'Being processed',
    },
    {
      title: 'Est. Pipeline Value',
      value: formatCurrency(stats.totalEstimatedValue),
      icon: DollarSign,
      description: 'Average of ranges',
    },
  ];

  return (
    <div className="space-y-8">
      <PageHeader
        title="Dashboard"
        description={`Welcome back, ${session?.user?.name}`}
      />

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-[var(--color-foreground-muted)]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-light text-[var(--color-foreground)]">{stat.value}</div>
              <p className="text-xs text-[var(--color-foreground-muted)]">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Admin-only Partner Stats */}
      {isAdmin && (
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Active Partners
              </CardTitle>
              <Building2 className="h-4 w-4 text-[var(--color-foreground-muted)]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-light text-[var(--color-foreground)]">{stats.partnersCount}</div>
              <p className="text-xs text-[var(--color-foreground-muted)]">Backend payroll processors</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Active Assignments
              </CardTitle>
              <CheckCircle className="h-4 w-4 text-[var(--color-foreground-muted)]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-light text-[var(--color-foreground)]">{stats.assignmentsCount}</div>
              <p className="text-xs text-[var(--color-foreground-muted)]">Pending + In Progress</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Recent Leads */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Recent Leads</CardTitle>
              <CardDescription>Latest leads in your pipeline</CardDescription>
            </div>
            <Link href="/dashboard/leads" className="text-sm text-[var(--brand-primary)] hover:underline">
              View all →
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {recentLeads.length === 0 ? (
            <p className="text-center text-[var(--color-foreground-muted)] py-8">
              No leads yet. They will appear here once created.
            </p>
          ) : (
            <div className="space-y-3">
              {recentLeads.map((lead) => (
                <Link
                  key={lead.id}
                  href={`/dashboard/leads/${lead.id}`}
                  className="flex items-center justify-between border border-[var(--color-border)] p-4 hover:bg-[var(--color-background-alt)] transition-colors"
                >
                  <div className="space-y-1">
                    <p className="font-medium text-[var(--color-foreground)]">{lead.companyName}</p>
                    <div className="flex items-center gap-2">
                      <Badge variant={LEAD_STATUS_COLORS[lead.status]} className="text-xs">
                        {lead.status.replace('_', ' ')}
                      </Badge>
                      <Badge variant={ELIGIBILITY_COLORS[lead.eligibility]} className="text-xs">
                        {lead.eligibility}
                      </Badge>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-[var(--color-foreground)]">{formatCurrency(lead.estimatedMax)}</p>
                    <p className="text-xs text-[var(--color-foreground-muted)]">
                      {formatDate(lead.createdAt)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Partner Assignments (Admin only) */}
      {isAdmin && recentAssignments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Partner Assignments</CardTitle>
            <CardDescription>Latest leads sent to partners</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentAssignments.map((assignment) => (
                <div
                  key={assignment.id}
                  className="flex items-center justify-between border border-[var(--color-border)] p-4"
                >
                  <div className="flex items-center gap-3">
                    <Building2 className="h-5 w-5 text-[var(--color-foreground-muted)]" />
                    <div>
                      <p className="font-medium text-[var(--color-foreground)]">{assignment.partner.companyName}</p>
                      <p className="text-sm text-[var(--color-foreground-muted)]">
                        {assignment.lead.companyName}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant={ASSIGNMENT_STATUS_COLORS[assignment.status]}>
                      {assignment.status.replace('_', ' ')}
                    </Badge>
                    <p className="mt-1 text-xs text-[var(--color-foreground-muted)]">
                      {formatDate(assignment.assignedAt)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
