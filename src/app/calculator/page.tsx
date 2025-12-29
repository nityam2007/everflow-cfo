'use client';

import { useState } from 'react';
import Link from 'next/link';
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

    // TIP Credit
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
      res.tip = { credit: 0, breakdown: 'Enter data above' };
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

    res.wotc = { credit: Math.round(wotcCredit), breakdown: wotcParts.join(' | ') || 'Enter data above' };

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

    res.erc = { credit: Math.round(ercCredit), breakdown: ercParts.join(' | ') || 'Enter data above' };
    res.total = res.erc.credit + res.tip.credit + res.wotc.credit;

    setResults(res);
  }

  return (
    <div className="min-h-screen bg-[var(--color-background)]">
      <Header />
      <main className="pt-20 pb-24">
        <div className="ef-container max-w-5xl">
          <div className="mb-12">
            <p className="ef-section-label">Credit Calculator</p>
            <h1 className="ef-section-title mb-4">Estimate Your Tax Credits</h1>
            <p className="ef-section-subtitle">
              Enter your business data to calculate potential credits. All estimates are conservative and require verification.
            </p>
          </div>

          <div className="grid lg:grid-cols-5 gap-12">
            {/* Form */}
            <div className="lg:col-span-3 space-y-8">
              {/* TIP Credit */}
              <div className="ef-card ef-card-tip">
                <div className="flex items-center justify-between mb-4">
                  <p className="ef-feature-title">FICA Tip Credit</p>
                  <span className="ef-badge ef-badge-tip">Ongoing Annual</span>
                </div>
                <p className="ef-feature-desc mb-4">
                  Section 45B credit for employers of tipped employees in restaurants, bars, and hospitality.
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="ef-label">Tipped Employees</label>
                    <input
                      type="number"
                      placeholder="20"
                      value={form.tippedEmployees}
                      onChange={(e) => updateForm('tippedEmployees', e.target.value)}
                      className="ef-input"
                    />
                  </div>
                  <div>
                    <label className="ef-label">Avg Tips/Month ($)</label>
                    <input
                      type="number"
                      placeholder="2000"
                      value={form.avgTipsPerEmployee}
                      onChange={(e) => updateForm('avgTipsPerEmployee', e.target.value)}
                      className="ef-input"
                    />
                  </div>
                </div>
              </div>

              {/* WOTC */}
              <div className="ef-card ef-card-wotc">
                <p className="ef-feature-title mb-4">Work Opportunity Tax Credit</p>
                <p className="ef-feature-desc mb-4">
                  Credits for hiring veterans, SNAP recipients, and long-term unemployed.
                </p>
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="ef-label">Veterans</label>
                      <input
                        type="number"
                        placeholder="0"
                        value={form.veteranHires}
                        onChange={(e) => updateForm('veteranHires', e.target.value)}
                        className="ef-input"
                      />
                    </div>
                    <div>
                      <label className="ef-label">SNAP Recipients</label>
                      <input
                        type="number"
                        placeholder="0"
                        value={form.snapRecipientHires}
                        onChange={(e) => updateForm('snapRecipientHires', e.target.value)}
                        className="ef-input"
                      />
                    </div>
                    <div>
                      <label className="ef-label">Long-term Unemployed</label>
                      <input
                        type="number"
                        placeholder="0"
                        value={form.longTermUnemployedHires}
                        onChange={(e) => updateForm('longTermUnemployedHires', e.target.value)}
                        className="ef-input"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="ef-label">Avg First Year Wages ($)</label>
                    <input
                      type="number"
                      placeholder="30000"
                      value={form.avgFirstYearWages}
                      onChange={(e) => updateForm('avgFirstYearWages', e.target.value)}
                      className="ef-input"
                    />
                  </div>
                </div>
              </div>

              {/* ERC */}
              <div className="ef-card ef-card-erc">
                <div className="flex items-center justify-between mb-4">
                  <p className="ef-feature-title" style={{ color: 'var(--color-foreground-muted)' }}>Employee Retention Credit</p>
                  <span className="ef-badge ef-badge-erc">May Apply</span>
                </div>
                <div className="ef-alert ef-alert-warning mb-4">
                  ERC eligibility requires specific 2020–2021 qualifying criteria and is subject to IRS verification.
                </div>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="ef-label">Employees (2020)</label>
                      <input
                        type="number"
                        placeholder="50"
                        value={form.employeeCount2020}
                        onChange={(e) => updateForm('employeeCount2020', e.target.value)}
                        className="ef-input"
                      />
                    </div>
                    <div>
                      <label className="ef-label">Avg Wages (2020)</label>
                      <input
                        type="number"
                        placeholder="40000"
                        value={form.averageWages2020}
                        onChange={(e) => updateForm('averageWages2020', e.target.value)}
                        className="ef-input"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="ef-label">Employees (2021)</label>
                      <input
                        type="number"
                        placeholder="50"
                        value={form.employeeCount2021}
                        onChange={(e) => updateForm('employeeCount2021', e.target.value)}
                        className="ef-input"
                      />
                    </div>
                    <div>
                      <label className="ef-label">Avg Wages (2021)</label>
                      <input
                        type="number"
                        placeholder="42000"
                        value={form.averageWages2021}
                        onChange={(e) => updateForm('averageWages2021', e.target.value)}
                        className="ef-input"
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
                      <label htmlFor="disruption" className="text-[var(--text-xs)] text-[var(--color-foreground-muted)]">
                        Operations suspended in 2020
                      </label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="rev2020"
                        checked={form.revenueDecline2020}
                        onCheckedChange={(c) => updateForm('revenueDecline2020', !!c)}
                      />
                      <label htmlFor="rev2020" className="text-[var(--text-xs)] text-[var(--color-foreground-muted)]">
                        50%+ revenue decline (2020)
                      </label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="rev2021"
                        checked={form.revenueDecline2021}
                        onCheckedChange={(c) => updateForm('revenueDecline2021', !!c)}
                      />
                      <label htmlFor="rev2021" className="text-[var(--text-xs)] text-[var(--color-foreground-muted)]">
                        20%+ revenue decline (2021)
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <button onClick={calculate} className="ef-btn ef-btn-primary ef-btn-lg w-full">
                Calculate Credits
              </button>
            </div>

            {/* Results */}
            <div className="lg:col-span-2">
              <div className="lg:sticky lg:top-20">
                <div className="ef-results">
                  <p className="ef-results-label">ESTIMATED CREDITS</p>

                  {!results ? (
                    <p className="ef-feature-desc">
                      Enter your data and click calculate to view estimates.
                    </p>
                  ) : (
                    <div className="space-y-6">
                      <div className="ef-results-total">
                        <p className="text-[var(--text-xs)] text-[var(--color-foreground-muted)] mb-2">Total Estimated Range</p>
                        <p>${results.total.toLocaleString()}</p>
                        <p className="text-[var(--text-xs)] text-[var(--color-foreground-subtle)] mt-2">Subject to verification</p>
                      </div>

                      <div className="space-y-4">
                        {/* TIP */}
                        <div className="ef-result-item ef-result-tip">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-[var(--text-xs)] font-medium text-[var(--color-tip)]">FICA Tip Credit</span>
                            <span className="font-semibold">${results.tip.credit.toLocaleString()}</span>
                          </div>
                          <p className="text-[var(--text-xs)] text-[var(--color-foreground-muted)]">{results.tip.breakdown}</p>
                        </div>

                        {/* WOTC */}
                        <div className="ef-result-item ef-result-wotc">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-[var(--text-xs)] font-medium text-[var(--color-wotc)]">WOTC</span>
                            <span className="font-semibold">${results.wotc.credit.toLocaleString()}</span>
                          </div>
                          <p className="text-[var(--text-xs)] text-[var(--color-foreground-muted)]">{results.wotc.breakdown}</p>
                        </div>

                        {/* ERC */}
                        <div className="ef-result-item ef-result-erc">
                          <div className="flex justify-between items-center mb-1">
                            <div className="flex items-center gap-2">
                              <span className="text-[var(--text-xs)] font-medium text-[var(--color-erc)]">ERC</span>
                              <span className="ef-badge ef-badge-erc">Requires Verification</span>
                            </div>
                            <span className="font-semibold text-[var(--color-foreground-muted)]">${results.erc.credit.toLocaleString()}</span>
                          </div>
                          <p className="text-[var(--text-xs)] text-[var(--color-foreground-subtle)]">{results.erc.breakdown}</p>
                        </div>
                      </div>

                      <Link href="/estimator" className="block">
                        <button className="ef-btn ef-btn-primary w-full">
                          Start Full Pre-Assessment
                          <ArrowRight className="h-4 w-4" />
                        </button>
                      </Link>
                    </div>
                  )}

                  <p className="text-[var(--text-xs)] text-[var(--color-foreground-subtle)] mt-6 leading-relaxed">
                    All estimates are preliminary. Final credit amounts require payroll documentation verification. This is not tax advice.
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
