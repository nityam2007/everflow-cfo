import Link from 'next/link';
import { XOctagon, ArrowLeft, RefreshCw, CreditCard, Mail } from 'lucide-react';

export default function PaymentFailedPage() {
  return (
    <div className="min-h-screen bg-[var(--color-background)] flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        {/* Icon */}
        <div className="mx-auto w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6">
          <XOctagon className="w-10 h-10 text-red-500" />
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-[var(--color-foreground)] mb-3">
          Payment Failed
        </h1>

        {/* Description */}
        <p className="text-[var(--color-foreground-muted)] mb-6">
          We were unable to process your payment. Your card was not charged.
        </p>

        {/* Error Details */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-8 text-left">
          <p className="text-sm text-amber-800">
            <strong>Common reasons for failed payments:</strong>
          </p>
          <ul className="mt-2 text-sm text-amber-700 list-disc list-inside space-y-1">
            <li>Insufficient funds in your account</li>
            <li>Card expired or invalid card details</li>
            <li>Your bank declined the transaction</li>
            <li>Daily transaction limit reached</li>
          </ul>
        </div>

        {/* Suggestions */}
        <div className="bg-[var(--color-background-alt)] rounded-lg p-4 mb-8">
          <div className="flex items-start gap-3 text-left">
            <CreditCard className="w-5 h-5 text-[var(--brand-primary)] mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-[var(--color-foreground)]">
                Try a different payment method
              </p>
              <p className="text-xs text-[var(--color-foreground-muted)] mt-1">
                You can use another credit card, debit card, or contact your bank
                to authorize the transaction.
              </p>
            </div>
          </div>
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
        <div className="mt-8">
          <p className="text-sm text-[var(--color-foreground-muted)]">
            Need assistance?{' '}
            <a
              href="mailto:support@everflowcfo.com"
              className="inline-flex items-center gap-1 text-[var(--brand-primary)] hover:underline"
            >
              <Mail className="w-3 h-3" />
              Contact Support
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
