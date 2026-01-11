'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle2, ArrowRight, Loader2 } from 'lucide-react';

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const [sessionData, setSessionData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    if (sessionId) {
      // Optionally fetch session details from your API
      // For now, we'll just show a success message
      setLoading(false);
    } else {
      setLoading(false);
    }
  }, [searchParams]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--color-background)] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-[var(--brand-primary)] mx-auto mb-4" />
          <p className="text-gray-600">Verifying payment...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-background)] flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="bg-white shadow-lg p-8 md:p-12 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-[var(--brand-success)] text-white mb-6 rounded-full">
            <CheckCircle2 className="w-12 h-12" />
          </div>
          
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Payment Successful!
          </h1>
          
          <p className="text-lg text-gray-600 mb-8">
            Thank you for your purchase. We've received your payment and will get started on your project right away.
          </p>

          <div className="bg-gray-50 p-6 mb-8 text-left">
            <h2 className="font-bold text-lg mb-4">What happens next?</h2>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-[var(--brand-success)] flex-shrink-0 mt-0.5" />
                <span>You'll receive a confirmation email within the next few minutes</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-[var(--brand-success)] flex-shrink-0 mt-0.5" />
                <span>Our team will reach out within 24 hours to schedule your onboarding call</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-[var(--brand-success)] flex-shrink-0 mt-0.5" />
                <span>You'll get access to your dedicated project dashboard</span>
              </li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/">
              <button className="ef-btn ef-btn-primary">
                Return to Homepage
                <ArrowRight className="h-4 w-4" />
              </button>
            </Link>
            <Link href="/dashboard">
              <button className="ef-btn ef-btn-secondary">
                Go to Dashboard
                <ArrowRight className="h-4 w-4" />
              </button>
            </Link>
          </div>

          <p className="text-sm text-gray-500 mt-8">
            Questions? Email us at{' '}
            <a href="mailto:hello@everflowcfo.com" className="text-[var(--brand-primary)] font-semibold">
              hello@everflowcfo.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
