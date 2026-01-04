interface PageHeaderProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
}

export function PageHeader({ title, description, children }: PageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
      <div>
        <h1 className="text-xl sm:text-2xl font-semibold text-[var(--color-foreground)]">
          {title}
        </h1>
        {description && (
          <p className="text-sm text-[var(--color-foreground-muted)] mt-1">
            {description}
          </p>
        )}
      </div>
      {children && <div className="flex items-center gap-2 sm:gap-3">{children}</div>}
    </div>
  );
}
