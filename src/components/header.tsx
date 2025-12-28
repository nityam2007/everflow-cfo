import Link from 'next/link';

interface HeaderProps {
  showNav?: boolean;
}

export function Header({ showNav = true }: HeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/20">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-6">
        <Link href="/" className="text-base font-medium tracking-wide">
          EverflowCFO
        </Link>
        {showNav && (
          <nav className="flex items-center gap-8 text-sm tracking-wide">
            <Link 
              href="/quiz" 
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Assessment
            </Link>
            <Link 
              href="/calculator" 
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Calculator
            </Link>
            <Link 
              href="/login" 
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Login
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
}
