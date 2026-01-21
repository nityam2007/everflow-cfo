'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Header } from '@/components/header';
import { ArrowRight } from 'lucide-react';

const FICA_RATE = 0.0765;

interface Results {
  tip: { credit: number; breakdown: string };
  wotc: { credit: number; breakdown: string };
  total: number;
}

export default function CalculatorPage() {
  const [results, setResults] = useState<Results | null>(null);
  const [form, setForm] = useState({
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

    res.total = res.tip.credit + res.wotc.credit;

    setResults(res);
  }

  return (
    <div className="min-h-screen bg-[var(--color-background)]">
      <Header />
      <main className="pt-20 pb-24">
        <div className="ef-container">
          <div className="mb-8 md:mb-12">
            <p className="ef-section-label">Credit Calculator</p>
            <h1 className="ef-section-title">Estimate Your Tax Credits</h1>
            <p className="ef-section-subtitle">
              Enter your business data to calculate potential credits. All estimates are conservative and require verification.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-12">
            {/* Form */}
            <div className="lg:col-span-3 space-y-6 lg:space-y-8">
              {/* TIP Credit */}
              <div className="ef-card">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
                  <p className="ef-feature-title">FICA Tip Credit</p>
                  <span className="ef-badge ef-badge-tip w-fit">Ongoing Annual</span>
                </div>
                <p className="ef-feature-desc mb-4">
                  Section 45B credit for employers of tipped employees in restaurants, bars, and hospitality.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
              <div className="ef-card">
                <p className="ef-feature-title mb-4">Work Opportunity Tax Credit</p>
                <p className="ef-feature-desc mb-4">
                  Credits for hiring veterans, SNAP recipients, and long-term unemployed.
                </p>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
