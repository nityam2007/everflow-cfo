import Link from 'next/link';

export function Footer() {
  return (
    <footer className="ef-footer">
      <div className="ef-container">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="ef-logo mb-4">
              <div className="ef-logo-icon">EF</div>
              <span className="text-lg font-semibold text-white">EverflowCFO</span>
            </div>
            <p className="ef-footer-muted text-[var(--text-sm)] max-w-md leading-relaxed">
              Professional payroll credit pre-assessment services for restaurants, hospitality, 
              and businesses. We identify federal tax credits you may be eligible for.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-[var(--text-sm)] font-semibold mb-4">
              Resources
            </h4>
            <ul className="space-y-3">
              <li>
                <Link href="/calculator" className="ef-footer-link">
                  Credit Calculator
                </Link>
              </li>
              <li>
                <Link href="/estimator" className="ef-footer-link">
                  Pre-Assessment
                </Link>
              </li>
            </ul>
          </div>

          {/* Partners */}
          <div>
            <h4 className="text-[var(--text-sm)] font-semibold mb-4">
              Partners
            </h4>
            <ul className="space-y-3">
              <li>
                <Link href="/login" className="ef-footer-link">
                  Partner Login
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8">
          <p className="text-gray-500 text-[var(--text-xs)] leading-relaxed max-w-4xl">
            <strong className="text-gray-400">Disclaimer:</strong> Estimates provided are preliminary and based on self-reported information. 
            Final eligibility and credit amounts require payroll and tax documentation verification. 
            This platform does not provide tax, legal, or financial advice. All claims are subject to IRS review.
          </p>
          <p className="text-gray-500 text-[var(--text-xs)] mt-4">
            © {new Date().getFullYear()} EverflowCFO. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
