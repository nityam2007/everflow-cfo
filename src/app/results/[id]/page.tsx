import { notFound } from 'next/navigation';
import Link from 'next/link';
import { db } from '@/lib/db';
import { formatCurrency } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/header';
import { ArrowRight, CheckCircle, Info, AlertCircle } from 'lucide-react';

type EligibilityType = 'LOW' | 'MODERATE' | 'STRONG';

interface ResultsPageProps {
  params: Promise<{ id: string }>;
}

export default async function ResultsPage({ params }: ResultsPageProps) {
  const { id } = await params;
  
  const lead = await db.lead.findUnique({
    where: { id },
    select: {
      id: true,
      companyName: true,
      estimatedMin: true,
      estimatedMax: true,
      creditFlags: true,
      eligibility: true,
      inputsJson: true,
      industry: true,
    },
  });

  if (!lead) {
    notFound();
  }

  const eligibilityConfig = {
    LOW: { 
      label: 'Low Eligibility Signal',
      description: 'Limited credit exposure identified based on inputs provided.',
      color: 'text-slate-500',
    },
    MODERATE: { 
      label: 'Moderate Eligibility Signal',
      description: 'Reasonable credit exposure identified. Verification recommended.',
      color: 'text-slate-600',
    },
    STRONG: { 
      label: 'Strong Eligibility Signal',
      description: 'Significant credit exposure identified. Verification strongly recommended.',
      color: 'text-[var(--brand-primary)]',
    },
  };

  const creditInfo = {
    ERC: {
      name: 'Employee Retention Credit',
      description: 'Requires verification of 2020-2021 qualifying periods. Subject to IRS review.',
      icon: AlertCircle,
    },
    TIP: {
      name: 'FICA Tip Credit (Section 45B)',
      description: 'Ongoing annual credit for FICA taxes on employee tips above minimum wage.',
      icon: CheckCircle,
    },
    WOTC: {
      name: 'Work Opportunity Tax Credit',
      description: 'Credit varies by hire category. Requires certification documentation.',
      icon: CheckCircle,
    },
  };

  // Generate explanation bullets based on lead data
  const explanationBullets = [
    'Conservative pre-assessment based on self-reported information',
    `Based on reported payroll scale`,
    lead.creditFlags.includes('TIP') && 'Tipped workforce in qualifying industry increases credit exposure',
    lead.creditFlags.includes('WOTC') && 'Targeted hiring signals indicate WOTC opportunity',
    lead.creditFlags.includes('ERC') && 'ERC eligibility requires detailed verification of 2020-2021 qualifying periods',
    'Final credit amounts subject to payroll documentation review',
  ].filter(Boolean) as string[];

  const eligibility = eligibilityConfig[lead.eligibility as EligibilityType];

  return (
    <div className="min-h-screen bg-[var(--color-background)]">
      <Header />

      <main className="pt-20 md:pt-24 pb-12 md:pb-16 px-4 sm:px-6">
        <div className="max-w-xl mx-auto">
          {/* Success indicator */}
          <div className="mb-8 md:mb-12 flex items-center justify-center">
            <div className="flex h-14 w-14 md:h-16 md:w-16 items-center justify-center border-2 border-[var(--brand-primary)]/30 bg-[var(--brand-primary)]/5">
              <CheckCircle className="h-7 w-7 md:h-8 md:w-8 text-[var(--brand-primary)]" />
            </div>
          </div>

          {/* Main result */}
          <div className="text-center mb-8 md:mb-12">
            <p className="ef-section-label mb-3 md:mb-4">
              Preliminary Assessment Complete
            </p>
            <h1 className="ef-section-title text-xl md:text-2xl">
              Credit Exposure Identified
            </h1>
            <p className="text-[var(--color-foreground-muted)] text-sm mt-2">
              For {lead.companyName}
            </p>
          </div>

          {/* Estimated range */}
          <div className="text-center mb-8 md:mb-12 py-8 md:py-10 border border-[var(--color-border)] bg-[var(--color-background-pure)]">
            <p className="ef-section-label mb-3 md:mb-4">
              Estimated Refund Range
            </p>
            <p className="text-2xl sm:text-3xl md:text-4xl font-light text-[var(--brand-primary)]">
              {formatCurrency(lead.estimatedMin)} – {formatCurrency(lead.estimatedMax)}
            </p>
            <p className={`text-sm mt-3 md:mt-4 ${eligibility.color}`}>
              {eligibility.label}
            </p>
            <p className="text-xs text-[var(--color-foreground-muted)] mt-2 px-4 sm:px-6">
              {eligibility.description}
            </p>
          </div>

          {/* Explanation bullets */}
          <div className="mb-8 md:mb-12">
            <div className="flex items-center gap-2 mb-3 md:mb-4">
              <Info className="h-4 w-4 text-[var(--color-foreground-muted)]" />
              <p className="ef-section-label">
                How This Was Calculated
              </p>
            </div>
            <ul className="space-y-2">
              {explanationBullets.map((bullet, idx) => (
                <li key={idx} className="flex items-start gap-3 text-sm text-[var(--color-foreground-muted)]">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-border shrink-0" />
                  {bullet}
                </li>
              ))}
            </ul>
          </div>

          {/* Credit flags */}
          {lead.creditFlags.length > 0 && (
            <div className="mb-8 md:mb-12">
              <p className="ef-section-label mb-4 md:mb-6">
                Credits Flagged
              </p>
              <div className="space-y-3 md:space-y-4">
                {lead.creditFlags.map((flag: string) => {
                  const info = creditInfo[flag as keyof typeof creditInfo];
                  const Icon = info.icon;
                  return (
                    <div
                      key={flag}
                      className="flex items-start gap-3 md:gap-4 p-3 md:p-4 border border-[var(--color-border)] bg-[var(--color-background-pure)]"
                    >
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center">
                        <Icon className={`h-5 w-5 ${flag === 'ERC' ? 'text-[var(--color-foreground-muted)]' : 'text-[var(--brand-primary)]'}`} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium text-[var(--color-foreground-muted)] uppercase">{flag}</span>
                          {flag === 'ERC' && (
                            <span className="text-xs px-2 py-0.5 bg-[var(--color-background-alt)] rounded text-[var(--color-foreground-muted)]">
                              Requires Verification
                            </span>
                          )}
                          {flag === 'TIP' && (
                            <span className="text-xs px-2 py-0.5 bg-[var(--brand-primary)]/10 rounded text-[var(--brand-primary)]">
                              Ongoing Annual
                            </span>
                          )}
                        </div>
                        <p className="text-sm font-medium mt-1">{info.name}</p>
                        <p className="text-xs text-[var(--color-foreground-muted)] mt-1">{info.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* CTA */}
          <div className="text-center py-6 md:py-8 border border-[var(--color-border)] bg-[var(--color-background-pure)]">
            <h3 className="text-base md:text-lg font-medium mb-2">Ready to verify your eligibility?</h3>
            <p className="text-sm text-[var(--color-foreground-muted)] mb-5 md:mb-6 px-4">
              A qualified specialist will review your documentation and confirm credit amounts.
            </p>
            <Button size="lg" className="min-w-[180px] md:min-w-[200px]">
              Proceed to Verification
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <p className="mt-3 md:mt-4 text-xs text-[var(--color-foreground-muted)]">
              Response within 1 business day
            </p>
          </div>

          {/* Disclaimer */}
          <div className="mt-8 md:mt-12 pt-6 md:pt-8 border-t border-[var(--color-border)]">
            <p className="text-xs text-[var(--color-foreground-muted)] leading-relaxed text-center">
              This is a conservative pre-assessment based on self-reported information. 
              Final eligibility and credit amounts require payroll and tax documentation verification.
              No credits are filed without complete verification. 
              This assessment does not constitute tax, legal, or financial advice.
            </p>
          </div>

          <div className="mt-6 md:mt-8 text-center">
            <Link href="/" className="text-xs text-[var(--color-foreground-muted)] hover:text-[var(--color-foreground)] transition-colors">
              ← Return to home
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
