import Link from 'next/link';

export function Footer() {
  return (
    <footer className="ef-footer-light">
      <div className="ef-container">
        {/* Footer Grid - Stack on mobile, 2 cols on tablet+ */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 py-8 lg:py-12">
          {/* Left Column - Brand */}
          <div className="text-center lg:text-left">
            <div className="ef-logo mb-4 justify-center lg:justify-start">
              <span className="text-lg font-bold text-gray-900">EverflowCFO</span>
            </div>
            <p className="ef-footer-brand-text-light max-w-md mx-auto lg:mx-0">
              Professional payroll credit recovery services for restaurants, hospitality, 
              and businesses. We identify federal tax credits you may be eligible for.
            </p>
          </div>

          {/* Right Column - Links: 3 cols on mobile too but smaller gap */}
          <div className="grid grid-cols-3 gap-4 sm:gap-8 text-center lg:text-left">
            {/* Programs */}
            <div>
              <h4 className="ef-footer-title-light text-xs sm:text-sm">Programs</h4>
              <div className="ef-footer-links">
                <Link href="/#programs" className="ef-footer-link-light text-xs sm:text-sm">FICA Tip</Link>
                <Link href="/#programs" className="ef-footer-link-light text-xs sm:text-sm">WOTC</Link>
                <Link href="/credits/rd" className="ef-footer-link-light text-xs sm:text-sm">R&D</Link>
              </div>
            </div>

            {/* Resources */}
            <div>
              <h4 className="ef-footer-title-light text-xs sm:text-sm">Resources</h4>
              <div className="ef-footer-links">
                <Link href="/calculator" className="ef-footer-link-light text-xs sm:text-sm">Calculator</Link>
                <Link href="/estimator" className="ef-footer-link-light text-xs sm:text-sm">Quiz</Link>
                <Link href="/#about" className="ef-footer-link-light text-xs sm:text-sm">How It Works</Link>
              </div>
            </div>

            {/* Partners */}
            <div>
              <h4 className="ef-footer-title-light text-xs sm:text-sm">Partners</h4>
              <div className="ef-footer-links">
                <Link href="/login" className="ef-footer-link-light text-xs sm:text-sm">Login</Link>
                <Link href="/partner" className="ef-footer-link-light text-xs sm:text-sm">Portal</Link>
              </div>
            </div>
          </div>
        </div>

        {/* Copyright Section */}
        <div className="border-t border-gray-200 py-6">
          <div className="flex flex-col items-center gap-3 text-center md:flex-row md:items-center md:justify-between md:text-left">
            <div className="flex flex-wrap items-center justify-center gap-1 sm:gap-2">
              <span className="text-xs sm:text-sm font-medium text-gray-700">© {new Date().getFullYear()} EverflowCFO</span>
              <span className="text-gray-300">•</span>
              <span className="text-xs sm:text-sm text-gray-500">All rights reserved</span>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 text-xs text-gray-400">
              <span>Estimates are preliminary</span>
              <span className="text-gray-300">|</span>
              <span>Not tax or legal advice</span>
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-4 text-center max-w-3xl mx-auto md:mx-0 md:text-left">
            EverflowCFO is a capital advisory firm focused on financial architecture and deal preparation. 
            Services are limited to consulting, modeling, and documentation.
          </p>
        </div>
      </div>
    </footer>
  );
}