'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Save, Loader2, AlertCircle } from 'lucide-react';
import Link from 'next/link';

const categories = [
  { value: 'general', label: 'General' },
  { value: 'estimator', label: 'Estimator Configuration' },
  { value: 'display', label: 'Display Options' },
  { value: 'notifications', label: 'Notifications' },
  { value: 'integrations', label: 'Integrations' }
];

export default function NewSettingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    key: '',
    value: '""',
    description: '',
    category: 'general'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validate JSON
      let parsedValue;
      try {
        parsedValue = JSON.parse(formData.value);
      } catch {
        throw new Error('Invalid JSON value');
      }
      
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          key: formData.key,
          value: parsedValue,
          description: formData.description,
          category: formData.category
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create setting');
      }

      router.push('/dashboard/settings/site');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/settings/site">
          <Button variant="outline" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Add Site Setting</h1>
          <p className="text-[var(--color-foreground-muted)]">
            Create a new configuration setting
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-800">
          <AlertCircle className="h-5 w-5" />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Setting Details</CardTitle>
            <CardDescription>
              Define the key, value, and category for this setting
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="key">Key *</Label>
              <Input
                id="key"
                placeholder="e.g., site_name, max_leads_per_day"
                value={formData.key}
                onChange={(e) => setFormData({ ...formData, key: e.target.value })}
                required
                pattern="[a-z0-9_]+"
              />
              <p className="text-xs text-[var(--color-foreground-muted)]">
                Lowercase letters, numbers, and underscores only
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <select
                id="category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                {categories.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                placeholder="What does this setting control?"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="value">Value (JSON) *</Label>
              <textarea
                id="value"
                className="w-full h-40 p-4 font-mono text-sm border border-[var(--color-border)] rounded-lg bg-[var(--color-background-alt)]"
                value={formData.value}
                onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                placeholder='{"key": "value"}'
                spellCheck={false}
                required
              />
              <p className="text-xs text-[var(--color-foreground-muted)]">
                Must be valid JSON. Examples: &quot;string value&quot;, 123, true, {"{}"}
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Link href="/dashboard/settings/site">
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
          <Button type="submit" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Create Setting
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
