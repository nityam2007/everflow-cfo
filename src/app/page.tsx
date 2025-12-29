import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[var(--color-background)]">
      <Header />

      <main>
        {/* Hero */}
        <section className="ef-hero">
          <div className="ef-container">
            <div className="grid lg:grid-cols-2 gap-20 items-start">
              <div>
                <p className="ef-section-label mb-6">Payroll Credit Pre-Assessment Platform</p>
                
                <h1 className="ef-hero-title mb-8">
                  Federal Payroll<br />
                  <span className="ef-hero-title-accent">Credit Recovery</span>
                </h1>
                
                <p className="ef-section-subtitle mb-10">
                  Evaluate your eligibility for FICA Tip Credit, WOTC, and 
                  other federal programs. Conservative estimates. No obligation.
                </p>

                <div className="flex flex-col sm:flex-row items-start gap-4">
                  <Link href="/estimator">
                    <button className="ef-btn ef-btn-primary ef-btn-lg">
                      Begin Pre-Assessment
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </Link>
                  <span className="ef-step-desc pt-3">
                    2 minutes · No account required
                  </span>
                </div>
              </div>

              {/* Value Props */}
              <div className="space-y-4 pt-4">
                <div className="ef-card">
                  <p className="text-brand text-[var(--text-xs)] font-medium tracking-wide mb-2">$</p>
                  <h3 className="ef-feature-title">Recover Unclaimed Credits</h3>
                  <p className="ef-feature-desc">Federal programs return billions annually to qualifying employers.</p>
                </div>

                <div className="ef-card">
                  <p className="text-brand text-[var(--text-xs)] font-medium tracking-wide mb-2">⚡</p>
                  <h3 className="ef-feature-title">Instant Preliminary Estimate</h3>
                  <p className="ef-feature-desc">Get your credit exposure range in under 2 minutes.</p>
                </div>

                <div className="ef-card">
                  <p className="text-brand text-[var(--text-xs)] font-medium tracking-wide mb-2">✓</p>
                  <h3 className="ef-feature-title">Verified Before Filing</h3>
                  <p className="ef-feature-desc">No claims filed without complete documentation review.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="ef-section-alt py-12">
          <div className="ef-container">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="ef-stat">
                <p className="ef-stat-value">7.65%</p>
                <p className="ef-stat-label">FICA Tip Credit Rate</p>
              </div>
              <div className="ef-stat">
                <p className="ef-stat-value">$9,600</p>
                <p className="ef-stat-label">Max WOTC Per Hire</p>
              </div>
              <div className="ef-stat">
                <p className="ef-stat-value">Annual</p>
                <p className="ef-stat-label">Recurring Benefits</p>
              </div>
              <div className="ef-stat">
                <p className="ef-stat-value">100%</p>
                <p className="ef-stat-label">Verification Required</p>
              </div>
            </div>
          </div>
        </section>

        {/* Credit Programs */}
        <section className="ef-section">
          <div className="ef-container">
            <div className="mb-16">
              <p className="ef-section-label">Credit Programs</p>
              <h2 className="ef-section-title">Federal Payroll Tax Credits</h2>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {/* TIP Credit */}
              <div className="ef-credit-card ef-credit-tip">
                <p className="ef-credit-label">ONGOING ANNUAL BENEFIT</p>
                <h3 className="ef-credit-title">FICA Tip Credit</h3>
                <p className="ef-credit-desc">
                  Section 45B credit for restaurants, bars, and hospitality employers with tipped employees.
                </p>
                <div className="pt-6 border-t border-white/30">
                  <p className="ef-credit-value">7.65%</p>
                  <p className="ef-credit-subvalue">of qualifying tips</p>
                </div>
              </div>

              {/* WOTC */}
              <div className="ef-credit-card ef-credit-wotc">
                <h3 className="ef-credit-title">Work Opportunity Credit</h3>
                <p className="ef-credit-desc">
                  Credits for hiring veterans, SNAP recipients, long-term unemployed, and other targeted groups.
                </p>
                <div className="pt-6 border-t border-[var(--color-border)]">
                  <p className="ef-credit-value">Up to $9,600</p>
                  <p className="ef-credit-subvalue">per qualified hire</p>
                </div>
              </div>

              {/* ERC */}
              <div className="ef-credit-card ef-credit-erc">
                <p className="ef-credit-label">MAY APPLY IN CERTAIN CASES</p>
                <h3 className="ef-credit-title">Employee Retention Credit</h3>
                <p className="ef-credit-desc">
                  Specific 2020–2021 eligibility requirements. Subject to IRS verification.
                </p>
                <div className="pt-6 border-t border-[var(--color-border-strong)]">
                  <p className="ef-credit-value">Up to $26,000</p>
                  <p className="ef-credit-subvalue">per employee</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Process */}
        <section className="ef-section ef-section-alt">
          <div className="ef-container">
            <div className="grid lg:grid-cols-2 gap-20">
              <div>
                <p className="ef-section-label">How It Works</p>
                <h2 className="ef-section-title mb-6">From Assessment to Recovery</h2>
                <p className="ef-section-subtitle mb-10">
                  Our statute-based methodology ensures conservative, defensible estimates. 
                  Every claim is verified before filing.
                </p>

                <div className="space-y-8">
                  {[
                    { num: '01', title: 'Complete Pre-Assessment', desc: 'Answer questions about your business and workforce.' },
                    { num: '02', title: 'Review Your Estimate', desc: 'Receive a conservative credit exposure range.' },
                    { num: '03', title: 'Documentation Review', desc: 'Our team verifies eligibility with payroll records.' },
                    { num: '04', title: 'Credit Recovery', desc: 'Claims filed. Funds deposited from IRS.' },
                  ].map((step) => (
                    <div key={step.num} className="ef-step">
                      <span className="ef-step-number">{step.num}</span>
                      <div>
                        <h3 className="ef-step-title">{step.title}</h3>
                        <p className="ef-step-desc">{step.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Features */}
              <div className="grid grid-cols-2 gap-4 content-start">
                <div className="ef-feature">
                  <h3 className="ef-feature-title">Statute-Based</h3>
                  <p className="ef-feature-desc">IRS guidelines & conservative assumptions</p>
                </div>
                <div className="ef-feature">
                  <h3 className="ef-feature-title">Verified Claims</h3>
                  <p className="ef-feature-desc">No filing without documentation</p>
                </div>
                <div className="ef-feature">
                  <h3 className="ef-feature-title">Quick Process</h3>
                  <p className="ef-feature-desc">2-minute pre-assessment</p>
                </div>
                <div className="ef-feature">
                  <h3 className="ef-feature-title">No Obligation</h3>
                  <p className="ef-feature-desc">Free estimate, your approval needed</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Industries */}
        <section className="ef-section">
          <div className="ef-container">
            <div className="mb-16">
              <p className="ef-section-label">Eligibility</p>
              <h2 className="ef-section-title">Qualifying Industries</h2>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                'Restaurants & Food Service',
                'Hotels & Hospitality',
                'Healthcare Providers',
                'Retail Operations',
                'Manufacturing',
                'Construction',
                'Professional Services',
                'Non-Profit Organizations',
              ].map((industry) => (
                <div key={industry} className="ef-industry-tag">
                  {industry}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="ef-section ef-section-alt">
          <div className="ef-container max-w-3xl">
            <div className="mb-16">
              <p className="ef-section-label">FAQ</p>
              <h2 className="ef-section-title">Common Questions</h2>
            </div>

            <div className="space-y-4">
              {[
                {
                  q: 'Is the pre-assessment free?',
                  a: 'Yes. The pre-assessment is complimentary. No fees apply without successful credit recovery and your explicit approval.',
                },
                {
                  q: 'How are estimates calculated?',
                  a: 'Estimates use statute-defined caps and conservative assumptions. All figures are ranges, not guarantees, and require documentation verification.',
                },
                {
                  q: 'What is the timeline?',
                  a: 'The pre-assessment takes about 2 minutes. Verification timelines vary by program. IRS processing depends on current agency workload.',
                },
                {
                  q: 'Are these legitimate programs?',
                  a: 'Yes. These are established federal tax credit programs created by Congress. All claims require proper documentation and are subject to IRS review.',
                },
              ].map((faq, i) => (
                <div key={i} className="ef-faq-item">
                  <h3 className="ef-faq-question">{faq.q}</h3>
                  <p className="ef-faq-answer">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="ef-cta">
          <div className="ef-container max-w-4xl">
            <h2 className="ef-cta-title">Ready to Evaluate Your Credits?</h2>
            <p className="ef-cta-subtitle">Complimentary assessment. Conservative estimates. No obligation.</p>
            <Link href="/estimator">
              <button className="ef-btn ef-btn-primary ef-btn-lg">
                Begin Pre-Assessment
                <ArrowRight className="h-4 w-4" />
              </button>
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
