import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t border-border/20 py-16 mt-32">
      <div className="mx-auto max-w-5xl px-6">
        <div className="flex flex-col md:flex-row items-start justify-between gap-12">
          <div>
            <p className="text-base font-medium tracking-wide">EverflowCFO</p>
            <p className="mt-2 text-sm text-muted-foreground max-w-xs leading-relaxed">
              Payroll credit pre-assessment for qualifying employers.
            </p>
          </div>
          <nav className="flex gap-12 text-sm">
            <div className="space-y-3">
              <p className="text-muted-foreground text-xs uppercase tracking-wider">Resources</p>
              <Link href="/quiz" className="block text-foreground/80 hover:text-foreground transition-colors">
                Assessment
              </Link>
              <Link href="/calculator" className="block text-foreground/80 hover:text-foreground transition-colors">
                Calculator
              </Link>
              <Link href="/estimator" className="block text-foreground/80 hover:text-foreground transition-colors">
                Full Estimator
              </Link>
            </div>
            <div className="space-y-3">
              <p className="text-muted-foreground text-xs uppercase tracking-wider">Partners</p>
              <Link href="/login" className="block text-foreground/80 hover:text-foreground transition-colors">
                Partner Login
              </Link>
            </div>
          </nav>
        </div>
        <div className="mt-16 pt-8 border-t border-border/10">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} EverflowCFO. This platform provides preliminary estimates only 
            and does not constitute tax, legal, or accounting advice.
          </p>
        </div>
      </div>
    </footer>
  );
}
