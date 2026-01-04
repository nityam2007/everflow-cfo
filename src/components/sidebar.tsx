'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Activity,
  Settings,
  Download,
  LogOut,
  Building2,
  UserCog,
  FileCode,
  ClipboardList,
  Menu,
  X,
  type LucideIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  adminOnly?: boolean;
  staffOnly?: boolean;
  exactMatch?: boolean;
}

interface SidebarProps {
  user: {
    name?: string | null;
    email?: string | null;
    role?: string;
  };
  isAdmin: boolean;
  signOutAction: () => Promise<void>;
}

const navItems: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, exactMatch: true },
  { href: '/dashboard/leads', label: 'Leads', icon: Users },
  { href: '/dashboard/my-tasks', label: 'My Tasks', icon: ClipboardList, staffOnly: true },
  { href: '/dashboard/settings/users', label: 'Users', icon: UserCog, adminOnly: true },
  { href: '/dashboard/settings/partners', label: 'Partners', icon: Building2, adminOnly: true },
  { href: '/dashboard/settings/rules', label: 'Rules', icon: FileCode, adminOnly: true },
  { href: '/dashboard/audit', label: 'Audit Log', icon: Activity, adminOnly: true },
  { href: '/dashboard/settings/site', label: 'Site Settings', icon: Settings, adminOnly: true },
];

export function Sidebar({ user, isAdmin, signOutAction }: SidebarProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 h-14 flex items-center justify-between px-4 bg-[var(--color-background)] border-b border-[var(--color-border)]">
        <Link href="/dashboard" className="flex items-center gap-2">
          {/* <div className="h-8 w-8 flex items-center justify-center bg-[var(--brand-primary)]">
            <span className="text-white font-bold text-sm">EF</span>
          </div> */}
          <span className="text-base font-semibold text-[var(--color-foreground)]">
            EverflowCFO
          </span>
        </Link>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 text-[var(--color-foreground-muted)] hover:text-[var(--color-foreground)]"
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile menu overlay */}
      {mobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 z-40 bg-black/50"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar - hidden on mobile unless menu is open */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 border-r border-[var(--color-border)] bg-[var(--color-background)] transition-transform duration-300 ease-in-out",
        "lg:translate-x-0",
        mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      )}>
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-16 items-center border-b border-[var(--color-border)] px-6">
          <Link href="/dashboard" className="flex items-center gap-2">
            {/* <div className="h-8 w-8 flex items-center justify-center bg-[var(--brand-primary)]">
              <span className="text-white font-bold text-sm">EF</span>
            </div> */}
            <span className="text-base font-semibold text-[var(--color-foreground)]">
              EverflowCFO
            </span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 p-4">
          {navItems.map((item) => {
            if (item.adminOnly && !isAdmin) return null;
            if (item.staffOnly && isAdmin) return null; // Staff-only items hidden for admin
            
            const isActive = item.exactMatch 
              ? pathname === item.href
              : pathname === item.href || pathname.startsWith(item.href + '/');
            
            return (
              <Link key={item.href} href={item.href} onClick={() => setMobileMenuOpen(false)}>
                <Button
                  variant="ghost"
                  className={cn(
                    'w-full justify-start text-[var(--color-foreground-muted)] hover:text-[var(--color-foreground)] hover:bg-[var(--color-background-alt)]',
                    isActive && 'bg-[var(--color-background-alt)] text-[var(--color-foreground)]'
                  )}
                >
                  <item.icon className="mr-3 h-4 w-4" />
                  {item.label}
                </Button>
              </Link>
            );
          })}
          
          {isAdmin && (
            <a href="/api/leads/export" download>
              <Button
                variant="ghost"
                className="w-full justify-start text-[var(--color-foreground-muted)] hover:text-[var(--color-foreground)] hover:bg-[var(--color-background-alt)]"
              >
                <Download className="mr-3 h-4 w-4" />
                Export Leads
              </Button>
            </a>
          )}
        </nav>

        {/* User section */}
        <div className="border-t border-[var(--color-border)] p-4">
          <div className="mb-3 px-3">
            <p className="text-sm font-medium text-[var(--color-foreground)]">
              {user.name}
            </p>
            <p className="text-xs text-[var(--color-foreground-muted)]">
              {user.email}
            </p>
            <p className="mt-1">
              <span className="inline-flex items-center rounded-full bg-[var(--brand-primary-light)] px-2 py-0.5 text-xs font-medium text-[var(--brand-primary)]">
                {user.role}
              </span>
            </p>
          </div>
          <form action={signOutAction}>
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start text-[var(--color-foreground-muted)] hover:text-[var(--color-foreground)]"
            >
              <LogOut className="mr-3 h-4 w-4" />
              Sign out
            </Button>
          </form>
        </div>
      </div>
    </aside>
    
    {/* Spacer for mobile header */}
    <div className="lg:hidden h-14" />
    </>
  );
}
