import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger';
  className?: string;
}

const variantClasses = {
  default: '',
  success: 'text-[var(--color-success)]',
  warning: 'text-[var(--color-warning)]',
  danger: 'text-[var(--color-error)]',
};

export function StatCard({
  title,
  value,
  description,
  icon,
  variant = 'default',
  className,
}: StatCardProps) {
  return (
    <div
      className={cn(
        'bg-[var(--color-background)] border border-[var(--color-border)] p-6',
        className
      )}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-[var(--color-foreground-muted)]">{title}</p>
          <p className={cn('text-3xl font-light mt-2', variantClasses[variant])}>
            {value}
          </p>
          {description && (
            <p className="text-xs text-[var(--color-foreground-subtle)] mt-1">
              {description}
            </p>
          )}
        </div>
        {icon && (
          <div className="text-[var(--color-foreground-subtle)]">{icon}</div>
        )}
      </div>
    </div>
  );
}
