import Link from 'next/link';

export function Header() {
  return (
    <header className="ef-header">
      <div className="ef-header-inner">
        <Link href="/" className="ef-logo">
          <div className="ef-logo-icon">EF</div>
          <span className="ef-logo-text">EverflowCFO</span>
        </Link>
        <nav className="ef-nav hidden md:flex">
          <Link href="/estimator" className="ef-nav-link">Assessment</Link>
          <Link href="/calculator" className="ef-nav-link">Calculator</Link>
          <Link href="/login" className="ef-nav-link">Partner Login</Link>
          <Link href="/estimator">
            <button className="ef-btn ef-btn-primary">Begin Assessment</button>
          </Link>
        </nav>
      </div>
    </header>
  );
}
