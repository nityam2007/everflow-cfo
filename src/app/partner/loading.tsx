export default function PartnerLoading() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Header skeleton */}
      <div className="space-y-2">
        <div className="h-8 w-64 bg-[var(--color-background)] rounded" />
        <div className="h-4 w-48 bg-[var(--color-background)] rounded" />
      </div>

      {/* Stats grid skeleton */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-[var(--color-background)] border border-[var(--color-border)] p-6 rounded-lg">
            <div className="h-4 w-24 bg-[var(--color-background-alt)] rounded mb-4" />
            <div className="h-8 w-12 bg-[var(--color-background-alt)] rounded" />
          </div>
        ))}
      </div>

      {/* Applications skeleton */}
      <div className="bg-[var(--color-background)] border border-[var(--color-border)] rounded-lg p-6">
        <div className="h-6 w-40 bg-[var(--color-background-alt)] rounded mb-6" />
        
        {/* Mobile cards */}
        <div className="md:hidden space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-32 bg-[var(--color-background-alt)] rounded-lg" />
          ))}
        </div>
        
        {/* Desktop table */}
        <div className="hidden md:block space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-[var(--color-background-alt)] rounded" />
          ))}
        </div>
      </div>
    </div>
  );
}
