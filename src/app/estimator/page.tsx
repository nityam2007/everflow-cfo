'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, ArrowRight, Check, Loader2 } from 'lucide-react';
import { Header } from '@/components/header';
import {
  industryOptions,
  stateOptions,
  employeeRangeOptions,
  payrollRangeOptions,
} from '@/lib/validations';
import type { EstimatorInputs, IdentityInputs } from '@/lib/validations';

const TOTAL_STEPS = 5;

export default function EstimatorPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState<Partial<EstimatorInputs>>({});
  const [identity, setIdentity] = useState<Partial<IdentityInputs>>({});

  function updateForm<K extends keyof EstimatorInputs>(key: K, value: EstimatorInputs[K]) {
    setFormData((prev) => ({ ...prev, [key]: value }));
  }

  function updateIdentity<K extends keyof IdentityInputs>(key: K, value: IdentityInputs[K]) {
    setIdentity((prev) => ({ ...prev, [key]: value }));
  }

  function canProceed(): boolean {
    switch (step) {
      case 1:
        return !!(formData.industry && formData.state && formData.yearsInOperation);
      case 2:
        return !!(formData.fullTimeEmployees && formData.partTimeEmployees !== undefined && formData.tippedEmployees !== undefined);
      case 3:
        return !!formData.annualPayroll;
      case 4:
        return !!(formData.operationalDisruption2020 !== undefined && formData.governmentMandates !== undefined && formData.targetedHiring !== undefined);
      case 5:
        return !!(identity.contactName && identity.companyName && identity.email);
      default:
        return false;
    }
  }

  async function handleSubmit() {
    if (!canProceed()) return;
    
    setLoading(true);
    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          estimator: formData,
          identity,
          source: typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('src') : null,
        }),
      });

      if (!response.ok) throw new Error('Submission failed');

      const { leadId } = await response.json();
      router.push(`/results/${leadId}`);
    } catch {
      alert('Something went wrong. Please try again.');
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Progress bar */}
      <div className="fixed top-16 left-0 right-0 h-0.5 bg-border/30 z-40">
        <div
          className="h-full bg-primary transition-all duration-500"
          style={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
        />
      </div>

      {/* Content */}
      <main className="pt-24 pb-12 px-6">
        <div className="max-w-xl mx-auto">
          {/* Step indicator */}
          <div className="mb-8 text-center">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Step {step} of {TOTAL_STEPS}
            </p>
          </div>

          {/* Step 1: Business Profile */}
          {step === 1 && (
            <div className="space-y-8">
              <div className="text-center mb-12">
                <h1 className="text-2xl font-light mb-3">Business Profile</h1>
                <p className="text-sm text-muted-foreground">
                  Used to determine statutory eligibility windows.
                </p>
              </div>
              
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label className="text-xs uppercase tracking-wider">Industry</Label>
                  <Select
                    value={formData.industry}
                    onValueChange={(v) => updateForm('industry', v as EstimatorInputs['industry'])}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select your industry" />
                    </SelectTrigger>
                    <SelectContent>
                      {industryOptions.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs uppercase tracking-wider">Primary State of Operation</Label>
                  <Select
                    value={formData.state}
                    onValueChange={(v) => updateForm('state', v as EstimatorInputs['state'])}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select state" />
                    </SelectTrigger>
                    <SelectContent>
                      {stateOptions.map((state) => (
                        <SelectItem key={state} value={state}>
                          {state}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="years" className="text-xs uppercase tracking-wider">Years in Operation</Label>
                  <Input
                    id="years"
                    type="number"
                    min={1}
                    max={100}
                    placeholder="e.g., 5"
                    value={formData.yearsInOperation || ''}
                    onChange={(e) => updateForm('yearsInOperation', parseInt(e.target.value) || 0)}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Workforce Composition */}
          {step === 2 && (
                <div className="space-y-8">
              <div className="text-center mb-12">
                <h1 className="text-2xl font-light mb-3">Workforce Composition</h1>
                <p className="text-sm text-muted-foreground">
                  Certain credits apply per employee class.
                </p>
              </div>
              
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label className="text-xs uppercase tracking-wider">Average Full-Time Employees</Label>
                  <Select
                    value={formData.fullTimeEmployees}
                    onValueChange={(v) => updateForm('fullTimeEmployees', v as EstimatorInputs['fullTimeEmployees'])}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select range" />
                    </SelectTrigger>
                    <SelectContent>
                      {employeeRangeOptions.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <Label className="text-xs uppercase tracking-wider">Do you employ part-time workers?</Label>
                  <div className="flex gap-3">
                    <Button
                      type="button"
                      variant={formData.partTimeEmployees === true ? 'default' : 'outline'}
                      onClick={() => updateForm('partTimeEmployees', true)}
                      className="flex-1"
                    >
                      Yes
                    </Button>
                    <Button
                      type="button"
                      variant={formData.partTimeEmployees === false ? 'default' : 'outline'}
                      onClick={() => updateForm('partTimeEmployees', false)}
                      className="flex-1"
                    >
                      No
                    </Button>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label className="text-xs uppercase tracking-wider">Do you employ tipped workers?</Label>
                  <div className="flex gap-3">
                    <Button
                      type="button"
                      variant={formData.tippedEmployees === true ? 'default' : 'outline'}
                      onClick={() => updateForm('tippedEmployees', true)}
                      className="flex-1"
                    >
                      Yes
                    </Button>
                    <Button
                      type="button"
                      variant={formData.tippedEmployees === false ? 'default' : 'outline'}
                      onClick={() => updateForm('tippedEmployees', false)}
                      className="flex-1"
                    >
                      No
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Payroll Scale */}
          {step === 3 && (
            <div className="space-y-8">
              <div className="text-center mb-12">
                <h1 className="text-2xl font-light mb-3">Payroll Scale</h1>
                <p className="text-sm text-muted-foreground">
                  Credit caps are tied directly to payroll exposure.
                </p>
              </div>
              
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label className="text-xs uppercase tracking-wider">Annual Payroll</Label>
                  <Select
                    value={formData.annualPayroll}
                    onValueChange={(v) => updateForm('annualPayroll', v as EstimatorInputs['annualPayroll'])}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select range" />
                    </SelectTrigger>
                    <SelectContent>
                      {payrollRangeOptions.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Impact & Hiring Signals */}
          {step === 4 && (
            <div className="space-y-8">
              <div className="text-center mb-12">
                <h1 className="text-2xl font-light mb-3">Impact & Hiring Signals</h1>
                <p className="text-sm text-muted-foreground">
                  Used to model eligibility thresholds under federal statutes.
                </p>
              </div>
              
              <div className="space-y-6">
                <div className="space-y-3">
                  <Label className="text-xs uppercase tracking-wider">Operational disruption in 2020-2021?</Label>
                  <div className="flex gap-3">
                    <Button
                      type="button"
                      variant={formData.operationalDisruption2020 === true ? 'default' : 'outline'}
                      onClick={() => updateForm('operationalDisruption2020', true)}
                      className="flex-1"
                    >
                      Yes
                    </Button>
                    <Button
                      type="button"
                      variant={formData.operationalDisruption2020 === false ? 'default' : 'outline'}
                      onClick={() => updateForm('operationalDisruption2020', false)}
                      className="flex-1"
                    >
                      No
                    </Button>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label className="text-xs uppercase tracking-wider">Subject to government mandates?</Label>
                  <div className="flex gap-3">
                    <Button
                      type="button"
                      variant={formData.governmentMandates === true ? 'default' : 'outline'}
                      onClick={() => updateForm('governmentMandates', true)}
                      className="flex-1"
                    >
                      Yes
                    </Button>
                    <Button
                      type="button"
                      variant={formData.governmentMandates === false ? 'default' : 'outline'}
                      onClick={() => updateForm('governmentMandates', false)}
                      className="flex-1"
                    >
                      No
                    </Button>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label className="text-xs uppercase tracking-wider">Hire from targeted populations?</Label>
                  <div className="flex gap-3">
                    <Button
                      type="button"
                      variant={formData.targetedHiring === true ? 'default' : 'outline'}
                      onClick={() => updateForm('targetedHiring', true)}
                      className="flex-1"
                    >
                      Yes
                    </Button>
                    <Button
                      type="button"
                      variant={formData.targetedHiring === false ? 'default' : 'outline'}
                      onClick={() => updateForm('targetedHiring', false)}
                      className="flex-1"
                    >
                      No
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Identity Gate */}
          {step === 5 && (
            <div className="space-y-8">
              <div className="text-center mb-12">
                <h1 className="text-2xl font-light mb-3">Identity Confirmation</h1>
                <p className="text-sm text-muted-foreground">
                  We only generate credit ranges for verified employers.
                </p>
              </div>
              
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="contactName" className="text-xs uppercase tracking-wider">Full Name</Label>
                  <Input
                    id="contactName"
                    placeholder="John Smith"
                    value={identity.contactName || ''}
                    onChange={(e) => updateIdentity('contactName', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="companyName" className="text-xs uppercase tracking-wider">Company Name</Label>
                  <Input
                    id="companyName"
                    placeholder="Acme Corp"
                    value={identity.companyName || ''}
                    onChange={(e) => updateIdentity('companyName', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-xs uppercase tracking-wider">Work Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="john@acme.com"
                    value={identity.email || ''}
                    onChange={(e) => updateIdentity('email', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-xs uppercase tracking-wider">Phone Number (Optional)</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="(555) 123-4567"
                    value={identity.phone || ''}
                    onChange={(e) => updateIdentity('phone', e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="mt-12 flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => setStep((s) => Math.max(1, s - 1))}
              disabled={step === 1}
              className="text-muted-foreground"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>

            {step < TOTAL_STEPS ? (
              <Button onClick={() => setStep((s) => s + 1)} disabled={!canProceed()}>
                Continue
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={!canProceed() || loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    View Results
                    <Check className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
