import { requireAdmin } from '@/lib/auth-utils';
import { db } from '@/lib/db';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/utils';
import { Building2, ArrowLeft, Mail, Phone, FileText, Ban, CheckCircle2, Plus } from 'lucide-react';
import Link from 'next/link';

export default async function PartnersListPage() {
  await requireAdmin();

  const partners = await db.partner.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      _count: { 
        select: { 
          assignments: true
        } 
      },
      assignments: {
        select: {
          status: true
        }
      }
    },
  });

  const activePartners = partners.filter(p => p.isActive);
  const inactivePartners = partners.filter(p => !p.isActive);
  const totalAssignments = partners.reduce((acc, p) => acc + p._count.assignments, 0);

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
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold">Client Management</h1>
            <p className="text-sm text-[var(--color-foreground-muted)]">
              Manage clients (businesses who submitted applications)
            </p>
          </div>
        </div>
        <Link href="/dashboard/settings/partners/new">
          <Button className="w-full sm:w-auto">
            <Plus className="mr-2 h-4 w-4" />
            Add Client
          </Button>
        </Link>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <Card>
          <CardContent className="p-3 sm:p-4 lg:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-[var(--color-foreground-muted)]">Total Clients</p>
                <p className="text-lg sm:text-xl lg:text-2xl font-bold">{partners.length}</p>
              </div>
              <Building2 className="h-6 w-6 sm:h-8 sm:w-8 text-[var(--color-foreground-subtle)]" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 sm:p-4 lg:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-[var(--color-foreground-muted)]">Active</p>
                <p className="text-lg sm:text-xl lg:text-2xl font-bold text-emerald-600">{activePartners.length}</p>
              </div>
              <CheckCircle2 className="h-6 w-6 sm:h-8 sm:w-8 text-emerald-500/50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[var(--color-foreground-muted)]">Inactive</p>
                <p className="text-2xl font-bold text-[var(--color-foreground-muted)]">{inactivePartners.length}</p>
              </div>
              <Ban className="h-8 w-8 text-[var(--color-foreground-subtle)]" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[var(--color-foreground-muted)]">Total Leads</p>
                <p className="text-2xl font-bold text-blue-600">{totalAssignments}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-500/50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Partners Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {partners.length === 0 ? (
          <Card className="col-span-full">
            <CardContent className="py-12 text-center">
              <Building2 className="mx-auto h-12 w-12 text-[var(--color-foreground-subtle)]" />
              <p className="mt-4 text-[var(--color-foreground-muted)]">No clients registered yet.</p>
              <Link href="/dashboard/settings/partners/new" className="mt-4 inline-block">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add First Client
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          partners.map((partner) => {
            const inProgress = partner.assignments.filter(a => a.status === 'IN_PROGRESS').length;
            const completed = partner.assignments.filter(a => a.status === 'COMPLETED').length;
            
            return (
              <Card 
                key={partner.id} 
                className={`${!partner.isActive ? 'opacity-60' : ''}`}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-white font-medium ${
                        partner.isActive ? 'bg-purple-600' : 'bg-gray-400'
                      }`}>
                        {partner.companyName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <CardTitle className="text-lg">{partner.companyName}</CardTitle>
                        <CardDescription>{partner.name}</CardDescription>
                      </div>
                    </div>
                    {partner.isActive ? (
                      <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">
                        Active
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-[var(--color-foreground-muted)]">
                        Inactive
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center gap-2 text-[var(--color-foreground-muted)]">
                      <Mail className="h-4 w-4" />
                      {partner.email}
                    </div>
                    {partner.phone && (
                      <div className="flex items-center gap-2 text-[var(--color-foreground-muted)]">
                        <Phone className="h-4 w-4" />
                        {partner.phone}
                      </div>
                    )}
                    <div className="pt-3 border-t grid grid-cols-3 gap-2 text-center">
                      <div>
                        <p className="text-lg font-semibold">{partner._count.assignments}</p>
                        <p className="text-xs text-[var(--color-foreground-muted)]">Total</p>
                      </div>
                      <div>
                        <p className="text-lg font-semibold text-blue-600">{inProgress}</p>
                        <p className="text-xs text-[var(--color-foreground-muted)]">Active</p>
                      </div>
                      <div>
                        <p className="text-lg font-semibold text-emerald-600">{completed}</p>
                        <p className="text-xs text-[var(--color-foreground-muted)]">Done</p>
                      </div>
                    </div>
                    <div className="pt-3 flex gap-2">
                      <Link href={`/dashboard/settings/partners/${partner.id}`} className="flex-1">
                        <Button variant="outline" size="sm" className="w-full">
                          Edit
                        </Button>
                      </Link>
                      <Link href={`/dashboard/leads?partner=${partner.id}`} className="flex-1">
                        <Button variant="outline" size="sm" className="w-full">
                          View Leads
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Partners Table for detailed view */}
      <Card>
        <CardHeader>
          <CardTitle>Partners Directory</CardTitle>
          <CardDescription>
            Complete list with contact details and performance metrics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b text-left text-sm text-[var(--color-foreground-muted)]">
                  <th className="pb-3 font-medium">Company</th>
                  <th className="pb-3 font-medium">Contact</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium">Assigned</th>
                  <th className="pb-3 font-medium">In Progress</th>
                  <th className="pb-3 font-medium">Completed</th>
                  <th className="pb-3 font-medium">Joined</th>
                  <th className="pb-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {partners.map((partner) => {
                  const inProgress = partner.assignments.filter(a => a.status === 'IN_PROGRESS').length;
                  const completed = partner.assignments.filter(a => a.status === 'COMPLETED').length;
                  
                  return (
                    <tr key={partner.id} className={`text-sm ${!partner.isActive ? 'opacity-60' : ''}`}>
                      <td className="py-4">
                        <div>
                          <p className="font-medium">{partner.companyName}</p>
                          <p className="text-xs text-[var(--color-foreground-muted)]">{partner.name}</p>
                        </div>
                      </td>
                      <td className="py-4">
                        <div className="text-xs">
                          <p className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {partner.email}
                          </p>
                          {partner.phone && (
                            <p className="flex items-center gap-1 mt-1">
                              <Phone className="h-3 w-3" />
                              {partner.phone}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="py-4">
                        {partner.isActive ? (
                          <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">
                            Active
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-[var(--color-foreground-muted)]">
                            Inactive
                          </Badge>
                        )}
                      </td>
                      <td className="py-4 font-medium">
                        {partner._count.assignments}
                      </td>
                      <td className="py-4 text-blue-600">
                        {inProgress}
                      </td>
                      <td className="py-4 text-emerald-600">
                        {completed}
                      </td>
                      <td className="py-4 text-[var(--color-foreground-muted)]">
                        {formatDate(partner.createdAt)}
                      </td>
                      <td className="py-4 text-right">
                        <Link href={`/dashboard/settings/partners/${partner.id}`}>
                          <Button variant="outline" size="sm">
                            Edit
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
