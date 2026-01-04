import Link from 'next/link';

export function Footer() {
  return (
    <footer className="ef-footer-light">
      <div className="ef-container">
        <div className="ef-footer-grid">
          {/* Brand */}
          <div className="ef-footer-brand">
            <div className="ef-logo mb-4">
              <span className="text-lg font-bold text-gray-900">EverflowCFO</span>
            </div>
            <p className="ef-footer-brand-text-light">
              Professional payroll credit recovery services for restaurants, hospitality, 
              and businesses. We identify federal tax credits you may be eligible for.
            </p>
          </div>

          {/* Programs */}
          <div className="ef-footer-col">
            <h4 className="ef-footer-title-light">Programs</h4>
            <div className="ef-footer-links">
              <Link href="/#programs" className="ef-footer-link-light">FICA Tip Credit</Link>
              <Link href="/#programs" className="ef-footer-link-light">WOTC</Link>
              <Link href="/#programs" className="ef-footer-link-light">ERC</Link>
            </div>
          </div>

          {/* Resources */}
          <div className="ef-footer-col">
            <h4 className="ef-footer-title-light">Resources</h4>
            <div className="ef-footer-links">
              <Link href="/calculator" className="ef-footer-link-light">Credit Calculator</Link>
              <Link href="/estimator" className="ef-footer-link-light">Start Quiz</Link>
              <Link href="/#about" className="ef-footer-link-light">How It Works</Link>
            </div>
          </div>

          {/* Partners */}
          <div className="ef-footer-col">
            <h4 className="ef-footer-title-light">Partners</h4>
            <div className="ef-footer-links">
              <Link href="/login" className="ef-footer-link-light">Partner Login</Link>
              <Link href="/partner" className="ef-footer-link-light">Partner Portal</Link>
            </div>
          </div>
        </div>

        <div className="ef-footer-bottom-light">
          <p>© {new Date().getFullYear()} EverflowCFO. All rights reserved.</p>
          <p className="ef-footer-disclaimer-light">
            <span className="text-gray-500">Disclaimer:</span> Estimates are preliminary. 
            Final eligibility requires documentation verification. Not tax or legal advice.
          </p>
        </div>
      </div>
    </footer>
  );
}