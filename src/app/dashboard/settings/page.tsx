import { requireAdmin } from '@/lib/auth-utils';
import { db } from '@/lib/db';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/page-header';
import { formatDate } from '@/lib/utils';
import { UserPlus, Building2, Settings2, FileCode, ShieldCheck, Activity } from 'lucide-react';
import Link from 'next/link';

export default async function SettingsPage() {
  await requireAdmin();

  const [users, partners, rulesCount, settingsCount] = await Promise.all([
    db.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        _count: { select: { assignedLeads: true } },
      },
    }),
    db.partner.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        companyName: true,
        email: true,
        isActive: true,
        createdAt: true,
        _count: { select: { assignments: true } },
      },
    }),
    db.estimatorRules.count(),
    db.siteSetting.count(),
  ]);

  // Get active rules version
  const activeRules = await db.estimatorRules.findFirst({
    where: { isActive: true },
    select: { version: true, effectiveDate: true }
  });

  return (
    <div className="space-y-8">
      <PageHeader
        title="Admin Settings"
        description="Manage users, partners, rules, and system configuration"
      />

      {/* Quick Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[var(--color-foreground-muted)]">Team Members</p>
                <p className="text-2xl font-light text-[var(--color-foreground)]">{users.length}</p>
              </div>
              <UserPlus className="h-8 w-8 text-[var(--color-foreground-subtle)]" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[var(--color-foreground-muted)]">Partners</p>
                <p className="text-2xl font-light text-[var(--color-foreground)]">{partners.length}</p>
              </div>
              <Building2 className="h-8 w-8 text-[var(--color-foreground-subtle)]" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[var(--color-foreground-muted)]">Rules Versions</p>
                <p className="text-2xl font-light text-[var(--color-foreground)]">{rulesCount}</p>
              </div>
              <FileCode className="h-8 w-8 text-[var(--color-foreground-subtle)]" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[var(--color-foreground-muted)]">Site Settings</p>
                <p className="text-2xl font-light text-[var(--color-foreground)]">{settingsCount}</p>
              </div>
              <Settings2 className="h-8 w-8 text-[var(--color-foreground-subtle)]" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Rules Status */}
      <Card className="border-[var(--color-tip-border)] bg-[var(--color-tip-bg)]">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[var(--color-tip-border)]">
              <ShieldCheck className="h-5 w-5 text-[var(--color-tip)]" />
            </div>
            <div>
              <CardTitle className="text-lg">Active Estimator Rules</CardTitle>
              <CardDescription>
                {activeRules 
                  ? `Version ${activeRules.version} · Effective ${formatDate(activeRules.effectiveDate)}`
                  : 'No active rules configured'
                }
              </CardDescription>
            </div>
          </div>
          <Link href="/dashboard/settings/rules">
            <Button variant="outline">
              <FileCode className="mr-2 h-4 w-4" />
              Manage Rules
            </Button>
          </Link>
        </CardHeader>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Link href="/dashboard/settings/users">
          <Card className="cursor-pointer hover:bg-[var(--color-background-alt)] transition-colors">
            <CardContent className="pt-6 text-center">
              <UserPlus className="h-8 w-8 mx-auto mb-2 text-[var(--color-wotc)]" />
              <p className="font-medium text-[var(--color-foreground)]">Users</p>
              <p className="text-xs text-[var(--color-foreground-muted)]">Manage team</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/dashboard/settings/partners">
          <Card className="cursor-pointer hover:bg-[var(--color-background-alt)] transition-colors">
            <CardContent className="pt-6 text-center">
              <Building2 className="h-8 w-8 mx-auto mb-2 text-purple-600" />
              <p className="font-medium text-[var(--color-foreground)]">Partners</p>
              <p className="text-xs text-[var(--color-foreground-muted)]">Manage processors</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/dashboard/settings/rules">
          <Card className="cursor-pointer hover:bg-[var(--color-background-alt)] transition-colors">
            <CardContent className="pt-6 text-center">
              <FileCode className="h-8 w-8 mx-auto mb-2 text-[var(--color-tip)]" />
              <p className="font-medium text-[var(--color-foreground)]">Rules</p>
              <p className="text-xs text-[var(--color-foreground-muted)]">Estimator config</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/dashboard/settings/site">
          <Card className="cursor-pointer hover:bg-[var(--color-background-alt)] transition-colors">
            <CardContent className="pt-6 text-center">
              <Settings2 className="h-8 w-8 mx-auto mb-2 text-[var(--color-foreground-muted)]" />
              <p className="font-medium text-[var(--color-foreground)]">Site Settings</p>
              <p className="text-xs text-[var(--color-foreground-muted)]">System config</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/dashboard/audit">
          <Card className="cursor-pointer hover:bg-[var(--color-background-alt)] transition-colors">
            <CardContent className="pt-6 text-center">
              <Activity className="h-8 w-8 mx-auto mb-2 text-[var(--color-warning)]" />
              <p className="font-medium text-[var(--color-foreground)]">Audit Log</p>
              <p className="text-xs text-[var(--color-foreground-muted)]">View activity</p>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Internal Team Members */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Team Members</CardTitle>
            <CardDescription>Internal admin and staff accounts</CardDescription>
          </div>
          <Link href="/dashboard/settings/users/new">
            <Button>
              <UserPlus className="mr-2 h-4 w-4" />
              Add User
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--color-border)] text-left text-sm text-[var(--color-foreground-muted)]">
                  <th className="pb-3 font-medium">Name</th>
                  <th className="pb-3 font-medium">Email</th>
                  <th className="pb-3 font-medium">Role</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium">Assigned Leads</th>
                  <th className="pb-3 font-medium">Created</th>
                  <th className="pb-3 font-medium"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border)]">
                {users.map((user) => (
                  <tr key={user.id} className="text-sm">
                    <td className="py-4 font-medium text-[var(--color-foreground)]">{user.name}</td>
                    <td className="py-4 text-[var(--color-foreground-muted)]">{user.email}</td>
                    <td className="py-4">
                      <Badge variant={user.role === 'ADMIN' ? 'default' : 'secondary'}>
                        {user.role}
                      </Badge>
                    </td>
                    <td className="py-4">
                      <Badge variant={user.isActive ? 'success' : 'destructive'}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                    <td className="py-4 text-[var(--color-foreground)]">{user._count.assignedLeads}</td>
                    <td className="py-4 text-[var(--color-foreground-muted)]">{formatDate(user.createdAt)}</td>
                    <td className="py-4">
                      <Link href={`/dashboard/settings/users/${user.id}`}>
                        <Button variant="ghost" size="sm">Edit</Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Partner Organizations */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Partner Organizations</CardTitle>
            <CardDescription>Backend payroll processors with lead access</CardDescription>
          </div>
          <Link href="/dashboard/settings/partners/new">
            <Button>
              <Building2 className="mr-2 h-4 w-4" />
              Add Partner
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {partners.length === 0 ? (
            <div className="py-12 text-center">
              <Building2 className="mx-auto h-12 w-12 text-[var(--color-foreground-subtle)]" />
              <p className="mt-4 text-[var(--color-foreground-muted)]">No partners configured yet.</p>
              <p className="text-sm text-[var(--color-foreground-muted)]">Add a partner to start assigning leads.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[var(--color-border)] text-left text-sm text-[var(--color-foreground-muted)]">
                    <th className="pb-3 font-medium">Company</th>
                    <th className="pb-3 font-medium">Contact</th>
                    <th className="pb-3 font-medium">Email</th>
                    <th className="pb-3 font-medium">Status</th>
                    <th className="pb-3 font-medium">Assigned Leads</th>
                    <th className="pb-3 font-medium">Created</th>
                    <th className="pb-3 font-medium"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--color-border)]">
                  {partners.map((partner) => (
                    <tr key={partner.id} className="text-sm">
                      <td className="py-4 font-medium text-[var(--color-foreground)]">{partner.companyName}</td>
                      <td className="py-4 text-[var(--color-foreground)]">{partner.name}</td>
                      <td className="py-4 text-[var(--color-foreground-muted)]">{partner.email}</td>
                      <td className="py-4">
                        <Badge variant={partner.isActive ? 'success' : 'destructive'}>
                          {partner.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </td>
                      <td className="py-4 text-[var(--color-foreground)]">{partner._count.assignments}</td>
                      <td className="py-4 text-[var(--color-foreground-muted)]">{formatDate(partner.createdAt)}</td>
                      <td className="py-4">
                        <Link href={`/dashboard/settings/partners/${partner.id}`}>
                          <Button variant="ghost" size="sm">Edit</Button>
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
