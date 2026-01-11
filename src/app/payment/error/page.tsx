import Link from 'next/link';
import { AlertTriangle, ArrowLeft, RefreshCw, Mail } from 'lucide-react';

export default function PaymentErrorPage() {
  return (
    <div className="min-h-screen bg-[var(--color-background)] flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        {/* Icon */}
        <div className="mx-auto w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6">
          <AlertTriangle className="w-10 h-10 text-red-500" />
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-[var(--color-foreground)] mb-3">
          Payment Error
        </h1>

        {/* Description */}
        <p className="text-[var(--color-foreground-muted)] mb-6">
          We encountered an error processing your payment. This could be due to
          a temporary issue with our payment system.
        </p>

        {/* Error Details */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8 text-left">
          <p className="text-sm text-red-800">
            <strong>What happened?</strong>
          </p>
          <ul className="mt-2 text-sm text-red-700 list-disc list-inside space-y-1">
            <li>The payment session may have expired</li>
            <li>There may be a temporary service disruption</li>
            <li>Your browser may have blocked the payment popup</li>
          </ul>
        </div>

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
        <div className="mt-8 p-4 bg-[var(--color-background-alt)] rounded-lg">
          <p className="text-sm text-[var(--color-foreground-muted)] mb-2">
            If this problem persists, please contact our support team:
          </p>
          <a
            href="mailto:support@everflowcfo.com"
            className="inline-flex items-center gap-2 text-[var(--brand-primary)] hover:underline text-sm font-medium"
          >
            <Mail className="w-4 h-4" />
            support@everflowcfo.com
          </a>
        </div>
      </div>
    </div>
  );
}
