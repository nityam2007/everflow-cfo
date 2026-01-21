'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Save, Loader2, AlertCircle, Trash2, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

// Rules config type
type RulesConfigValue = Record<string, unknown>;

interface RulesData {
  id: string;
  version: string;
  effectiveDate: string;
  description: string | null;
  isActive: boolean;
  rulesConfig: RulesConfigValue;
  createdAt: string;
  updatedAt: string;
  createdBy?: {
    id: string;
    name: string;
    email: string;
  };
}

export default function EditRulesPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [activating, setActivating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rules, setRules] = useState<RulesData | null>(null);
  
  const [formData, setFormData] = useState({
    version: '',
    effectiveDate: '',
    description: '',
    isActive: false,
    rulesConfig: ''
  });

  const fetchRules = async () => {
    try {
      const response = await fetch(`/api/rules/${resolvedParams.id}`);
      if (!response.ok) {
        throw new Error('Rules not found');
      }
      const data = await response.json();
      setRules(data);
      setFormData({
        version: data.version,
        effectiveDate: new Date(data.effectiveDate).toISOString().split('T')[0],
        description: data.description || '',
        isActive: data.isActive,
        rulesConfig: JSON.stringify(data.rulesConfig, null, 2)
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load rules');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRules();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resolvedParams.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const parsedRules = JSON.parse(formData.rulesConfig);
      
      const response = await fetch(`/api/rules/${resolvedParams.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          version: formData.version,
          effectiveDate: formData.effectiveDate,
          description: formData.description,
          isActive: formData.isActive,
          rulesConfig: parsedRules
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update rules');
      }

      router.push('/dashboard/settings/rules');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setSaving(false);
    }
  };

  const handleActivate = async () => {
    setActivating(true);
    setError(null);

    try {
      const response = await fetch(`/api/rules/${resolvedParams.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: true })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to activate');
      }

      router.push('/dashboard/settings/rules');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setActivating(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this rules version? This cannot be undone.')) {
      return;
    }

    setDeleting(true);
    setError(null);

    try {
      const response = await fetch(`/api/rules/${resolvedParams.id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete');
      }

      router.push('/dashboard/settings/rules');
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

  if (!rules) {
    return (
      <div className="text-center py-12">
        <p className="text-[var(--color-foreground-muted)]">Rules not found</p>
        <Link href="/dashboard/settings/rules" className="mt-4 inline-block">
          <Button variant="outline">Back to Rules</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/settings/rules">
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold">Edit Version {rules.version}</h1>
              {rules.isActive && (
                <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">
                  Active
                </Badge>
              )}
            </div>
            <p className="text-[var(--color-foreground-muted)]">
              Modify rules configuration and metadata
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!rules.isActive && (
            <>
              <Button
                variant="outline"
                className="text-emerald-600 border-emerald-200 hover:bg-emerald-50"
                onClick={handleActivate}
                disabled={activating}
              >
                {activating ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                )}
                Activate
              </Button>
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
            </>
          )}
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-800">
          <AlertCircle className="h-5 w-5" />
          {error}
        </div>
      )}

      {rules.isActive && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg text-amber-800">
          <strong>Caution:</strong> This is the active ruleset. Changes will affect all new assessments immediately.
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Version Information</CardTitle>
            <CardDescription>
              Update version metadata
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="version">Version Number *</Label>
                <Input
                  id="version"
                  value={formData.version}
                  onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="effectiveDate">Effective Date *</Label>
                <Input
                  id="effectiveDate"
                  type="date"
                  value={formData.effectiveDate}
                  onChange={(e) => setFormData({ ...formData, effectiveDate: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                placeholder="What changed in this version?"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
            <div className="text-xs text-[var(--color-foreground-muted)]">
              Created: {new Date(rules.createdAt).toLocaleString()} · 
              Last Updated: {new Date(rules.updatedAt).toLocaleString()}
              {rules.createdBy && ` · By: ${rules.createdBy.name}`}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Rules Configuration (JSON)</CardTitle>
            <CardDescription>
              Edit credits, caps, and calculation parameters
            </CardDescription>
          </CardHeader>
          <CardContent>
            <textarea
              className="w-full h-[500px] p-4 font-mono text-sm border border-[var(--color-border)] rounded-lg bg-[var(--color-background-alt)]"
              value={formData.rulesConfig}
              onChange={(e) => setFormData({ ...formData, rulesConfig: e.target.value })}
              spellCheck={false}
            />
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Link href="/dashboard/settings/rules">
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
