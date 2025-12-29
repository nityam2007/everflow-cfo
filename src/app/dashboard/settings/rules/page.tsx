import { requireAdmin } from '@/lib/auth-utils';
import { db } from '@/lib/db';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/utils';
import { FileCode, Plus, CheckCircle2, Clock, Trash2, AlertCircle } from 'lucide-react';
import Link from 'next/link';

interface EstimatorRule {
  id: string;
  version: string;
  effectiveDate: Date;
  description: string | null;
  isActive: boolean;
  rulesConfig: any;
  createdAt: Date;
  updatedAt: Date;
  createdBy?: {
    id: string;
    name: string;
    email: string;
  } | null;
}

export default async function RulesPage() {
  await requireAdmin();

  let rules: EstimatorRule[] = [];
  let error: string | null = null;
  
  try {
    rules = await db.estimatorRules.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        createdBy: { select: { id: true, name: true, email: true } }
      }
    });
  } catch (e) {
    error = 'EstimatorRules table not found. Please run: npx prisma migrate dev';
  }

  const activeRules = rules.find((r: EstimatorRule) => r.isActive);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Estimator Rules</h1>
          <p className="text-[var(--color-foreground-muted)]">
            Manage versioned rule configurations for credit estimation
          </p>
        </div>
        <Link href="/dashboard/settings/rules/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Version
          </Button>
        </Link>
      </div>

      {/* Migration Required Banner */}
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

      {/* Active Rules Banner */}
      {activeRules && (
        <Card className="border-emerald-200 bg-emerald-50/30">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              <CardTitle className="text-lg">Active Version: {activeRules.version}</CardTitle>
            </div>
            <CardDescription>
              Effective since {formatDate(activeRules.effectiveDate)} · 
              All new assessments use this ruleset
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      {/* Rules List */}
      <Card>
        <CardHeader>
          <CardTitle>All Versions</CardTitle>
          <CardDescription>
            Historical and current rule configurations. Each assessment stores its rules_version for auditability.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {rules.length === 0 ? (
            <div className="py-12 text-center">
              <FileCode className="mx-auto h-12 w-12 text-[var(--color-foreground-subtle)]" />
              <p className="mt-4 text-[var(--color-foreground-muted)]">No rules configured yet.</p>
              <p className="text-sm text-[var(--color-foreground-muted)]">Create your first rules version to enable the estimator.</p>
              <Link href="/dashboard/settings/rules/new" className="mt-4 inline-block">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Rules
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {rules.map((rule: EstimatorRule) => (
                <div
                  key={rule.id}
                  className={`p-6 border rounded-lg ${
                    rule.isActive 
                      ? 'border-emerald-200 bg-emerald-50/20' 
                      : 'border-border bg-card'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className={`p-2 rounded-lg ${
                        rule.isActive ? 'bg-emerald-100' : 'bg-[var(--color-background-alt)]'
                      }`}>
                        <FileCode className={`h-5 w-5 ${
                          rule.isActive ? 'text-emerald-600' : 'text-[var(--color-foreground-muted)]'
                        }`} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-lg">Version {rule.version}</h3>
                          {rule.isActive && (
                            <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">
                              Active
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-[var(--color-foreground-muted)] mt-1">
                          {rule.description || 'No description'}
                        </p>
                        <div className="flex items-center gap-4 mt-3 text-xs text-[var(--color-foreground-muted)]">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            Effective: {formatDate(rule.effectiveDate)}
                          </span>
                          {rule.createdBy && (
                            <span>Created by {rule.createdBy.name}</span>
                          )}
                          <span>Added: {formatDate(rule.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Link href={`/dashboard/settings/rules/${rule.id}`}>
                        <Button variant="outline" size="sm">
                          View / Edit
                        </Button>
                      </Link>
                      {!rule.isActive && (
                        <Link href={`/dashboard/settings/rules/${rule.id}/activate`}>
                          <Button variant="outline" size="sm" className="text-emerald-600 border-emerald-200 hover:bg-emerald-50">
                            Activate
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                  
                  {/* Rules Summary */}
                  <div className="mt-4 pt-4 border-t border-[var(--color-border)] grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-[var(--color-foreground-muted)]">ERC</p>
                      <p className="font-medium">
                        {(rule.rulesConfig as any)?.credits?.erc?.enabled ? 'Enabled' : 'Disabled'}
                      </p>
                    </div>
                    <div>
                      <p className="text-[var(--color-foreground-muted)]">TIP Credit</p>
                      <p className="font-medium">
                        {(rule.rulesConfig as any)?.credits?.tip?.enabled ? 'Enabled' : 'Disabled'}
                      </p>
                    </div>
                    <div>
                      <p className="text-[var(--color-foreground-muted)]">WOTC</p>
                      <p className="font-medium">
                        {(rule.rulesConfig as any)?.credits?.wotc?.enabled ? 'Enabled' : 'Disabled'}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Info Panel */}
      <Card className="bg-blue-50/30 border-blue-200">
        <CardHeader>
          <CardTitle className="text-lg">About Rules Versioning</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-[var(--color-foreground-muted)] space-y-2">
          <p>
            <strong>Why versioning?</strong> Credits, caps, and IRS strategies change. Rules must be editable without redeploying code.
          </p>
          <p>
            <strong>Auditability:</strong> Every assessment stores the rules_version used at estimation time. Historical assessments remain tied to their original rules.
          </p>
          <p>
            <strong>Safety:</strong> You cannot delete the active rules version. Activate a different version first.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
