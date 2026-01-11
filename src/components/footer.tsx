import Link from 'next/link';

export function Footer() {
  return (
    <footer className="ef-footer-light">
      <div className="ef-container">
        {/* 2-Column Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 py-12">
          {/* Left Column - Brand */}
          <div>
            <div className="ef-logo mb-4">
              <span className="text-lg font-bold text-gray-900">EverflowCFO</span>
            </div>
            <p className="ef-footer-brand-text-light max-w-md">
              Professional payroll credit recovery services for restaurants, hospitality, 
              and businesses. We identify federal tax credits you may be eligible for.
            </p>
          </div>

          {/* Right Column - Links */}
          <div className="grid grid-cols-3 gap-8">
            {/* Programs */}
            <div>
              <h4 className="ef-footer-title-light">Programs</h4>
              <div className="ef-footer-links">
                <Link href="/#programs" className="ef-footer-link-light">FICA Tip Credit</Link>
                <Link href="/#programs" className="ef-footer-link-light">WOTC</Link>
                <Link href="/#programs" className="ef-footer-link-light">ERC</Link>
              </div>
            </div>

            {/* Resources */}
            <div>
              <h4 className="ef-footer-title-light">Resources</h4>
              <div className="ef-footer-links">
                <Link href="/calculator" className="ef-footer-link-light">Calculator</Link>
                <Link href="/estimator" className="ef-footer-link-light">Start Quiz</Link>
                <Link href="/#about" className="ef-footer-link-light">How It Works</Link>
              </div>
            </div>

            {/* Partners */}
            <div>
              <h4 className="ef-footer-title-light">Partners</h4>
              <div className="ef-footer-links">
                <Link href="/login" className="ef-footer-link-light">Partner Login</Link>
                <Link href="/partner" className="ef-footer-link-light">Partner Portal</Link>
              </div>
            </div>
          </div>
        </div>

        {/* Copyright Section */}
        <div className="border-t border-gray-200 py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700">© {new Date().getFullYear()} EverflowCFO</span>
              <span className="hidden md:inline text-gray-300">•</span>
              <span className="text-sm text-gray-500">All rights reserved</span>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-xs text-gray-400">
              <span>Estimates are preliminary</span>
              <span className="hidden sm:inline text-gray-300">|</span>
              <span>Not tax or legal advice</span>
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-4 text-center md:text-left max-w-3xl">
            EverflowCFO is a capital advisory firm focused on financial architecture and deal preparation. 
            Services are limited to consulting, modeling, and documentation.
          </p>
        </div>
      </div>
    </footer>
  );
}