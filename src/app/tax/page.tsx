'use client';

import Link from 'next/link';
import { ArrowRight, Building2, User, FileCheck, Clock, Zap } from 'lucide-react';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { ScrollAnimations } from '@/components/scroll-animations';

export default function TaxRoutingPage() {
  return (
    <div className="min-h-screen bg-[var(--color-background)]">
      <Header />
      <ScrollAnimations />

      <main className="pt-20 pb-12">
        {/* Hero Section */}
        <section className="ef-section">
          <div className="ef-container">
            <div className="text-center mb-12 lg:mb-16">
              <p className="ef-section-label">Tax & Finance</p>
              <h1 className="ef-section-title mx-auto" style={{ maxWidth: '700px' }}>
                What do you need help with?
              </h1>
              <p className="ef-section-subtitle max-w-2xl mx-auto">
                Choose your tax filing type below. All services are async-first—no meetings required.
              </p>
            </div>

            {/* Two-Button Routing */}
            <div className="max-w-3xl mx-auto grid md:grid-cols-2 gap-6">
              {/* Business Taxes */}
              <Link href="/tax/business" className="group">
                <div className="p-8 bg-white border-2 border-[var(--color-border)] hover:border-[var(--brand-primary)] rounded-xl transition-all duration-300 hover:shadow-lg h-full">
                  <div className="w-16 h-16 rounded-full bg-[var(--brand-primary)]/10 flex items-center justify-center mb-6 group-hover:bg-[var(--brand-primary)]/20 transition-colors">
                    <Building2 className="h-8 w-8 text-[var(--brand-primary)]" />
                  </div>
                  <h2 className="text-2xl font-bold text-[var(--color-foreground)] mb-3">Business Taxes</h2>
                  <p className="text-[var(--color-foreground-muted)] mb-6">
                    S-Corps (1120S), Partnerships (1065), LLCs, and corporate tax filings.
                  </p>
                  <div className="flex items-center text-[var(--brand-primary)] font-semibold">
                    Get Started <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>

              {/* Individual/Freelancer Taxes */}
              <Link href="/tax/individual" className="group">
                <div className="p-8 bg-white border-2 border-[var(--color-border)] hover:border-[var(--brand-primary)] rounded-xl transition-all duration-300 hover:shadow-lg h-full">
                  <div className="w-16 h-16 rounded-full bg-[var(--brand-primary)]/10 flex items-center justify-center mb-6 group-hover:bg-[var(--brand-primary)]/20 transition-colors">
                    <User className="h-8 w-8 text-[var(--brand-primary)]" />
                  </div>
                  <h2 className="text-2xl font-bold text-[var(--color-foreground)] mb-3">Individual / Freelancer</h2>
                  <p className="text-[var(--color-foreground-muted)] mb-6">
                    Personal returns, 1099 income, self-employment, and freelancer tax filings.
                  </p>
                  <div className="flex items-center text-[var(--brand-primary)] font-semibold">
                    Get Started <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </section>

        {/* Services Overview */}
        <section className="ef-section ef-section-alt">
          <div className="ef-container">
            <div className="text-center mb-12">
              <h2 className="ef-section-title">Our Tax & Finance Services</h2>
              <p className="ef-section-subtitle max-w-2xl mx-auto">
                Comprehensive tax and accounting solutions for businesses and individuals.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {/* Business Tax Filing */}
              <div className="p-6 bg-white border border-[var(--color-border)] rounded-lg">
                <div className="w-12 h-12 rounded-lg bg-[var(--brand-primary)]/10 flex items-center justify-center mb-4">
                  <FileCheck className="h-6 w-6 text-[var(--brand-primary)]" />
                </div>
                <h3 className="text-lg font-bold mb-2">Business Tax Filing</h3>
                <p className="text-2xl font-bold text-[var(--brand-primary)] mb-2">$1,500</p>
                <p className="text-sm text-[var(--color-foreground-muted)] mb-4">
                  Federal + state returns, year-end bookkeeping review, K-1s, extension filing.
                </p>
                <Link href="/tax/business" className="text-[var(--brand-primary)] font-semibold text-sm hover:underline">
                  Learn More →
                </Link>
              </div>

              {/* Managed Back Office */}
              <div className="p-6 bg-white border border-[var(--color-border)] rounded-lg">
                <div className="w-12 h-12 rounded-lg bg-[var(--brand-primary)]/10 flex items-center justify-center mb-4">
                  <Clock className="h-6 w-6 text-[var(--brand-primary)]" />
                </div>
                <h3 className="text-lg font-bold mb-2">Managed Back-Office</h3>
                <p className="text-2xl font-bold text-[var(--brand-primary)] mb-2">$750/mo</p>
                <p className="text-sm text-[var(--color-foreground-muted)] mb-4">
                  Monthly bookkeeping, payroll processing, sales tax filing, P&L reports.
                </p>
                <span className="inline-block px-2 py-1 bg-amber-100 text-amber-800 text-xs font-semibold rounded mb-2">
                  Lead-Only
                </span>
              </div>

              {/* Fractional CFO */}
              <div className="p-6 bg-white border border-[var(--color-border)] rounded-lg">
                <div className="w-12 h-12 rounded-lg bg-[var(--brand-primary)]/10 flex items-center justify-center mb-4">
                  <Zap className="h-6 w-6 text-[var(--brand-primary)]" />
                </div>
                <h3 className="text-lg font-bold mb-2">Fractional CFO</h3>
                <p className="text-2xl font-bold text-[var(--brand-primary)] mb-2">$3,000/mo</p>
                <p className="text-sm text-[var(--color-foreground-muted)] mb-4">
                  Financial modeling, burn rate analysis, board deck preparation.
                </p>
                <span className="inline-block px-2 py-1 bg-amber-100 text-amber-800 text-xs font-semibold rounded mb-2">
                  Lead-Only
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="ef-section">
          <div className="ef-container">
            <div className="text-center mb-12">
              <h2 className="ef-section-title">How It Works</h2>
              <p className="ef-section-subtitle">Async-first. No meetings required.</p>
            </div>

            <div className="max-w-3xl mx-auto grid md:grid-cols-4 gap-4">
              {[
                { num: '01', title: 'Choose Product', desc: 'Select your tax filing type' },
                { num: '02', title: 'Complete Intake', desc: 'Upload docs async' },
                { num: '03', title: 'Checkout', desc: 'Secure payment' },
                { num: '04', title: 'Delivery', desc: 'Get your filing done' },
              ].map((step) => (
                <div key={step.num} className="text-center p-4">
                  <div className="w-10 h-10 rounded-full bg-[var(--brand-primary)] text-white flex items-center justify-center mx-auto mb-3 font-bold text-sm">
                    {step.num}
                  </div>
                  <h3 className="font-semibold text-sm mb-1">{step.title}</h3>
                  <p className="text-xs text-[var(--color-foreground-muted)]">{step.desc}</p>
                </div>
              ))}
            </div>

            <div className="text-center mt-10">
              <Link href="/tax/business">
                <button className="ef-btn ef-btn-accent ef-btn-lg">
                  Get Started Now
                  <ArrowRight className="h-4 w-4" />
                </button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
