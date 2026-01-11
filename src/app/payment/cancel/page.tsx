import Link from 'next/link';
import { XCircle, ArrowLeft, RefreshCw } from 'lucide-react';

export default function PaymentCancelPage() {
  return (
    <div className="min-h-screen bg-[var(--color-background)] flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        {/* Icon */}
        <div className="mx-auto w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
          <XCircle className="w-10 h-10 text-gray-400" />
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-[var(--color-foreground)] mb-3">
          Payment Cancelled
        </h1>

        {/* Description */}
        <p className="text-[var(--color-foreground-muted)] mb-8">
          Your payment was cancelled. No charges have been made to your account.
          If you have any questions, please don't hesitate to contact us.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[var(--color-background-alt)] text-[var(--color-foreground)] rounded-lg font-medium hover:bg-gray-200 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
          <Link
            href="/#capital"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[var(--brand-primary)] text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </Link>
        </div>

        {/* Support Link */}
        <p className="mt-8 text-sm text-[var(--color-foreground-muted)]">
          Need help?{' '}
          <Link href="/#contact" className="text-[var(--brand-primary)] hover:underline">
            Contact Support
          </Link>
        </p>
      </div>
    </div>
  );
}
