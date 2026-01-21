'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, 
  FileText, 
  CreditCard, 
  User, 
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface PartnerSidebarProps {
  userName?: string | null;
}

const navItems = [
  {
    title: 'Dashboard',
    href: '/partner',
    icon: Home,
  },
  {
    title: 'My Applications',
    href: '/partner/leads',
    icon: FileText,
  },
  {
    title: 'Billing',
    href: '/partner/billing',
    icon: CreditCard,
  },
  {
    title: 'My Profile',
    href: '/partner/profile',
    icon: User,
  },
];

export function PartnerSidebar({ userName }: PartnerSidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const isActive = (href: string) => {
    if (href === '/partner') {
      return pathname === '/partner';
    }
    return pathname.startsWith(href);
  };

  return (
    <aside
      className={cn(
        'hidden md:flex flex-col bg-[var(--color-background)] border-r border-[var(--color-border)] transition-all duration-300',
        collapsed ? 'w-16' : 'w-56'
      )}
    >
      {/* Sidebar Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-[var(--color-border)]">
        {!collapsed && (
          <span className="text-base font-semibold text-[var(--color-foreground)]">
            My Portal
          </span>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-md hover:bg-[var(--color-background-alt)] text-[var(--color-foreground-muted)]"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-2 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors',
                active
                  ? 'bg-[var(--brand-primary)] text-white'
                  : 'text-[var(--color-foreground-muted)] hover:bg-[var(--color-background-alt)] hover:text-[var(--color-foreground)]'
              )}
              title={collapsed ? item.title : undefined}
            >
              <Icon className={cn('h-5 w-5 shrink-0', active && 'text-white')} />
              {!collapsed && <span>{item.title}</span>}
            </Link>
          );
        })}
      </nav>

      {/* User Info */}
      {!collapsed && userName && (
        <div className="p-4 border-t border-[var(--color-border)]">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-[var(--brand-primary)] flex items-center justify-center">
              <span className="text-white text-sm font-medium">
                {userName.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[var(--color-foreground)] truncate">
                {userName}
              </p>
              <p className="text-xs text-[var(--color-foreground-muted)]">Client</p>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
