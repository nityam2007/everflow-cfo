import { requireAdmin } from '@/lib/auth-utils';
import { db } from '@/lib/db';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/utils';
import { Settings2, ArrowLeft, Plus, Database, Edit2, AlertCircle } from 'lucide-react';
import Link from 'next/link';

// JSON value type for settings
type SettingValue = string | number | boolean | Record<string, unknown> | unknown[] | null;

interface SiteSetting {
  id: string;
  key: string;
  value: SettingValue;
  description: string | null;
  category: string;
  createdAt: Date;
  updatedAt: Date;
  updatedBy?: {
    id: string;
    name: string;
  } | null;
}

export default async function SiteSettingsPage() {
  await requireAdmin();

  let settings: SiteSetting[] = [];
  let error: string | null = null;
  
  try {
    settings = await db.siteSetting.findMany({
      orderBy: [{ category: 'asc' }, { key: 'asc' }],
      include: {
        updatedBy: { select: { id: true, name: true } }
      }
    });
  } catch {
    error = 'SiteSetting table not found. Please run: npx prisma migrate dev';
  }

  // Group settings by category
  const groupedSettings: Record<string, SiteSetting[]> = settings.reduce((acc: Record<string, SiteSetting[]>, setting: SiteSetting) => {
    const category = setting.category || 'general';
    if (!acc[category]) acc[category] = [];
    acc[category].push(setting);
    return acc;
  }, {});

  const categoryLabels: Record<string, string> = {
    general: 'General Settings',
    estimator: 'Estimator Configuration',
    display: 'Display Options',
    notifications: 'Notification Settings',
    integrations: 'Third-party Integrations'
  };

  const categoryColors: Record<string, string> = {
    general: 'bg-slate-100 text-slate-700',
    estimator: 'bg-emerald-100 text-emerald-700',
    display: 'bg-blue-100 text-blue-700',
    notifications: 'bg-purple-100 text-purple-700',
    integrations: 'bg-orange-100 text-orange-700'
  };

  return (
    <div className="space-y-6 lg:space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
          <Link href="/dashboard/settings">
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Settings
            </Button>
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold">Site Settings</h1>
            <p className="text-sm text-[var(--color-foreground-muted)]">
              Configure system-wide settings without code deployment
            </p>
          </div>
        </div>
        <Link href="/dashboard/settings/site/new">
          <Button className="w-full sm:w-auto">
            <Plus className="mr-2 h-4 w-4" />
            Add Setting
          </Button>
        </Link>
      </div>

      {/* Migration Error Banner */}
      {error && (
        <Card className="border-amber-200 bg-amber-50/30">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-amber-600" />
              <CardTitle className="text-lg">Database Migration Required</CardTitle>
            </div>
            <CardDescription>
              {error}
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[var(--color-foreground-muted)]">Total Settings</p>
                <p className="text-2xl font-bold">{settings.length}</p>
              </div>
              <Database className="h-8 w-8 text-[var(--color-foreground-subtle)]" />
            </div>
          </CardContent>
        </Card>
        {Object.entries(groupedSettings).slice(0, 3).map(([category, items]: [string, SiteSetting[]]) => (
          <Card key={category}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[var(--color-foreground-muted)] capitalize">{category}</p>
                  <p className="text-2xl font-bold">{items.length}</p>
                </div>
                <Settings2 className="h-8 w-8 text-[var(--color-foreground-subtle)]" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Settings by Category */}
      {Object.keys(groupedSettings).length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Database className="mx-auto h-12 w-12 text-[var(--color-foreground-subtle)]" />
            <p className="mt-4 text-[var(--color-foreground-muted)]">No settings configured yet.</p>
            <p className="text-sm text-[var(--color-foreground-muted)]">
              Settings allow you to configure the system without code changes.
            </p>
            <Link href="/dashboard/settings/site/new" className="mt-4 inline-block">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add First Setting
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        Object.entries(groupedSettings).map(([category, categorySettings]) => (
          <Card key={category}>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Badge className={categoryColors[category] || 'bg-slate-100 text-slate-700'}>
                  {category}
                </Badge>
                <CardTitle className="text-lg">
                  {categoryLabels[category] || category.charAt(0).toUpperCase() + category.slice(1)}
                </CardTitle>
              </div>
              <CardDescription>
                {categorySettings.length} setting{categorySettings.length !== 1 ? 's' : ''} in this category
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="divide-y">
                {categorySettings.map((setting) => (
                  <div key={setting.id} className="py-4 first:pt-0 last:pb-0">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <code className="text-sm font-semibold bg-[var(--color-background-alt)] px-2 py-0.5 rounded">
                            {setting.key}
                          </code>
                        </div>
                        {setting.description && (
                          <p className="text-sm text-[var(--color-foreground-muted)] mt-1">
                            {setting.description}
                          </p>
                        )}
                        <div className="mt-2 p-2 bg-[var(--color-background-alt)] rounded text-sm font-mono overflow-x-auto">
                          <pre className="text-xs">
                            {JSON.stringify(setting.value, null, 2)}
                          </pre>
                        </div>
                        <p className="text-xs text-[var(--color-foreground-muted)] mt-2">
                          Updated {formatDate(setting.updatedAt)}
                          {setting.updatedBy && ` by ${setting.updatedBy.name}`}
                        </p>
                      </div>
                      <Link href={`/dashboard/settings/site/${setting.id}`}>
                        <Button variant="outline" size="sm">
                          <Edit2 className="h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))
      )}

      {/* Info Panel */}
      <Card className="bg-blue-50/30 border-blue-200">
        <CardHeader>
          <CardTitle className="text-lg">About Site Settings</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-[var(--color-foreground-muted)] space-y-2">
          <p>
            <strong>Categories:</strong> Organize settings by purpose - general, estimator, display, notifications, integrations.
          </p>
          <p>
            <strong>JSON Values:</strong> Settings store JSON values, allowing complex configurations like objects and arrays.
          </p>
          <p>
            <strong>No Deployment:</strong> Changes take effect immediately without code deployment.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
