'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Header } from '@/components/header';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowRight } from 'lucide-react';

const FICA_RATE = 0.0765;

interface Results {
  erc: { credit: number; breakdown: string };
  tip: { credit: number; breakdown: string };
  wotc: { credit: number; breakdown: string };
  total: number;
}

export default function CalculatorPage() {
  const [results, setResults] = useState<Results | null>(null);
  const [form, setForm] = useState({
    employeeCount2020: '',
    employeeCount2021: '',
    averageWages2020: '',
    averageWages2021: '',
    hadDisruption2020: false,
    revenueDecline2020: false,
    revenueDecline2021: false,
    tippedEmployees: '',
    avgTipsPerEmployee: '',
    veteranHires: '',
    snapRecipientHires: '',
    longTermUnemployedHires: '',
    avgFirstYearWages: '',
  });

  function updateForm(key: keyof typeof form, value: string | boolean) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function calculate() {
    const res: Results = {
      erc: { credit: 0, breakdown: '' },
      tip: { credit: 0, breakdown: '' },
      wotc: { credit: 0, breakdown: '' },
      total: 0,
    };

    // ERC
    const emp2020 = parseInt(form.employeeCount2020) || 0;
    const emp2021 = parseInt(form.employeeCount2021) || 0;
    const wages2020 = parseInt(form.averageWages2020) || 0;
    const wages2021 = parseInt(form.averageWages2021) || 0;

    let ercCredit = 0;
    const ercParts: string[] = [];

    if ((form.hadDisruption2020 || form.revenueDecline2020) && emp2020 > 0 && wages2020 > 0) {
      const qual = Math.min(wages2020, 10000);
      const credit = emp2020 * qual * 0.5;
      ercCredit += credit;
      ercParts.push(`2020: ${emp2020} × $${qual.toLocaleString()} × 50% = $${credit.toLocaleString()}`);
    }

    if (form.revenueDecline2021 && emp2021 > 0 && wages2021 > 0) {
      const qual = Math.min(wages2021 / 4, 10000);
      const credit = emp2021 * qual * 0.7 * 3;
      ercCredit += credit;
      ercParts.push(`2021: ${emp2021} × $${qual.toLocaleString()}/Q × 70% × 3Q = $${credit.toLocaleString()}`);
    }

    res.erc = { credit: Math.round(ercCredit), breakdown: ercParts.join(' | ') || 'Not eligible' };

    // TIP
    const tippedEmp = parseInt(form.tippedEmployees) || 0;
    const avgTips = parseFloat(form.avgTipsPerEmployee) || 0;

    if (tippedEmp > 0 && avgTips > 0) {
      const annualTips = avgTips * 12;
      const tipCredit = tippedEmp * annualTips * FICA_RATE;
      res.tip = {
        credit: Math.round(tipCredit),
        breakdown: `${tippedEmp} employees × $${annualTips.toLocaleString()} tips × 7.65%`,
      };
    } else {
      res.tip = { credit: 0, breakdown: 'Not eligible' };
    }

    // WOTC
    const veterans = parseInt(form.veteranHires) || 0;
    const snap = parseInt(form.snapRecipientHires) || 0;
    const unemployed = parseInt(form.longTermUnemployedHires) || 0;
    const wages = parseInt(form.avgFirstYearWages) || 0;

    let wotcCredit = 0;
    const wotcParts: string[] = [];

    if (veterans > 0 && wages > 0) {
      const c = veterans * Math.min(wages, 14000) * 0.4;
      wotcCredit += c;
      wotcParts.push(`Veterans: $${c.toLocaleString()}`);
    }
    if (snap > 0 && wages > 0) {
      const c = snap * Math.min(wages, 6000) * 0.4;
      wotcCredit += c;
      wotcParts.push(`SNAP: $${c.toLocaleString()}`);
    }
    if (unemployed > 0 && wages > 0) {
      const c = unemployed * Math.min(wages, 6000) * 0.4;
      wotcCredit += c;
      wotcParts.push(`Unemployed: $${c.toLocaleString()}`);
    }

    res.wotc = { credit: Math.round(wotcCredit), breakdown: wotcParts.join(' | ') || 'Not eligible' };
    res.total = res.erc.credit + res.tip.credit + res.wotc.credit;

    setResults(res);
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-16">
        <div className="py-20 px-6">
          <div className="max-w-4xl mx-auto">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-4">
              Credit Calculator
            </p>
            <h1 className="text-3xl font-light mb-4">
              Estimate your tax credits
            </h1>
            <p className="text-muted-foreground mb-16 max-w-xl">
              Enter your business data to calculate potential credits across ERC, FICA Tip, and WOTC programs.
            </p>

            <div className="grid lg:grid-cols-2 gap-16">
              {/* Form */}
              <div className="space-y-12">
                {/* ERC */}
                <div>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground mb-4">
                    Employee Retention Credit
                  </p>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-xs">Employees (2020)</Label>
                        <Input
                          type="number"
                          placeholder="50"
                          value={form.employeeCount2020}
                          onChange={(e) => updateForm('employeeCount2020', e.target.value)}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Avg Wages (2020)</Label>
                        <Input
                          type="number"
                          placeholder="40000"
                          value={form.averageWages2020}
                          onChange={(e) => updateForm('averageWages2020', e.target.value)}
                          className="mt-1"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-xs">Employees (2021)</Label>
                        <Input
                          type="number"
                          placeholder="50"
                          value={form.employeeCount2021}
                          onChange={(e) => updateForm('employeeCount2021', e.target.value)}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Avg Wages (2021)</Label>
                        <Input
                          type="number"
                          placeholder="42000"
                          value={form.averageWages2021}
                          onChange={(e) => updateForm('averageWages2021', e.target.value)}
                          className="mt-1"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Checkbox
                          id="disruption"
                          checked={form.hadDisruption2020}
                          onCheckedChange={(c) => updateForm('hadDisruption2020', !!c)}
                        />
                        <Label htmlFor="disruption" className="text-xs font-normal">
                          Operations suspended in 2020
                        </Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <Checkbox
                          id="rev2020"
                          checked={form.revenueDecline2020}
                          onCheckedChange={(c) => updateForm('revenueDecline2020', !!c)}
                        />
                        <Label htmlFor="rev2020" className="text-xs font-normal">
                          50%+ revenue decline (2020)
                        </Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <Checkbox
                          id="rev2021"
                          checked={form.revenueDecline2021}
                          onCheckedChange={(c) => updateForm('revenueDecline2021', !!c)}
                        />
                        <Label htmlFor="rev2021" className="text-xs font-normal">
                          20%+ revenue decline (2021)
                        </Label>
                      </div>
                    </div>
                  </div>
                </div>

                {/* TIP */}
                <div>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground mb-4">
                    FICA Tip Credit
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs">Tipped Employees</Label>
                      <Input
                        type="number"
                        placeholder="20"
                        value={form.tippedEmployees}
                        onChange={(e) => updateForm('tippedEmployees', e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Avg Tips/Month</Label>
                      <Input
                        type="number"
                        placeholder="2000"
                        value={form.avgTipsPerEmployee}
                        onChange={(e) => updateForm('avgTipsPerEmployee', e.target.value)}
                        className="mt-1"
                      />
                    </div>
                  </div>
                </div>

                {/* WOTC */}
                <div>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground mb-4">
                    Work Opportunity Tax Credit
                  </p>
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label className="text-xs">Veterans</Label>
                        <Input
                          type="number"
                          placeholder="0"
                          value={form.veteranHires}
                          onChange={(e) => updateForm('veteranHires', e.target.value)}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">SNAP</Label>
                        <Input
                          type="number"
                          placeholder="0"
                          value={form.snapRecipientHires}
                          onChange={(e) => updateForm('snapRecipientHires', e.target.value)}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Unemployed</Label>
                        <Input
                          type="number"
                          placeholder="0"
                          value={form.longTermUnemployedHires}
                          onChange={(e) => updateForm('longTermUnemployedHires', e.target.value)}
                          className="mt-1"
                        />
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs">Avg First Year Wages</Label>
                      <Input
                        type="number"
                        placeholder="30000"
                        value={form.avgFirstYearWages}
                        onChange={(e) => updateForm('avgFirstYearWages', e.target.value)}
                        className="mt-1"
                      />
                    </div>
                  </div>
                </div>

                <Button onClick={calculate} className="w-full">
                  Calculate Credits
                </Button>
              </div>

              {/* Results */}
              <div className="lg:sticky lg:top-24 h-fit">
                <div className="border border-border/30 rounded-lg p-8">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground mb-6">
                    Estimated Credits
                  </p>

                  {!results ? (
                    <p className="text-muted-foreground text-sm">
                      Enter your data and click calculate to view estimates.
                    </p>
                  ) : (
                    <div className="space-y-8">
                      <div className="text-center pb-8 border-b border-border/20">
                        <p className="text-xs text-muted-foreground mb-2">Total Estimated</p>
                        <p className="text-4xl font-light text-primary">
                          ${results.total.toLocaleString()}
                        </p>
                      </div>

                      <div className="space-y-6">
                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-xs text-muted-foreground">ERC</span>
                            <span className="font-medium">${results.erc.credit.toLocaleString()}</span>
                          </div>
                          <p className="text-xs text-muted-foreground">{results.erc.breakdown}</p>
                        </div>

                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-xs text-muted-foreground">TIP Credit</span>
                            <span className="font-medium">${results.tip.credit.toLocaleString()}</span>
                          </div>
                          <p className="text-xs text-muted-foreground">{results.tip.breakdown}</p>
                        </div>

                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-xs text-muted-foreground">WOTC</span>
                            <span className="font-medium">${results.wotc.credit.toLocaleString()}</span>
                          </div>
                          <p className="text-xs text-muted-foreground">{results.wotc.breakdown}</p>
                        </div>
                      </div>

                      <Link href="/estimator">
                        <Button className="w-full mt-4">
                          Start Full Assessment
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  )}

                  <p className="text-xs text-muted-foreground mt-8">
                    Estimates are preliminary. Actual amounts require documentation verification.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
