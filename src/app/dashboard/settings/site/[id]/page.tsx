'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Save, Loader2, AlertCircle, Trash2 } from 'lucide-react';
import Link from 'next/link';

interface Setting {
  id: string;
  key: string;
  value: any;
  description: string | null;
  category: string;
  createdAt: string;
  updatedAt: string;
  updatedBy?: {
    id: string;
    name: string;
  };
}

const categories = [
  { value: 'general', label: 'General' },
  { value: 'estimator', label: 'Estimator Configuration' },
  { value: 'display', label: 'Display Options' },
  { value: 'notifications', label: 'Notifications' },
  { value: 'integrations', label: 'Integrations' }
];

export default function EditSettingPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [setting, setSetting] = useState<Setting | null>(null);
  
  const [formData, setFormData] = useState({
    key: '',
    value: '',
    description: '',
    category: 'general'
  });

  useEffect(() => {
    fetchSetting();
  }, [resolvedParams.id]);

  const fetchSetting = async () => {
    try {
      const response = await fetch('/api/settings');
      if (!response.ok) throw new Error('Failed to load settings');
      
      const allSettings = await response.json();
      const found = allSettings.find((s: Setting) => s.id === resolvedParams.id);
      
      if (!found) throw new Error('Setting not found');
      
      setSetting(found);
      setFormData({
        key: found.key,
        value: JSON.stringify(found.value, null, 2),
        description: found.description || '',
        category: found.category
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load setting');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      let parsedValue;
      try {
        parsedValue = JSON.parse(formData.value);
      } catch {
        throw new Error('Invalid JSON value');
      }
      
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          key: formData.key,
          value: parsedValue,
          description: formData.description
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update setting');
      }

      router.push('/dashboard/settings/site');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this setting? This cannot be undone.')) {
      return;
    }

    setDeleting(true);
    setError(null);

    try {
      const response = await fetch(`/api/settings?key=${formData.key}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete');
      }

      router.push('/dashboard/settings/site');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--color-foreground-muted)]" />
      </div>
    );
  }

  if (!setting) {
    return (
      <div className="text-center py-12">
        <p className="text-[var(--color-foreground-muted)]">Setting not found</p>
        <Link href="/dashboard/settings/site" className="mt-4 inline-block">
          <Button variant="outline">Back to Settings</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/settings/site">
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold">Edit Setting</h1>
              <Badge>{setting.category}</Badge>
            </div>
            <p className="text-[var(--color-foreground-muted)] font-mono">{setting.key}</p>
          </div>
        </div>
        <Button
          variant="outline"
          className="text-red-600 border-red-200 hover:bg-red-50"
          onClick={handleDelete}
          disabled={deleting}
        >
          {deleting ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Trash2 className="mr-2 h-4 w-4" />
          )}
          Delete
        </Button>
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
              Update the value and description for this setting
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="key">Key</Label>
              <Input
                id="key"
                value={formData.key}
                disabled
                className="bg-[var(--color-background-alt)] font-mono"
              />
              <p className="text-xs text-[var(--color-foreground-muted)]">
                Key cannot be changed after creation
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                value={categories.find(c => c.value === formData.category)?.label || formData.category}
                disabled
                className="bg-[var(--color-background-alt)]"
              />
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
                className="w-full h-48 p-4 font-mono text-sm border border-[var(--color-border)] rounded-lg bg-[var(--color-background-alt)]"
                value={formData.value}
                onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                spellCheck={false}
                required
              />
            </div>

            <div className="text-xs text-[var(--color-foreground-muted)]">
              Created: {new Date(setting.createdAt).toLocaleString()} · 
              Last Updated: {new Date(setting.updatedAt).toLocaleString()}
              {setting.updatedBy && ` by ${setting.updatedBy.name}`}
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Link href="/dashboard/settings/site">
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
          <Button type="submit" disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
