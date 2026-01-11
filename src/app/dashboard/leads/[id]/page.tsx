import { notFound } from 'next/navigation';
import { getSession } from '@/lib/auth-utils';
import { db } from '@/lib/db';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LeadActions } from './lead-actions';
import { LeadNotes } from './lead-notes';
import { Building, Mail, Phone, Calendar, DollarSign, Users, Briefcase, ArrowLeft, FileText, MapPin, Clock, CheckCircle, XCircle } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface LeadDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function LeadDetailPage({ params }: LeadDetailPageProps) {
  const { id } = await params;
  const session = await getSession();
  const isAdmin = session?.user?.role === 'ADMIN';

  const lead = await db.lead.findUnique({
    where: { id },
    include: {
      assignedStaff: { select: { id: true, name: true, email: true } },
      partner: { select: { id: true, name: true, companyName: true, email: true } },
      notes: {
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { name: true } } },
      },
    },
  });

  if (!lead) {
    notFound();
  }

  // Check access: admin can see all, staff can only see assigned
  if (!isAdmin && lead.assignedStaffId !== session?.user?.id) {
    notFound();
  }

  // Fetch staff list for admin assignment
  const staffList = isAdmin
    ? await db.user.findMany({
        where: { role: 'STAFF', isActive: true },
        select: { id: true, name: true, email: true },
      })
    : [];

  const statusColors: Record<string, 'default' | 'secondary' | 'success' | 'warning' | 'destructive'> = {
    NEW: 'default',
    ASSIGNED: 'secondary',
    IN_PROGRESS: 'warning',
    CLOSED: 'success',
    LOST: 'destructive',
  };

  const eligibilityColors = {
    LOW: 'warning',
    MODERATE: 'secondary',
    STRONG: 'success',
  } as const;

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
          <Link href="/dashboard/leads">
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold">{lead.companyName}</h1>
            <p className="text-sm text-[var(--color-foreground-muted)]">{lead.contactName}</p>
          </div>
        </div>
        <Badge variant={statusColors[lead.status]} className="text-sm w-fit">
          {lead.status.replace('_', ' ')}
        </Badge>
      </div>

      <div className="grid gap-4 sm:gap-6 lg:grid-cols-3">
        {/* Main info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Contact Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="flex items-center gap-3">
                <Building className="h-4 w-4 text-[var(--color-foreground-muted)]" />
                <div>
                  <p className="text-sm text-[var(--color-foreground-muted)]">Company</p>
                  <p className="font-medium">{lead.companyName}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Users className="h-4 w-4 text-[var(--color-foreground-muted)]" />
                <div>
                  <p className="text-sm text-[var(--color-foreground-muted)]">Contact</p>
                  <p className="font-medium">{lead.contactName}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-[var(--color-foreground-muted)]" />
                <div>
                  <p className="text-sm text-[var(--color-foreground-muted)]">Email</p>
                  <a href={`mailto:${lead.email}`} className="font-medium hover:text-primary">
                    {lead.email}
                  </a>
                </div>
              </div>
              {lead.phone && (
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-[var(--color-foreground-muted)]" />
                  <div>
                    <p className="text-sm text-[var(--color-foreground-muted)]">Phone</p>
                    <a href={`tel:${lead.phone}`} className="font-medium hover:text-primary">
                      {lead.phone}
                    </a>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Estimation Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Credit Estimation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <DollarSign className="h-4 w-4 text-[var(--color-foreground-muted)]" />
                <div>
                  <p className="text-sm text-[var(--color-foreground-muted)]">Estimated Range</p>
                  <p className="text-2xl font-bold">
                    {formatCurrency(lead.estimatedMin)} – {formatCurrency(lead.estimatedMax)}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-sm text-[var(--color-foreground-muted)] mb-2">Credits Flagged</p>
                <div className="flex gap-2">
                  {lead.creditFlags.map((flag) => (
                    <Badge key={flag} variant="outline">
                      {flag}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm text-[var(--color-foreground-muted)] mb-2">Eligibility Signal</p>
                <Badge variant={eligibilityColors[lead.eligibility]}>{lead.eligibility}</Badge>
              </div>

              {/* Explanations if available */}
              {lead.explanations && lead.explanations.length > 0 && (
                <div>
                  <p className="text-sm text-[var(--color-foreground-muted)] mb-2">Why This Estimate</p>
                  <ul className="text-sm space-y-1">
                    {lead.explanations.map((exp, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                        <span>{exp}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Form Data (Admin view) */}
          {isAdmin && lead.inputsJson && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Submitted Form Data
                </CardTitle>
                <CardDescription>All data collected from the estimator form</CardDescription>
              </CardHeader>
              <CardContent>
                <FormDataDisplay data={lead.inputsJson as Record<string, unknown>} />
              </CardContent>
            </Card>
          )}

          {/* Notes */}
          <LeadNotes leadId={lead.id} notes={lead.notes} />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Actions */}
          <LeadActions
            leadId={lead.id}
            currentStatus={lead.status}
            assignedStaffId={lead.assignedStaffId}
            staffList={staffList}
            isAdmin={isAdmin}
          />

          {/* Meta info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-[var(--color-foreground-muted)]" />
                <div>
                  <p className="text-[var(--color-foreground-muted)]">Created</p>
                  <p>{formatDate(lead.createdAt)}</p>
                </div>
              </div>
              {lead.industry && (
                <div>
                  <p className="text-[var(--color-foreground-muted)]">Industry</p>
                  <p className="capitalize">{lead.industry}</p>
                </div>
              )}
              {lead.source && (
                <div>
                  <p className="text-[var(--color-foreground-muted)]">Source</p>
                  <p>{lead.source}</p>
                </div>
              )}
              {lead.assignedStaff && (
                <div>
                  <p className="text-[var(--color-foreground-muted)]">Assigned To</p>
                  <p>{lead.assignedStaff.name}</p>
                </div>
              )}
              {lead.partner && (
                <div>
                  <p className="text-[var(--color-foreground-muted)]">Client Account</p>
                  <p>{lead.partner.companyName}</p>
                  <p className="text-xs text-[var(--color-foreground-subtle)]">{lead.partner.email}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// Helper component to display form data in a readable format
function FormDataDisplay({ data }: { data: Record<string, unknown> }) {
  const fieldLabels: Record<string, string> = {
    industry: 'Industry',
    state: 'State',
    yearsInOperation: 'Years in Operation',
    fullTimeEmployees: 'Full-Time Employees',
    partTimeEmployees: 'Has Part-Time Employees',
    tippedEmployees: 'Has Tipped Employees',
    annualPayroll: 'Annual Payroll Range',
    operationalDisruption2020: 'COVID-19 Operational Disruption',
    governmentMandates: 'Affected by Government Mandates',
    targetedHiring: 'Participates in Targeted Hiring',
    revenueReduction: 'Revenue Reduction (2020)',
    suspendedOperations: 'Operations Suspended',
    w2Employees2020: 'W-2 Employees (2020)',
    w2Employees2021: 'W-2 Employees (2021)',
    pppLoan: 'Received PPP Loan',
    employeeRetention: 'Employee Retention Focus',
  };

  const formatValue = (key: string, value: unknown): string => {
    if (typeof value === 'boolean') {
      return value ? 'Yes' : 'No';
    }
    if (typeof value === 'number') {
      return value.toString();
    }
    if (typeof value === 'string') {
      // Format ranges like "50-100" or "2000000-5000000"
      if (value.includes('-') && /^\d/.test(value)) {
        const parts = value.split('-');
        if (parts.length === 2 && !isNaN(Number(parts[0]))) {
          const num1 = Number(parts[0]);
          const num2 = Number(parts[1]);
          if (num1 >= 100000) {
            return `$${(num1 / 1000000).toFixed(1)}M - $${(num2 / 1000000).toFixed(1)}M`;
          }
        }
      }
      return value.charAt(0).toUpperCase() + value.slice(1);
    }
    return JSON.stringify(value);
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {Object.entries(data).map(([key, value]) => (
        <div key={key} className="flex items-start gap-3">
          {typeof value === 'boolean' ? (
            value ? (
              <CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
            ) : (
              <XCircle className="h-4 w-4 text-[var(--color-foreground-subtle)] mt-0.5 flex-shrink-0" />
            )
          ) : (
            <FileText className="h-4 w-4 text-[var(--color-foreground-muted)] mt-0.5 flex-shrink-0" />
          )}
          <div>
            <p className="text-sm text-[var(--color-foreground-muted)]">
              {fieldLabels[key] || key.replace(/([A-Z])/g, ' $1').trim()}
            </p>
            <p className="font-medium">{formatValue(key, value)}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
