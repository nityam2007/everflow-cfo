// Loading skeleton for dashboard - uses CSS animations instead of icons

export default function DashboardLoading() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Header skeleton */}
      <div className="space-y-2">
        <div className="h-8 w-48 bg-[var(--color-background-alt)] rounded" />
        <div className="h-4 w-64 bg-[var(--color-background-alt)] rounded" />
      </div>

      {/* Stats grid skeleton */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-[var(--color-background)] border border-[var(--color-border)] p-6 rounded-lg">
            <div className="h-4 w-24 bg-[var(--color-background-alt)] rounded mb-4" />
            <div className="h-8 w-16 bg-[var(--color-background-alt)] rounded" />
          </div>
        ))}
      </div>

      {/* Content skeleton */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="bg-[var(--color-background)] border border-[var(--color-border)] p-6 rounded-lg">
          <div className="h-6 w-32 bg-[var(--color-background-alt)] rounded mb-4" />
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-[var(--color-background-alt)] rounded" />
            ))}
          </div>
        </div>
        <div className="bg-[var(--color-background)] border border-[var(--color-border)] p-6 rounded-lg">
          <div className="h-6 w-32 bg-[var(--color-background-alt)] rounded mb-4" />
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-[var(--color-background-alt)] rounded" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
