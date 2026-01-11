import { requireAdmin } from '@/lib/auth-utils';
import { db } from '@/lib/db';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/utils';
import { UserPlus, ArrowLeft, Mail, Shield, Users2, Ban, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export default async function UsersListPage() {
  await requireAdmin();

  const users = await db.user.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      _count: { 
        select: { 
          assignedLeads: true
        } 
      },
    },
  });

  const activeUsers = users.filter(u => u.isActive);
  const inactiveUsers = users.filter(u => !u.isActive);
  const adminCount = users.filter(u => u.role === 'ADMIN').length;
  const staffCount = users.filter(u => u.role === 'STAFF').length;

  return (
    <div className="space-y-6 lg:space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
          <Link href="/dashboard/settings">
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Settings
            </Button>
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold">User Management</h1>
            <p className="text-sm text-[var(--color-foreground-muted)]">
              Manage internal team members and their access levels
            </p>
          </div>
        </div>
        <Link href="/dashboard/settings/users/new">
          <Button className="w-full sm:w-auto">
            <UserPlus className="mr-2 h-4 w-4" />
            Add User
          </Button>
        </Link>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <Card>
          <CardContent className="p-3 sm:p-4 lg:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-[var(--color-foreground-muted)]">Total Users</p>
                <p className="text-lg sm:text-xl lg:text-2xl font-bold">{users.length}</p>
              </div>
              <Users2 className="h-6 w-6 sm:h-8 sm:w-8 text-[var(--color-foreground-subtle)]" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 sm:p-4 lg:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-[var(--color-foreground-muted)]">Active</p>
                <p className="text-lg sm:text-xl lg:text-2xl font-bold text-emerald-600">{activeUsers.length}</p>
              </div>
              <CheckCircle2 className="h-6 w-6 sm:h-8 sm:w-8 text-emerald-500/50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 sm:p-4 lg:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[var(--color-foreground-muted)]">Admins</p>
                <p className="text-2xl font-bold text-blue-600">{adminCount}</p>
              </div>
              <Shield className="h-8 w-8 text-blue-500/50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[var(--color-foreground-muted)]">Staff</p>
                <p className="text-2xl font-bold text-purple-600">{staffCount}</p>
              </div>
              <Users2 className="h-8 w-8 text-purple-500/50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
          <CardDescription>
            {activeUsers.length} active, {inactiveUsers.length} inactive
          </CardDescription>
        </CardHeader>
        <CardContent>
          {users.length === 0 ? (
            <div className="py-12 text-center">
              <Users2 className="mx-auto h-12 w-12 text-[var(--color-foreground-subtle)]" />
              <p className="mt-4 text-[var(--color-foreground-muted)]">No users found.</p>
              <Link href="/dashboard/settings/users/new" className="mt-4 inline-block">
                <Button>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Create First User
                </Button>
              </Link>
            </div>
          ) : (
            <>
              {/* Mobile Card Layout */}
              <div className="lg:hidden space-y-3">
                {users.map((user) => (
                  <Link
                    key={user.id}
                    href={`/dashboard/settings/users/${user.id}`}
                    className={`block border border-[var(--color-border)] p-3 sm:p-4 hover:border-[var(--brand-primary)] transition-colors ${!user.isActive ? 'opacity-60' : ''}`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-medium shrink-0 ${
                          user.role === 'ADMIN' ? 'bg-blue-600' : 'bg-purple-600'
                        }`}>
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-[var(--color-foreground)] truncate">{user.name}</p>
                          <p className="text-xs text-[var(--color-foreground-muted)] truncate">{user.email}</p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <Badge className={
                          user.role === 'ADMIN'
                            ? 'bg-blue-100 text-blue-700 border-blue-200'
                            : 'bg-purple-100 text-purple-700 border-purple-200'
                        }>
                          {user.role}
                        </Badge>
                        {user.isActive ? (
                          <span className="text-xs text-emerald-600">Active</span>
                        ) : (
                          <span className="text-xs text-[var(--color-foreground-muted)]">Inactive</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-2 text-xs text-[var(--color-foreground-muted)]">
                      <span>{user._count.assignedLeads} leads</span>
                      <span>{formatDate(user.createdAt)}</span>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Desktop Table */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b text-left text-sm text-[var(--color-foreground-muted)]">
                      <th className="pb-3 font-medium">User</th>
                      <th className="pb-3 font-medium">Role</th>
                      <th className="pb-3 font-medium">Status</th>
                      <th className="pb-3 font-medium">Leads</th>
                      <th className="pb-3 font-medium">Created</th>
                      <th className="pb-3 font-medium">Updated</th>
                      <th className="pb-3 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {users.map((user) => (
                      <tr key={user.id} className={`text-sm ${!user.isActive ? 'opacity-60' : ''}`}>
                        <td className="py-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-medium ${
                              user.role === 'ADMIN' ? 'bg-blue-600' : 'bg-purple-600'
                            }`}>
                              {user.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-medium">{user.name}</p>
                              <p className="text-xs text-[var(--color-foreground-muted)] flex items-center gap-1">
                                <Mail className="h-3 w-3" />
                                {user.email}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4">
                          <Badge className={
                            user.role === 'ADMIN'
                              ? 'bg-blue-100 text-blue-700 border-blue-200'
                              : 'bg-purple-100 text-purple-700 border-purple-200'
                          }>
                            {user.role}
                          </Badge>
                        </td>
                        <td className="py-4">
                          {user.isActive ? (
                            <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">
                              <CheckCircle2 className="mr-1 h-3 w-3" />
                              Active
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-[var(--color-foreground-muted)]">
                              <Ban className="mr-1 h-3 w-3" />
                              Inactive
                            </Badge>
                          )}
                        </td>
                        <td className="py-4">
                          <span className="text-[var(--color-foreground-muted)]">
                            {user._count.assignedLeads}
                          </span>
                        </td>
                        <td className="py-4 text-[var(--color-foreground-muted)]">
                          {formatDate(user.createdAt)}
                        </td>
                        <td className="py-4 text-[var(--color-foreground-muted)]">
                          {formatDate(user.updatedAt)}
                        </td>
                        <td className="py-4 text-right">
                          <Link href={`/dashboard/settings/users/${user.id}`}>
                            <Button variant="outline" size="sm">
                              Edit
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

      {/* Quick Info */}
      <Card className="bg-blue-50/30 border-blue-200">
        <CardHeader>
          <CardTitle className="text-lg">About User Roles</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-[var(--color-foreground-muted)] space-y-2">
          <p>
            <strong>Admin:</strong> Full access to all features including user management, partner management, rules configuration, and audit logs.
          </p>
          <p>
            <strong>Staff:</strong> Can manage leads, view assignments, and access the dashboard. Cannot modify system settings.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
