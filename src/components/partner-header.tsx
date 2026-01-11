'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FileText, LogOut, Menu, X, Home, CreditCard, User, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { signOut } from 'next-auth/react';

interface PartnerHeaderProps {
  user: {
    name?: string | null;
    email?: string | null;
  };
}

const mobileNavItems = [
  { title: 'Dashboard', href: '/partner', icon: Home },
  { title: 'My Applications', href: '/partner/leads', icon: FileText },
  { title: 'Billing', href: '/partner/billing', icon: CreditCard },
  { title: 'My Profile', href: '/partner/profile', icon: User },
];

export function PartnerHeader({ user }: PartnerHeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/partner') return pathname === '/partner';
    return pathname.startsWith(href);
  };

  return (
    <header className="h-16 border-b border-[var(--color-border)] bg-[var(--color-background)] sticky top-0 z-40">
      <div className="h-full flex items-center justify-between px-4 lg:px-6">
        {/* Left side - Logo (mobile) / Page Title (desktop) */}
        <div className="flex items-center gap-3">
          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 -ml-2 text-[var(--color-foreground-muted)] hover:text-[var(--color-foreground)]"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          
          {/* Mobile Logo */}
          <span className="md:hidden text-base font-semibold text-[var(--color-foreground)]">
            EverflowCFO
          </span>
        </div>

        {/* Right side - Actions */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Notifications (placeholder) */}
          <button className="p-2 text-[var(--color-foreground-muted)] hover:text-[var(--color-foreground)] hover:bg-[var(--color-background-alt)] rounded-md">
            <Bell className="h-5 w-5" />
          </button>

          {/* User menu - Desktop */}
          <div className="hidden md:flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-medium text-[var(--color-foreground)]">
                {user.name || 'User'}
              </p>
              <p className="text-xs text-[var(--color-foreground-muted)]">
                Client Account
              </p>
            </div>
            <div className="h-9 w-9 rounded-full bg-[var(--brand-primary)] flex items-center justify-center">
              <span className="text-white text-sm font-medium">
                {(user.name || 'U').charAt(0).toUpperCase()}
              </span>
            </div>
          </div>

          {/* Sign out - Desktop */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="hidden md:flex text-[var(--color-foreground-muted)] hover:text-[var(--color-foreground)]"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sign out
          </Button>
        </div>
      </div>

      {/* Mobile nav menu */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 top-16 z-50 bg-[var(--color-background)]">
          <nav className="px-4 py-4 space-y-1">
            {mobileNavItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-3 rounded-md text-sm font-medium ${
                    active
                      ? 'bg-[var(--brand-primary)] text-white'
                      : 'text-[var(--color-foreground)] hover:bg-[var(--color-background-alt)]'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Icon className="h-5 w-5" />
                  {item.title}
                </Link>
              );
            })}
          </nav>
          
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-[var(--color-border)]">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-full bg-[var(--brand-primary)] flex items-center justify-center">
                <span className="text-white font-medium">
                  {(user.name || 'U').charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <p className="font-medium text-[var(--color-foreground)]">{user.name}</p>
                <p className="text-sm text-[var(--color-foreground-muted)]">Client Account</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="w-full"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign out
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
