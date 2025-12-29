import * as React from 'react';
import { cn } from '@/lib/utils';

const Badge = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning';
  }
>(({ className, variant = 'default', ...props }, ref) => {
  const variantClasses = {
    default: 'bg-[var(--brand-primary-light)] text-[var(--brand-primary)]',
    secondary: 'bg-[var(--color-background-alt)] text-[var(--color-foreground-muted)]',
    destructive: 'bg-red-50 text-red-700 border border-red-200',
    outline: 'border border-[var(--color-border)] bg-[var(--color-background)] text-[var(--color-foreground)]',
    success: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    warning: 'bg-amber-50 text-amber-700 border border-amber-200',
  };

  return (
    <div
      ref={ref}
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors',
        variantClasses[variant],
        className
      )}
      {...props}
    />
  );
});
Badge.displayName = 'Badge';

export { Badge };
