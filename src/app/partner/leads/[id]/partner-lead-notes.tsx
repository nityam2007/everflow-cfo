'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, MessageSquare } from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface Note {
  id: string;
  content: string;
  createdAt: Date;
}

interface PartnerLeadNotesProps {
  assignmentId: string;
  notes: Note[];
}

export function PartnerLeadNotes({ assignmentId, notes }: PartnerLeadNotesProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [content, setContent] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/partner/assignments/${assignmentId}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: content.trim() }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to add note');
      }

      setContent('');
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
        <CardTitle className="text-lg">Processing Notes</CardTitle>
        <CardDescription>
          Add notes about your progress on this lead
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add note form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          {error && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <textarea
            className="flex min-h-[100px] w-full border border-[var(--color-border)] bg-[var(--color-background)] px-3 py-2 text-sm placeholder:text-[var(--color-foreground-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-primary)]"
            placeholder="Add a note about processing this lead..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />

          <Button type="submit" size="sm" disabled={loading || !content.trim()}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Add Note
          </Button>
        </form>

        {/* Notes list */}
        {notes.length === 0 ? (
          <div className="py-8 text-center">
            <MessageSquare className="mx-auto h-10 w-10 text-[var(--color-foreground-subtle)]" />
            <p className="mt-2 text-sm text-[var(--color-foreground-muted)]">
              No notes yet. Add notes to track your progress.
            </p>
          </div>
        ) : (
          <div className="space-y-3 border-t border-[var(--color-border)] pt-4">
            {notes.map((note) => (
              <div key={note.id} className="rounded-lg border border-[var(--color-border)] p-3">
                <p className="text-sm">{note.content}</p>
                <p className="mt-2 text-xs text-[var(--color-foreground-muted)]">
                  {formatDate(note.createdAt)}
                </p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
