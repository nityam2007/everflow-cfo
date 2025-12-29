'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface PartnerLeadStatusProps {
  assignmentId: string;
  currentStatus: string;
}

export function PartnerLeadStatus({ assignmentId, currentStatus }: PartnerLeadStatusProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function updateStatus(newStatus: string) {
    if (newStatus === currentStatus) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/partner/assignments/${assignmentId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to update status');
      }

      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }

  const statuses = [
    { value: 'PENDING', label: 'Pending', description: 'Not yet started' },
    { value: 'IN_PROGRESS', label: 'In Progress', description: 'Currently processing' },
    { value: 'COMPLETED', label: 'Completed', description: 'Processing finished' },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Update Status</CardTitle>
        <CardDescription>Mark your progress on this lead</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {error && (
          <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        {statuses.map((status) => (
          <button
            key={status.value}
            onClick={() => updateStatus(status.value)}
            disabled={loading || currentStatus === status.value}
            className={`w-full rounded-lg border p-3 text-left transition-colors ${
              currentStatus === status.value
                ? 'border-primary bg-primary/5'
                : 'hover:border-slate-400 hover:bg-slate-50'
            } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{status.label}</p>
                <p className="text-sm text-[var(--color-foreground-muted)]">{status.description}</p>
              </div>
              {currentStatus === status.value && (
                <div className="h-3 w-3 rounded-full bg-[var(--brand-primary)]" />
              )}
              {loading && currentStatus !== status.value && (
                <Loader2 className="h-4 w-4 animate-spin text-[var(--color-foreground-muted)]" />
              )}
            </div>
          </button>
        ))}
      </CardContent>
    </Card>
  );
}
