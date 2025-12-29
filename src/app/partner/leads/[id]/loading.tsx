export default function PartnerLeadLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Back link skeleton */}
      <div className="h-4 w-40 bg-[var(--color-background)] rounded" />

      {/* Header skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div className="space-y-2">
          <div className="h-8 w-48 bg-[var(--color-background)] rounded" />
          <div className="h-4 w-32 bg-[var(--color-background)] rounded" />
        </div>
        <div className="h-6 w-20 bg-[var(--color-background)] rounded" />
      </div>

      {/* Grid skeleton */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Mobile status card */}
        <div className="lg:hidden">
          <div className="bg-[var(--color-background)] border border-[var(--color-border)] p-6 rounded-lg">
            <div className="h-12 bg-[var(--color-background-alt)] rounded" />
          </div>
        </div>

        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[var(--color-background)] border border-[var(--color-border)] p-6 rounded-lg">
            <div className="h-6 w-40 bg-[var(--color-background-alt)] rounded mb-6" />
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-16 bg-[var(--color-background-alt)] rounded" />
              ))}
            </div>
          </div>
          
          <div className="bg-[var(--color-background)] border border-[var(--color-border)] p-6 rounded-lg">
            <div className="h-6 w-40 bg-[var(--color-background-alt)] rounded mb-6" />
            <div className="space-y-4">
              <div className="h-12 bg-[var(--color-background-alt)] rounded" />
              <div className="h-24 bg-[var(--color-background-alt)] rounded" />
            </div>
          </div>
        </div>

        {/* Desktop sidebar */}
        <div className="hidden lg:block space-y-6">
          <div className="bg-[var(--color-background)] border border-[var(--color-border)] p-6 rounded-lg">
            <div className="h-6 w-32 bg-[var(--color-background-alt)] rounded mb-4" />
            <div className="h-16 bg-[var(--color-background-alt)] rounded" />
          </div>
          <div className="bg-[var(--color-background)] border border-[var(--color-border)] p-6 rounded-lg">
            <div className="h-6 w-24 bg-[var(--color-background-alt)] rounded mb-4" />
            <div className="space-y-3">
              <div className="h-8 bg-[var(--color-background-alt)] rounded" />
              <div className="h-8 bg-[var(--color-background-alt)] rounded" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
