import Link from 'next/link';
import { getSession } from '@/lib/auth-utils';
import { db } from '@/lib/db';
import { formatCurrency, formatDateShort } from '@/lib/utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, Download } from 'lucide-react';

const statusColors: Record<string, 'default' | 'secondary' | 'success' | 'warning' | 'destructive'> = {
  NEW: 'default',
  ASSIGNED: 'secondary',
  IN_PROGRESS: 'warning',
  CLOSED: 'success',
  LOST: 'destructive',
};

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Leads</h1>
          <p className="text-muted-foreground">
            {isAdmin ? 'All leads in the system' : 'Leads assigned to you'}
          </p>
        </div>
        {isAdmin && (
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lead Pipeline</CardTitle>
          <CardDescription>{leads.length} total leads</CardDescription>
        </CardHeader>
        <CardContent>
          {leads.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-muted-foreground">No leads found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b text-left text-sm text-muted-foreground">
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
                <tbody className="divide-y">
                  {leads.map((lead) => (
                    <tr key={lead.id} className="text-sm">
                      <td className="py-4 font-medium">{lead.companyName}</td>
                      <td className="py-4">
                        <div>
                          <p>{lead.contactName}</p>
                          <p className="text-xs text-muted-foreground">{lead.email}</p>
                        </div>
                      </td>
                      <td className="py-4 capitalize">{lead.industry}</td>
                      <td className="py-4">
                        <span className="font-medium">
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
                        <Badge variant={statusColors[lead.status]}>{lead.status}</Badge>
                      </td>
                      {isAdmin && (
                        <td className="py-4 text-muted-foreground">
                          {lead.assignedStaff?.name || '—'}
                        </td>
                      )}
                      <td className="py-4 text-muted-foreground">
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
