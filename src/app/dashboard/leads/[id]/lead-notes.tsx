'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Send } from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface Note {
  id: string;
  content: string;
  createdAt: Date;
  user: { name: string };
}

interface LeadNotesProps {
  leadId: string;
  notes: Note[];
}

export function LeadNotes({ leadId, notes }: LeadNotesProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [content, setContent] = useState('');

  async function addNote(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) return;

    startTransition(async () => {
      await fetch(`/api/leads/${leadId}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });
      setContent('');
      router.refresh();
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Notes</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add note form */}
        <form onSubmit={addNote} className="flex gap-2">
          <Input
            placeholder="Add a note..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            disabled={isPending}
          />
          <Button type="submit" disabled={isPending || !content.trim()}>
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </form>

        {/* Notes list */}
        {notes.length === 0 ? (
          <p className="text-sm text-[var(--color-foreground-muted)] text-center py-4">
            No notes yet. Add one above.
          </p>
        ) : (
          <div className="space-y-3">
            {notes.map((note) => (
              <div key={note.id} className="rounded-lg border p-3">
                <p className="text-sm">{note.content}</p>
                <p className="mt-2 text-xs text-[var(--color-foreground-muted)]">
                  {note.user.name} • {formatDate(note.createdAt)}
                </p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
