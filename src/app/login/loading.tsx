import { Loader2 } from 'lucide-react';

export default function LoginLoading() {
  return (
    <div className="min-h-screen bg-[var(--color-background)] flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-[var(--brand-primary)]" />
    </div>
  );
}
