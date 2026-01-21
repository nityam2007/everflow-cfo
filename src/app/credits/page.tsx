'use client';

import Link from 'next/link';
import { ArrowRight, Sparkles, Utensils, Users, Check } from 'lucide-react';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { ScrollAnimations } from '@/components/scroll-animations';

export default function CreditsPage() {
  return (
    <div className="min-h-screen bg-[var(--color-background)]">
      <Header />
      <ScrollAnimations />

      <main className="pt-20 pb-12">
        {/* Hero Section */}
        <section className="ef-section">
          <div className="ef-container">
            <div className="text-center mb-12 lg:mb-16">
              <p className="ef-section-label">Tax Credits & Incentives</p>
              <h1 className="ef-section-title mx-auto" style={{ maxWidth: '700px' }}>
                Non-Dilutive Capital Recovery
              </h1>
              <p className="ef-section-subtitle max-w-2xl mx-auto">
                We help you claim tax credits you're entitled to. R&D is our flagship program.
              </p>
            </div>

            {/* Credits Grid */}
            <div className="max-w-5xl mx-auto">
              {/* R&D Tax Credit - Flagship */}
              <div className="mb-8 p-8 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-[var(--brand-primary)] rounded-xl">
                <div className="grid lg:grid-cols-2 gap-8">
                  <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-[var(--brand-primary)] text-white rounded-full text-sm font-semibold mb-4">
                      <Sparkles className="h-4 w-4" />
                      Flagship Program
                    </div>
                    
                    <h2 className="text-3xl font-bold text-[var(--color-foreground)] mb-4">
                      R&D Tax Credit
                    </h2>
                    
                    <p className="text-lg text-[var(--color-foreground-muted)] mb-6">
                      Federal and state R&D credits for companies investing in innovation, 
                      software development, and product improvements.
                    </p>

                    <div className="text-4xl font-bold text-[var(--brand-primary)] mb-6">
                      Up to $250K+
                      <span className="text-base font-normal text-[var(--color-foreground-muted)]"> per year</span>
                    </div>

                    <Link href="/credits/rd">
                      <button className="ef-btn ef-btn-accent ef-btn-lg">
                        Check R&D Eligibility
                        <ArrowRight className="h-4 w-4" />
                      </button>
                    </Link>
                  </div>

                  <div className="bg-white p-6 rounded-lg">
                    <h3 className="font-bold mb-4">Who Qualifies?</h3>
                    <ul className="space-y-3">
                      {[
                        'Software companies building new features or products',
                        'Manufacturers improving processes or products',
                        'Engineering firms solving technical challenges',
                        'Any company with development or R&D activities',
                      ].map((item, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <Check className="h-5 w-5 text-[var(--brand-success)] flex-shrink-0 mt-0.5" />
                          <span className="text-sm">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Secondary Credits */}
              <div className="grid md:grid-cols-2 gap-6">
                {/* FICA Tip Credit */}
                <div className="p-6 bg-white border border-[var(--color-border)] rounded-lg hover:border-[var(--brand-primary)] transition-colors">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-lg bg-amber-100 flex items-center justify-center">
                      <Utensils className="h-6 w-6 text-amber-600" />
                    </div>
                    <span className="px-2 py-1 bg-amber-100 text-amber-800 text-xs font-semibold rounded">
                      Hospitality Focus
                    </span>
                  </div>
                  
                  <h3 className="text-xl font-bold mb-2">FICA Tip Credit</h3>
                  <p className="text-2xl font-bold text-[var(--brand-primary)] mb-3">Up to 7.65%</p>
                  <p className="text-sm text-[var(--color-foreground-muted)] mb-4">
                    Section 45B credit for restaurants, bars, and hospitality employers. 
                    Recover 7.65% of tips above minimum wage—every year.
                  </p>
                  <Link href="/#contact" className="text-[var(--brand-primary)] font-semibold text-sm hover:underline">
                    Contact Us to Learn More →
                  </Link>
                </div>

                {/* WOTC */}
                <div className="p-6 bg-white border border-[var(--color-border)] rounded-lg hover:border-[var(--brand-primary)] transition-colors">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                      <Users className="h-6 w-6 text-green-600" />
                    </div>
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded">
                      New Hire Focus
                    </span>
                  </div>
                  
                  <h3 className="text-xl font-bold mb-2">WOTC</h3>
                  <p className="text-2xl font-bold text-[var(--brand-primary)] mb-3">Up to $9,600/hire</p>
                  <p className="text-sm text-[var(--color-foreground-muted)] mb-4">
                    Work Opportunity Tax Credit for hiring veterans, SNAP recipients, 
                    and other targeted groups. Per qualified hire.
                  </p>
                  <Link href="/#contact" className="text-[var(--brand-primary)] font-semibold text-sm hover:underline">
                    Contact Us to Learn More →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How We Work */}
        <section className="ef-section ef-section-alt">
          <div className="ef-container">
            <div className="text-center mb-12">
              <h2 className="ef-section-title">How We Work</h2>
              <p className="ef-section-subtitle">
                We assess eligibility and connect you with trusted partners for fulfillment.
              </p>
            </div>

            <div className="max-w-3xl mx-auto grid md:grid-cols-3 gap-6">
              {[
                { num: '1', title: 'Eligibility Check', desc: 'Complete our short form to see if you qualify.' },
                { num: '2', title: 'Partner Match', desc: 'We connect you with trusted credit specialists.' },
                { num: '3', title: 'Credit Recovery', desc: 'Partner handles filing. You receive your credit.' },
              ].map((step) => (
                <div key={step.num} className="text-center p-6 bg-white rounded-lg border border-[var(--color-border)]">
                  <div className="w-12 h-12 rounded-full bg-[var(--brand-primary)] text-white flex items-center justify-center mx-auto mb-4 font-bold text-lg">
                    {step.num}
                  </div>
                  <h3 className="font-bold mb-2">{step.title}</h3>
                  <p className="text-sm text-[var(--color-foreground-muted)]">{step.desc}</p>
                </div>
              ))}
            </div>

            <div className="text-center mt-10">
              <Link href="/credits/rd">
                <button className="ef-btn ef-btn-accent ef-btn-lg">
                  Check R&D Credit Eligibility
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
