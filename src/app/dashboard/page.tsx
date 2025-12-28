import { getSession } from '@/lib/auth-utils';
import { db } from '@/lib/db';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import { Users, DollarSign, TrendingUp, Clock } from 'lucide-react';

export default async function DashboardPage() {
  const session = await getSession();
  const isAdmin = session?.user?.role === 'ADMIN';

  // Build query based on role
  const whereClause = isAdmin ? {} : { assignedStaffId: session?.user?.id };

  // Fetch stats
  const [totalLeads, newLeads, inProgressLeads, closedLeads] = await Promise.all([
    db.lead.count({ where: whereClause }),
    db.lead.count({ where: { ...whereClause, status: 'NEW' } }),
    db.lead.count({ where: { ...whereClause, status: 'IN_PROGRESS' } }),
    db.lead.count({ where: { ...whereClause, status: 'CLOSED' } }),
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

  // Recent leads
  const recentLeads = await db.lead.findMany({
    where: whereClause,
    orderBy: { createdAt: 'desc' },
    take: 5,
    select: {
      id: true,
      companyName: true,
      status: true,
      estimatedMax: true,
      createdAt: true,
    },
  });

  const stats = [
    {
      title: 'Total Leads',
      value: totalLeads,
      icon: Users,
      description: isAdmin ? 'All leads' : 'Assigned to you',
    },
    {
      title: 'New Leads',
      value: newLeads,
      icon: Clock,
      description: 'Awaiting action',
    },
    {
      title: 'In Progress',
      value: inProgressLeads,
      icon: TrendingUp,
      description: 'Being processed',
    },
    {
      title: 'Est. Pipeline Value',
      value: formatCurrency(totalEstimatedValue),
      icon: DollarSign,
      description: 'Average of ranges',
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {session?.user?.name}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Leads */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Leads</CardTitle>
          <CardDescription>Latest leads in your pipeline</CardDescription>
        </CardHeader>
        <CardContent>
          {recentLeads.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No leads yet. They will appear here once created.
            </p>
          ) : (
            <div className="space-y-4">
              {recentLeads.map((lead) => (
                <div
                  key={lead.id}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div>
                    <p className="font-medium">{lead.companyName}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(lead.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{formatCurrency(lead.estimatedMax)}</p>
                    <p className="text-xs text-muted-foreground">{lead.status}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
