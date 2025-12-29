import { notFound, redirect } from 'next/navigation';
import { getSession } from '@/lib/auth-utils';
import { db } from '@/lib/db';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LEAD_STATUS_COLORS } from '@/lib/constants';
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
import { EligibilitySignal } from '@prisma/client';

interface PartnerLeadDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function PartnerLeadDetailPage({ params }: PartnerLeadDetailPageProps) {
  const { id } = await params;
  const session = await getSession();

  if (!session?.user || session.user.userType !== 'partner') {
    redirect('/login');
  }

  // Verify partner owns this lead (client model)
  const lead = await db.lead.findFirst({
    where: {
      id,
      partnerId: session.user.id,
    },
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
      status: true,
      createdAt: true,
    },
  });

  if (!lead) {
    notFound();
  }

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
        Back to My Applications
      </Link>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">
            {lead.companyName}
          </h1>
          <p className="text-slate-600">{lead.contactName}</p>
        </div>
        <Badge variant={LEAD_STATUS_COLORS[lead.status] || 'outline'} className="self-start">
          {lead.status.replace('_', ' ')}
        </Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Status card - shown first on mobile */}
        <div className="lg:hidden space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Application Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <Badge 
                  variant={LEAD_STATUS_COLORS[lead.status] || 'outline'}
                  className="text-sm px-3 py-1"
                >
                  {lead.status.replace('_', ' ')}
                </Badge>
                <span className="text-sm text-[var(--color-foreground-muted)]">
                  {lead.status === 'NEW' && 'Awaiting review'}
                  {lead.status === 'ASSIGNED' && 'Assigned to specialist'}
                  {lead.status === 'IN_PROGRESS' && 'Being processed'}
                  {lead.status === 'CLOSED' && 'Completed'}
                  {lead.status === 'LOST' && 'Not approved'}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Contact Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 grid-cols-1 sm:grid-cols-2">
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
        </div>

        {/* Sidebar - hidden on mobile, status shown above */}
        <div className="hidden lg:block space-y-6">
          {/* Application Status */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Application Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center py-4">
                <Badge 
                  variant={LEAD_STATUS_COLORS[lead.status] || 'outline'}
                  className="text-lg px-4 py-2"
                >
                  {lead.status.replace('_', ' ')}
                </Badge>
              </div>
              <p className="text-sm text-[var(--color-foreground-muted)] text-center">
                {lead.status === 'NEW' && 'Your application is awaiting review.'}
                {lead.status === 'ASSIGNED' && 'Your application has been assigned to a specialist.'}
                {lead.status === 'IN_PROGRESS' && 'Your application is being processed.'}
                {lead.status === 'CLOSED' && 'Your application has been completed successfully.'}
                {lead.status === 'LOST' && 'Unfortunately, your application was not approved.'}
              </p>
            </CardContent>
          </Card>

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
                <p className="text-[var(--color-foreground-muted)]">Submitted</p>
                <p>{formatDate(lead.createdAt)}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
