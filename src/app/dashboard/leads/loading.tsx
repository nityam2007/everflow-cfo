export default function LeadsLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-8 w-32 bg-[var(--color-background-alt)] rounded" />
          <div className="h-4 w-48 bg-[var(--color-background-alt)] rounded" />
        </div>
        <div className="h-10 w-32 bg-[var(--color-background-alt)] rounded" />
      </div>

      {/* Filters skeleton */}
      <div className="flex gap-4">
        <div className="h-10 w-64 bg-[var(--color-background-alt)] rounded" />
        <div className="h-10 w-32 bg-[var(--color-background-alt)] rounded" />
        <div className="h-10 w-32 bg-[var(--color-background-alt)] rounded" />
      </div>

      {/* Table skeleton */}
      <div className="bg-[var(--color-background)] border border-[var(--color-border)] rounded-lg">
        <div className="p-6 border-b border-[var(--color-border)]">
          <div className="h-6 w-24 bg-[var(--color-background-alt)] rounded" />
        </div>
        <div className="p-6 space-y-4">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="h-16 bg-[var(--color-background-alt)] rounded" />
          ))}
        </div>
      </div>
    </div>
  );
}
