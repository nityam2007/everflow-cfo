'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Building2, Plus, Clock } from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface Partner {
  id: string;
  name: string;
  companyName: string;
}

interface Assignment {
  id: string;
  status: string;
  notes: string | null;
  assignedAt: Date;
  partner: Partner;
  assignedBy: { name: string } | null;
}

interface PartnerAssignmentProps {
  leadId: string;
  assignments: Assignment[];
  partnersList: Partner[];
}

export function PartnerAssignment({
  leadId,
  assignments,
  partnersList,
}: PartnerAssignmentProps) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedPartnerId, setSelectedPartnerId] = useState('');
  const [notes, setNotes] = useState('');

  const statusColors: Record<string, 'default' | 'secondary' | 'success' | 'warning' | 'destructive'> = {
    PENDING: 'warning',
    IN_PROGRESS: 'secondary',
    COMPLETED: 'success',
    CANCELLED: 'destructive',
  };

  // Filter out already assigned partners
  const activeAssignmentPartnerIds = assignments
    .filter((a) => ['PENDING', 'IN_PROGRESS'].includes(a.status))
    .map((a) => a.partner.id);

  const availablePartners = partnersList.filter(
    (p) => !activeAssignmentPartnerIds.includes(p.id)
  );

  async function handleAssign(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedPartnerId) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/leads/${leadId}/partner`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          partnerId: selectedPartnerId,
          notes: notes || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to assign partner');
      }

      setShowForm(false);
      setSelectedPartnerId('');
      setNotes('');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Partner Assignments</CardTitle>
            <CardDescription>
              Backend payroll processors assigned to this lead
            </CardDescription>
          </div>
          {availablePartners.length > 0 && !showForm && (
            <Button size="sm" onClick={() => setShowForm(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Assign
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Assignment form */}
        {showForm && (
          <form onSubmit={handleAssign} className="space-y-4 rounded-lg border p-4">
            {error && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium">Select Partner</label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                value={selectedPartnerId}
                onChange={(e) => setSelectedPartnerId(e.target.value)}
                required
              >
                <option value="">Choose a partner...</option>
                {availablePartners.map((partner) => (
                  <option key={partner.id} value={partner.id}>
                    {partner.companyName} ({partner.name})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Notes (Optional)</label>
              <textarea
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-[var(--color-foreground-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                placeholder="Any special instructions for the partner..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            <div className="flex gap-2">
              <Button type="submit" size="sm" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Assign Partner
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => {
                  setShowForm(false);
                  setError(null);
                }}
              >
                Cancel
              </Button>
            </div>
          </form>
        )}

        {/* Assignments list */}
        {assignments.length === 0 ? (
          <div className="py-8 text-center">
            <Building2 className="mx-auto h-10 w-10 text-[var(--color-foreground-subtle)]" />
            <p className="mt-2 text-sm text-[var(--color-foreground-muted)]">
              No partners assigned yet.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {assignments.map((assignment) => (
              <div
                key={assignment.id}
                className="flex items-start justify-between rounded-lg border p-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-[var(--color-foreground-muted)]" />
                    <span className="font-medium">
                      {assignment.partner.companyName}
                    </span>
                    <Badge variant={statusColors[assignment.status]} className="text-xs">
                      {assignment.status.replace('_', ' ')}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-[var(--color-foreground-muted)]">
                    <Clock className="h-3 w-3" />
                    {formatDate(assignment.assignedAt)}
                    {assignment.assignedBy && (
                      <span>by {assignment.assignedBy.name}</span>
                    )}
                  </div>
                  {assignment.notes && (
                    <p className="text-sm text-[var(--color-foreground-muted)]">
                      {assignment.notes}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {availablePartners.length === 0 && partnersList.length === 0 && (
          <p className="text-center text-sm text-[var(--color-foreground-muted)]">
            No partners configured. Add partners in Settings.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
