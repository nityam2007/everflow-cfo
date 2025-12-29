'use client';

import Link from 'next/link';
import { Building2, FileText, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { signOut } from 'next-auth/react';

interface PartnerHeaderProps {
  user: {
    name?: string | null;
  };
}

export function PartnerHeader({ user }: PartnerHeaderProps) {
  return (
    <header className="border-b border-[var(--color-border)] bg-[var(--color-background)]">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 flex items-center justify-center bg-[var(--brand-primary)]">
            <span className="text-white font-bold text-sm">EF</span>
          </div>
          <span className="text-base font-semibold text-[var(--color-foreground)]">
            Partner Portal
          </span>
        </div>

        <nav className="flex items-center gap-6">
          <Link
            href="/partner"
            className="flex items-center gap-2 text-sm text-[var(--color-foreground-muted)] hover:text-[var(--color-foreground)] transition-colors"
          >
            <FileText className="h-4 w-4" />
            Assigned Leads
          </Link>

          <div className="h-6 w-px bg-[var(--color-border)]" />

          <div className="flex items-center gap-4">
            <span className="text-sm text-[var(--color-foreground-muted)]">
              {user.name}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="text-[var(--color-foreground-muted)] hover:text-[var(--color-foreground)]"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign out
            </Button>
          </div>
        </nav>
      </div>
    </header>
  );
}
