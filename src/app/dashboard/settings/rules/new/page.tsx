'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Save, Loader2, AlertCircle } from 'lucide-react';
import Link from 'next/link';

// Default rules template - matches existing estimator-rules.ts structure
const defaultRulesTemplate = {
  credits: {
    erc: {
      enabled: true,
      creditPerEmployee2020: 5000,
      creditPerEmployee2021: 7000,
      maxQualifiedWages2020: 10000,
      maxQualifiedWages2021: 10000,
      eligibilityYears: [2020, 2021],
      thresholds: {
        revenueDeclineQ1Q22020: 0.50,
        revenueDeclineQ1Q32021: 0.20
      }
    },
    tip: {
      enabled: true,
      basePercentage: 0.075,
      minimumHours: 80,
      eligibleRoles: ['server', 'bartender', 'host', 'busser']
    },
    wotc: {
      enabled: true,
      categories: {
        veteran: { maxCredit: 9600, wageLimit: 24000 },
        snapRecipient: { maxCredit: 2400, wageLimit: 6000 },
        exFelon: { maxCredit: 2400, wageLimit: 6000 },
        summerYouth: { maxCredit: 1200, wageLimit: 3000 }
      }
    },
    rd: {
      enabled: true,
      percentageOfQRE: 0.20,
      alternativeSimplified: 0.14,
      wageQualificationPercentage: 0.65
    }
  },
  caps: {
    globalMaxCredits: 500000,
    perEmployeeMax: 26000,
    perYearMax: 250000
  },
  calculations: {
    defaultContingencyFee: 0.25,
    minimumEstimateThreshold: 1000
  }
};

export default function NewRulesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    version: '',
    effectiveDate: new Date().toISOString().split('T')[0],
    description: '',
    isActive: false,
    rulesConfig: JSON.stringify(defaultRulesTemplate, null, 2)
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validate JSON
      const parsedRules = JSON.parse(formData.rulesConfig);
      
      const response = await fetch('/api/rules', {
        method: 'POST',
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
        throw new Error(data.error || 'Failed to create rules');
      }

      router.push('/dashboard/settings/rules');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/settings/rules">
          <Button variant="outline" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Create New Rules Version</h1>
          <p className="text-[var(--color-foreground-muted)]">
            Define a new versioned ruleset for credit estimation
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
            <CardTitle>Version Information</CardTitle>
            <CardDescription>
              Provide a unique version identifier and metadata
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="version">Version Number *</Label>
                <Input
                  id="version"
                  placeholder="e.g., 1.0.0, 2024-Q1"
                  value={formData.version}
                  onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                  required
                />
                <p className="text-xs text-[var(--color-foreground-muted)]">
                  Use semantic versioning (1.0.0) or date-based (2024-Q1)
                </p>
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
                <p className="text-xs text-[var(--color-foreground-muted)]">
                  When these rules become applicable
                </p>
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
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="rounded border-gray-300"
              />
              <Label htmlFor="isActive" className="font-normal">
                Set as active version (will deactivate current active version)
              </Label>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Rules Configuration (JSON)</CardTitle>
            <CardDescription>
              Edit the JSON configuration for credits, caps, and calculations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <textarea
              className="w-full h-[500px] p-4 font-mono text-sm border border-[var(--color-border)] rounded-lg bg-[var(--color-background-alt)]"
              value={formData.rulesConfig}
              onChange={(e) => setFormData({ ...formData, rulesConfig: e.target.value })}
              spellCheck={false}
            />
            <p className="text-xs text-[var(--color-foreground-muted)] mt-2">
              Ensure valid JSON. Changes affect all new assessments using this version.
            </p>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Link href="/dashboard/settings/rules">
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
                Create Version
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
