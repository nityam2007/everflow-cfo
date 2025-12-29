import { notFound, redirect } from 'next/navigation';
import { getSession } from '@/lib/auth-utils';
import { db } from '@/lib/db';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Building, 
  Mail, 
  Phone, 
  DollarSign, 
  Users,
  CheckCircle,
  Info,
  AlertTriangle
} from 'lucide-react';
import { PartnerLeadStatus } from './partner-lead-status';
import { PartnerLeadNotes } from './partner-lead-notes';
import { EligibilitySignal } from '@prisma/client';

interface PartnerLeadDetailPageProps {
  params: Promise<{ id: string }>;
}

interface PartnerLeadNote {
  id: string;
  content: string;
  createdAt: Date;
}

export default async function PartnerLeadDetailPage({ params }: PartnerLeadDetailPageProps) {
  const { id } = await params;
  const session = await getSession();

  if (!session?.user || session.user.userType !== 'partner') {
    redirect('/login');
  }

  // Verify partner has access to this lead
  const assignment = await db.partnerAssignment.findFirst({
    where: {
      partnerId: session.user.id,
      leadId: id,
    },
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
          explanations: true,
          industry: true,
          rulesVersion: true,
          createdAt: true,
        },
      },
      partnerNotes: {
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!assignment) {
    notFound();
  }

  const lead = assignment.lead;
  const notes = assignment.partnerNotes as PartnerLeadNote[];

  const eligibilityConfig: Record<EligibilitySignal, { icon: typeof AlertTriangle; color: string; bg: string }> = {
    LOW: { icon: AlertTriangle, color: 'text-amber-600', bg: 'bg-amber-50' },
    MODERATE: { icon: Info, color: 'text-blue-600', bg: 'bg-blue-50' },
    STRONG: { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50' },
  };

  const eligibility = eligibilityConfig[lead.eligibility];
  const EligibilityIcon = eligibility.icon;

  return (
    <div className="space-y-6">
      {/* Back link */}
      <Link
        href="/partner"
        className="inline-flex items-center text-sm text-[var(--color-foreground-muted)] hover:text-[var(--color-foreground)]"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Assigned Leads
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">
            {lead.companyName}
          </h1>
          <p className="text-slate-600">{lead.contactName}</p>
        </div>
        <Badge
          variant={
            assignment.status === 'COMPLETED'
              ? 'success'
              : assignment.status === 'IN_PROGRESS'
              ? 'secondary'
              : 'warning'
          }
        >
          {assignment.status.replace('_', ' ')}
        </Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
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
                  <a href={`mailto:${lead.email}`} className="font-medium hover:text-[var(--brand-primary)]">
                    {lead.email}
                  </a>
                </div>
              </div>
              {lead.phone && (
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-[var(--color-foreground-muted)]" />
                  <div>
                    <p className="text-sm text-[var(--color-foreground-muted)]">Phone</p>
                    <a href={`tel:${lead.phone}`} className="font-medium hover:text-[var(--brand-primary)]">
                      {lead.phone}
                    </a>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Credit Estimation */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Credit Estimation</CardTitle>
              <CardDescription>
                Preliminary estimate based on quiz responses (Rules v{lead.rulesVersion || '1.0'})
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-3">
                <DollarSign className="h-5 w-5 text-[var(--color-foreground-muted)]" />
                <div>
                  <p className="text-sm text-[var(--color-foreground-muted)]">Estimated Range</p>
                  <p className="text-2xl font-bold">
                    {formatCurrency(lead.estimatedMin)} – {formatCurrency(lead.estimatedMax)}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-sm text-[var(--color-foreground-muted)] mb-2">Credits Flagged</p>
                <div className="flex flex-wrap gap-2">
                  {lead.creditFlags.map((flag: string) => (
                    <Badge key={flag} variant="outline">
                      {flag}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className={`rounded-lg p-4 ${eligibility.bg}`}>
                <div className="flex items-center gap-2 mb-2">
                  <EligibilityIcon className={`h-5 w-5 ${eligibility.color}`} />
                  <span className={`font-medium ${eligibility.color}`}>
                    {lead.eligibility} Eligibility Signal
                  </span>
                </div>
                {lead.explanations && lead.explanations.length > 0 && (
                  <ul className="mt-2 space-y-1 text-sm text-slate-600">
                    {(lead.explanations as string[]).map((exp, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-slate-400">•</span>
                        {exp}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Partner Notes */}
          <PartnerLeadNotes 
            assignmentId={assignment.id} 
            notes={notes} 
          />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status update */}
          <PartnerLeadStatus
            assignmentId={assignment.id}
            currentStatus={assignment.status}
          />

          {/* Meta info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <p className="text-[var(--color-foreground-muted)]">Industry</p>
                <p className="capitalize">{lead.industry}</p>
              </div>
              <div>
                <p className="text-[var(--color-foreground-muted)]">Lead Created</p>
                <p>{formatDate(lead.createdAt)}</p>
              </div>
              <div>
                <p className="text-[var(--color-foreground-muted)]">Assigned to You</p>
                <p>{formatDate(assignment.assignedAt)}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
