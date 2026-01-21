'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Lightbulb, Clock, Phone, Users } from 'lucide-react';
import { Suspense } from 'react';

function ConfirmationContent() {
  const searchParams = useSearchParams();
  const type = searchParams.get('type') || 'rd';
  const leadId = searchParams.get('leadId');
  
  const creditInfo = {
    rd: {
      name: 'R&D Tax Credit',
      description: 'Research & Development Tax Credit',
      timeline: '2-3 weeks',
      contact: 'rd@everflowcfo.com',
    },
    fica: {
      name: 'FICA Tip Credit',
      description: 'FICA Tip Tax Credit for hospitality businesses',
      timeline: '1-2 weeks',
      contact: 'credits@everflowcfo.com',
    },
    wotc: {
      name: 'WOTC Credit',
      description: 'Work Opportunity Tax Credit',
      timeline: '2-3 weeks',
      contact: 'credits@everflowcfo.com',
    },
  };

  const credit = creditInfo[type as keyof typeof creditInfo] || creditInfo.rd;

  return (
    <div className="min-h-screen bg-[var(--color-background)] py-8 sm:py-16">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card>
          <CardHeader className="text-center pb-4">
            <div className="mx-auto mb-4 h-16 w-16 flex items-center justify-center rounded-full bg-green-100">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <CardTitle className="text-2xl sm:text-3xl text-[var(--color-foreground)]">
              {credit.name} Inquiry Submitted
            </CardTitle>
            <CardDescription className="text-lg">
              We've received your information and will be in touch shortly
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Summary */}
            <div className="border border-[var(--color-border)] p-4 bg-[var(--color-background-secondary)]">
              <h3 className="font-semibold text-[var(--color-foreground)] mb-3">Inquiry Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-[var(--color-foreground-muted)]">Credit Type</span>
                  <span className="text-[var(--color-foreground)]">{credit.description}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--color-foreground-muted)]">Service Fee</span>
                  <span className="font-semibold text-green-600">No Upfront Cost</span>
                </div>
                {leadId && (
                  <div className="flex justify-between">
                    <span className="text-[var(--color-foreground-muted)]">Reference</span>
                    <span className="text-[var(--color-foreground)] font-mono text-xs">{leadId.slice(0, 8)}...</span>
                  </div>
                )}
              </div>
            </div>

            {/* What Happens Next */}
            <div className="space-y-4">
              <h3 className="font-semibold text-[var(--color-foreground)]">What Happens Next?</h3>
              
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 flex items-center justify-center rounded-full bg-[var(--brand-primary)] text-white text-sm font-medium shrink-0">
                    1
                  </div>
                  <div>
                    <p className="font-medium text-[var(--color-foreground)]">Initial Consultation</p>
                    <p className="text-sm text-[var(--color-foreground-muted)]">
                      Our tax credit specialist will reach out within 24-48 hours to schedule a call
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 flex items-center justify-center rounded-full bg-[var(--brand-primary)] text-white text-sm font-medium shrink-0">
                    2
                  </div>
                  <div>
                    <p className="font-medium text-[var(--color-foreground)]">Eligibility Assessment</p>
                    <p className="text-sm text-[var(--color-foreground-muted)]">
                      We'll review your qualifying activities and estimate potential credit value
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 flex items-center justify-center rounded-full bg-[var(--brand-primary)] text-white text-sm font-medium shrink-0">
                    3
                  </div>
                  <div>
                    <p className="font-medium text-[var(--color-foreground)]">Documentation</p>
                    <p className="text-sm text-[var(--color-foreground-muted)]">
                      Our team handles all documentation and credit study preparation
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 flex items-center justify-center rounded-full bg-[var(--brand-primary)] text-white text-sm font-medium shrink-0">
                    4
                  </div>
                  <div>
                    <p className="font-medium text-[var(--color-foreground)]">Claim Filing</p>
                    <p className="text-sm text-[var(--color-foreground-muted)]">
                      We file your claim and handle any IRS correspondence
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div className="flex items-center gap-3 border border-[var(--color-border)] p-4 bg-blue-50">
              <Clock className="h-5 w-5 text-blue-600 shrink-0" />
              <div>
                <p className="font-medium text-[var(--color-foreground)]">Typical Timeline</p>
                <p className="text-sm text-[var(--color-foreground-muted)]">
                  {credit.timeline} for initial assessment; 60-90 days for full credit study
                </p>
              </div>
            </div>

            {/* Fee Structure */}
            <div className="flex items-center gap-3 border border-[var(--color-border)] p-4 bg-green-50">
              <Lightbulb className="h-5 w-5 text-green-600 shrink-0" />
              <div>
                <p className="font-medium text-[var(--color-foreground)]">Success-Based Pricing</p>
                <p className="text-sm text-[var(--color-foreground-muted)]">
                  You only pay a percentage of credits successfully claimed. No credits = no fee.
                </p>
              </div>
            </div>

            {/* Contact */}
            <div className="flex items-center gap-3 border border-[var(--color-border)] p-4">
              <Phone className="h-5 w-5 text-[var(--brand-primary)] shrink-0" />
              <div>
                <p className="font-medium text-[var(--color-foreground)]">Questions?</p>
                <p className="text-sm text-[var(--color-foreground-muted)]">
                  Email us at{' '}
                  <a href={`mailto:${credit.contact}`} className="text-[var(--brand-primary)] hover:underline">
                    {credit.contact}
                  </a>
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Link href="/" className="flex-1">
                <Button variant="outline" className="w-full">
                  Back to Home
                </Button>
              </Link>
              <Link href="/credits" className="flex-1">
                <Button className="w-full">
                  Explore Other Credits
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function CreditsConfirmationPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[var(--color-background)] flex items-center justify-center">
        <div className="text-[var(--color-foreground-muted)]">Loading...</div>
      </div>
    }>
      <ConfirmationContent />
    </Suspense>
  );
}
