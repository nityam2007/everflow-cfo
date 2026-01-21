'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Clock, Phone } from 'lucide-react';
import { Suspense } from 'react';

function ConfirmationContent() {
  const searchParams = useSearchParams();
  const type = searchParams.get('type') || 'business';
  const leadId = searchParams.get('leadId');
  
  const isIndividual = type === 'individual';
  const price = isIndividual ? '$500' : '$1,500';
  const timeline = isIndividual ? '7 business days' : '14 business days';

  return (
    <div className="min-h-screen bg-[var(--color-background)] py-8 sm:py-16">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card>
          <CardHeader className="text-center pb-4">
            <div className="mx-auto mb-4 h-16 w-16 flex items-center justify-center rounded-full bg-green-100">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <CardTitle className="text-2xl sm:text-3xl text-[var(--color-foreground)]">
              {isIndividual ? 'Individual' : 'Business'} Tax Filing Started
            </CardTitle>
            <CardDescription className="text-lg">
              Thank you for choosing EverflowCFO
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Order Summary */}
            <div className="border border-[var(--color-border)] p-4 bg-[var(--color-background-secondary)]">
              <h3 className="font-semibold text-[var(--color-foreground)] mb-3">Order Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-[var(--color-foreground-muted)]">Service</span>
                  <span className="text-[var(--color-foreground)]">
                    {isIndividual ? 'Individual Tax Filing' : 'Business Tax Compliance'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--color-foreground-muted)]">Price</span>
                  <span className="font-semibold text-[var(--color-foreground)]">{price}</span>
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
                    <p className="font-medium text-[var(--color-foreground)]">Complete Payment</p>
                    <p className="text-sm text-[var(--color-foreground-muted)]">
                      You&apos;ll be redirected to secure payment checkout
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 flex items-center justify-center rounded-full bg-[var(--brand-primary)] text-white text-sm font-medium shrink-0">
                    2
                  </div>
                  <div>
                    <p className="font-medium text-[var(--color-foreground)]">Document Upload</p>
                    <p className="text-sm text-[var(--color-foreground-muted)]">
                      Our team will send you a secure link to upload tax documents
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 flex items-center justify-center rounded-full bg-[var(--brand-primary)] text-white text-sm font-medium shrink-0">
                    3
                  </div>
                  <div>
                    <p className="font-medium text-[var(--color-foreground)]">CPA Review</p>
                    <p className="text-sm text-[var(--color-foreground-muted)]">
                      Licensed CPA reviews your documents and prepares returns
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 flex items-center justify-center rounded-full bg-[var(--brand-primary)] text-white text-sm font-medium shrink-0">
                    4
                  </div>
                  <div>
                    <p className="font-medium text-[var(--color-foreground)]">Filing Complete</p>
                    <p className="text-sm text-[var(--color-foreground-muted)]">
                      Receive confirmation and copies of filed returns
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div className="flex items-center gap-3 border border-[var(--color-border)] p-4 bg-blue-50">
              <Clock className="h-5 w-5 text-blue-600 shrink-0" />
              <div>
                <p className="font-medium text-[var(--color-foreground)]">Estimated Completion</p>
                <p className="text-sm text-[var(--color-foreground-muted)]">{timeline} after document submission</p>
              </div>
            </div>

            {/* Contact */}
            <div className="flex items-center gap-3 border border-[var(--color-border)] p-4">
              <Phone className="h-5 w-5 text-[var(--brand-primary)] shrink-0" />
              <div>
                <p className="font-medium text-[var(--color-foreground)]">Questions?</p>
                <p className="text-sm text-[var(--color-foreground-muted)]">
                  Email us at{' '}
                  <a href="mailto:tax@everflowcfo.com" className="text-[var(--brand-primary)] hover:underline">
                    tax@everflowcfo.com
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
              <Link href="/partner" className="flex-1">
                <Button className="w-full">
                  Access Client Portal
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function TaxConfirmationPage() {
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
