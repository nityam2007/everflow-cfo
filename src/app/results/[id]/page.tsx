import { notFound } from 'next/navigation';
import Link from 'next/link';
import { db } from '@/lib/db';
import { formatCurrency } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/header';
import { ArrowRight, CheckCircle } from 'lucide-react';

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
    },
  });

  if (!lead) {
    notFound();
  }

  const eligibilityConfig = {
    LOW: { label: 'Low Eligibility' },
    MODERATE: { label: 'Moderate Eligibility' },
    STRONG: { label: 'Strong Eligibility' },
  };

  const creditInfo = {
    ERC: {
      name: 'Employee Retention Credit',
      description: 'COVID-19 related payroll tax credit for eligible employers.',
    },
    TIP: {
      name: 'FICA Tip Credit',
      description: 'Credit for employer FICA taxes paid on employee tips.',
    },
    WOTC: {
      name: 'Work Opportunity Tax Credit',
      description: 'Credit for hiring from targeted populations.',
    },
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-24 pb-16 px-6">
        <div className="max-w-xl mx-auto">
          {/* Success indicator */}
          <div className="mb-12 flex items-center justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full border border-primary/30">
              <CheckCircle className="h-8 w-8 text-primary" />
            </div>
          </div>

          {/* Main result */}
          <div className="text-center mb-16">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-4">
              Preliminary Assessment
            </p>
            <h1 className="text-2xl font-light mb-2">
              Credit Exposure Identified
            </h1>
            <p className="text-muted-foreground text-sm">
              For {lead.companyName}
            </p>
          </div>

          {/* Estimated range */}
          <div className="text-center mb-16 py-12 border-y border-border/20">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-4">
              Estimated Refund Range
            </p>
            <p className="text-4xl font-light text-primary">
              {formatCurrency(lead.estimatedMin)} – {formatCurrency(lead.estimatedMax)}
            </p>
            <p className="text-xs text-muted-foreground mt-4">
              {eligibilityConfig[lead.eligibility as EligibilityType].label}
            </p>
          </div>

          {/* Credit flags */}
          {lead.creditFlags.length > 0 && (
            <div className="mb-16">
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-6 text-center">
                Credits Flagged
              </p>
              <div className="space-y-4">
                {lead.creditFlags.map((flag: string) => {
                  const info = creditInfo[flag as keyof typeof creditInfo];
                  return (
                    <div
                      key={flag}
                      className="flex items-start gap-4 p-4 border border-border/20 rounded-lg"
                    >
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center text-xs font-medium text-primary border border-primary/30 rounded">
                        {flag}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{info.name}</p>
                        <p className="text-xs text-muted-foreground mt-1">{info.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* CTA */}
          <div className="text-center">
            <Button size="lg" className="min-w-[200px]">
              Proceed to Verification
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <p className="mt-4 text-xs text-muted-foreground">
              A qualified specialist will contact you within 24 hours.
            </p>
          </div>

          {/* Disclaimer */}
          <div className="mt-16 pt-8 border-t border-border/20">
            <p className="text-xs text-muted-foreground leading-relaxed text-center">
              This estimate is preliminary and based on self-reported information. 
              Final eligibility and credit amounts require payroll and tax verification.
              This assessment does not constitute tax, legal, or financial advice.
            </p>
          </div>

          <div className="mt-8 text-center">
            <Link href="/" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
              ← Return to home
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
