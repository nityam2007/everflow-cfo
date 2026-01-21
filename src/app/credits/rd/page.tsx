'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, ArrowLeft, Check, Sparkles, Loader2, CheckCircle2 } from 'lucide-react';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { ScrollAnimations } from '@/components/scroll-animations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function RDCreditPage() {
  const [showForm, setShowForm] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    companyName: '',
    contactName: '',
    email: '',
    phone: '',
    industry: '',
    employeeCount: '',
    annualRDSpend: '',
    activities: [] as string[],
    notes: '',
  });

  const activityOptions = [
    'Software development / engineering',
    'Product design & prototyping',
    'Manufacturing process improvements',
    'Scientific research',
    'Technical consulting',
    'Hardware development',
  ];

  const handleActivityToggle = (activity: string) => {
    setFormData((prev) => ({
      ...prev,
      activities: prev.activities.includes(activity)
        ? prev.activities.filter((a) => a !== activity)
        : [...prev.activities, activity],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Create lead - NO checkout for lead-only flows
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identity: {
            companyName: formData.companyName,
            contactName: formData.contactName,
            email: formData.email,
            phone: formData.phone,
          },
          estimator: {
            industry: formData.industry,
            employeeCount: formData.employeeCount,
            annualRDSpend: formData.annualRDSpend,
            rdActivities: formData.activities,
          },
          source: 'rd-credit-eligibility',
          productType: 'RD_CREDIT',
          leadOnly: true, // This is a lead-only flow, no checkout
        }),
      });

      if (!response.ok) throw new Error('Submission failed');

      setSubmitted(true);
    } catch {
      alert('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Success/Confirmation State
  if (submitted) {
    return (
      <div className="min-h-screen bg-[var(--color-background)]">
        <Header />
        
        <main className="pt-20 pb-12 px-4 sm:px-6">
          <div className="max-w-xl mx-auto text-center">
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="h-10 w-10 text-green-600" />
            </div>
            
            <h1 className="text-3xl font-bold mb-4">Thank You!</h1>
            <p className="text-lg text-[var(--color-foreground-muted)] mb-8">
              We&apos;ve received your R&amp;D credit eligibility request. Our team will review 
              your information and connect you with a trusted partner shortly.
            </p>

            <div className="bg-white p-6 rounded-lg border border-[var(--color-border)] text-left mb-8">
              <h3 className="font-bold mb-4">What Happens Next?</h3>
              <ul className="space-y-3">
                {[
                  'Our team reviews your eligibility (24-48 hours)',
                  'We match you with a trusted R&D credit specialist',
                  'Partner reaches out to discuss your claim',
                  'You receive your R&D credit',
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-[var(--brand-success)] flex-shrink-0 mt-0.5" />
                    <span className="text-sm">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <p className="text-sm text-[var(--color-foreground-muted)] mb-6">
              Questions? Email us at <a href="mailto:hello@everflowcfo.com" className="text-[var(--brand-primary)] font-semibold">hello@everflowcfo.com</a>
            </p>

            <Link href="/">
              <button className="ef-btn ef-btn-secondary">
                Return to Home
              </button>
            </Link>
          </div>
        </main>

        <Footer />
      </div>
    );
  }

  // Form State
  if (showForm) {
    return (
      <div className="min-h-screen bg-[var(--color-background)]">
        <Header />
        
        <main className="pt-20 pb-12 px-4 sm:px-6">
          <div className="max-w-xl mx-auto">
            <button 
              onClick={() => setShowForm(false)}
              className="flex items-center text-sm text-[var(--color-foreground-muted)] hover:text-[var(--color-foreground)] mb-6"
            >
              <ArrowLeft className="h-4 w-4 mr-1" /> Back to overview
            </button>

            <div className="text-center mb-8">
              <p className="ef-section-label">R&D Tax Credit</p>
              <h1 className="text-2xl font-bold">Short Eligibility Form</h1>
              <p className="text-[var(--color-foreground-muted)] mt-2">
                We&apos;ll assess your eligibility and connect you with a trusted partner.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg border border-[var(--color-border)]">
              <div className="space-y-2">
                <Label htmlFor="companyName">Company Name *</Label>
                <Input
                  id="companyName"
                  required
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  placeholder="Your company name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contactName">Contact Name *</Label>
                <Input
                  id="contactName"
                  required
                  value={formData.contactName}
                  onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                  placeholder="Your full name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="you@company.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="(555) 123-4567"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="industry">Industry *</Label>
                <select
                  id="industry"
                  required
                  value={formData.industry}
                  onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                  className="w-full px-3 py-2 border border-[var(--color-border)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]"
                >
                  <option value="">Select industry</option>
                  <option value="software">Software / Technology</option>
                  <option value="manufacturing">Manufacturing</option>
                  <option value="engineering">Engineering / Architecture</option>
                  <option value="biotech">Biotech / Life Sciences</option>
                  <option value="aerospace">Aerospace / Defense</option>
                  <option value="construction">Construction</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="employeeCount">Number of Employees</Label>
                <select
                  id="employeeCount"
                  value={formData.employeeCount}
                  onChange={(e) => setFormData({ ...formData, employeeCount: e.target.value })}
                  className="w-full px-3 py-2 border border-[var(--color-border)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]"
                >
                  <option value="">Select range</option>
                  <option value="1-10">1-10</option>
                  <option value="11-50">11-50</option>
                  <option value="51-200">51-200</option>
                  <option value="201-500">201-500</option>
                  <option value="500+">500+</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="annualRDSpend">Estimated Annual R&D Spend</Label>
                <select
                  id="annualRDSpend"
                  value={formData.annualRDSpend}
                  onChange={(e) => setFormData({ ...formData, annualRDSpend: e.target.value })}
                  className="w-full px-3 py-2 border border-[var(--color-border)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]"
                >
                  <option value="">Select range</option>
                  <option value="0-100k">$0 - $100,000</option>
                  <option value="100k-500k">$100,000 - $500,000</option>
                  <option value="500k-1m">$500,000 - $1,000,000</option>
                  <option value="1m-5m">$1,000,000 - $5,000,000</option>
                  <option value="5m+">$5,000,000+</option>
                </select>
              </div>

              <div className="space-y-3">
                <Label>R&D Activities (select all that apply)</Label>
                <div className="grid grid-cols-1 gap-2">
                  {activityOptions.map((activity) => (
                    <label key={activity} className="flex items-center gap-3 p-3 border border-[var(--color-border)] rounded-md cursor-pointer hover:bg-gray-50">
                      <input
                        type="checkbox"
                        checked={formData.activities.includes(activity)}
                        onChange={() => handleActivityToggle(activity)}
                        className="w-4 h-4 text-[var(--brand-primary)]"
                      />
                      <span className="text-sm">{activity}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Additional Notes</Label>
                <textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-[var(--color-border)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] min-h-[100px]"
                  placeholder="Tell us more about your R&D activities..."
                />
              </div>

              <div className="pt-4 border-t border-[var(--color-border)]">
                <p className="text-xs text-[var(--color-foreground-muted)] mb-4">
                  By submitting, you agree to be connected with our trusted R&D credit partners 
                  who will assess your eligibility and handle your claim.
                </p>
                <Button 
                  type="submit" 
                  className="w-full ef-btn ef-btn-accent"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      Submit for Review
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </main>

        <Footer />
      </div>
    );
  }

  // Landing State
  return (
    <div className="min-h-screen bg-[var(--color-background)]">
      <Header />
      <ScrollAnimations />

      <main className="pt-20 pb-12">
        {/* Hero Section */}
        <section className="ef-section">
          <div className="ef-container">
            <div className="max-w-4xl mx-auto">
              <Link href="/credits" className="inline-flex items-center text-sm text-[var(--color-foreground-muted)] hover:text-[var(--color-foreground)] mb-6">
                <ArrowLeft className="h-4 w-4 mr-1" /> Back to Credits
              </Link>

              <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
                {/* Left - Product Info */}
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-[var(--brand-primary)] text-white rounded-full text-sm font-semibold mb-4">
                    <Sparkles className="h-4 w-4" />
                    Flagship Program
                  </div>
                  
                  <h1 className="text-3xl md:text-4xl font-bold text-[var(--color-foreground)] mb-4">
                    R&D Tax Credit
                  </h1>
                  
                  <p className="text-lg text-[var(--color-foreground-muted)] mb-6">
                    Federal and state R&D credits for companies investing in innovation. 
                    We assess eligibility and connect you with trusted partners.
                  </p>

                  <div className="text-4xl font-bold text-[var(--brand-primary)] mb-6">
                    Up to $250K+
                    <span className="text-base font-normal text-[var(--color-foreground-muted)]"> per year</span>
                  </div>

                  <ul className="space-y-3 mb-8">
                    {[
                      'Federal R&D tax credit (Section 41)',
                      'State R&D credits (where applicable)',
                      'Startup payroll tax offset option',
                      'Multi-year lookback claims',
                    ].map((feature, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <Check className="h-5 w-5 text-[var(--brand-success)] flex-shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <button 
                    onClick={() => setShowForm(true)}
                    className="ef-btn ef-btn-accent ef-btn-lg w-full md:w-auto"
                  >
                    Check My Eligibility
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>

                {/* Right - How It Works */}
                <div className="bg-white p-6 rounded-lg border border-[var(--color-border)]">
                  <h3 className="font-bold text-lg mb-4">How It Works</h3>
                  
                  <div className="space-y-4">
                    {[
                      { num: '1', title: 'Complete Short Form', desc: 'Answer a few questions about your R&D activities.' },
                      { num: '2', title: 'We Assess Eligibility', desc: 'Our team reviews and qualifies your submission.' },
                      { num: '3', title: 'Partner Connection', desc: 'We connect you with a trusted R&D credit specialist.' },
                      { num: '4', title: 'Claim Your Credit', desc: 'Partner handles the filing. You receive your credit.' },
                    ].map((step) => (
                      <div key={step.num} className="flex gap-4">
                        <div className="w-8 h-8 rounded-full bg-[var(--brand-primary)]/10 flex items-center justify-center flex-shrink-0">
                          <span className="text-sm font-bold text-[var(--brand-primary)]">{step.num}</span>
                        </div>
                        <div>
                          <h4 className="font-semibold">{step.title}</h4>
                          <p className="text-sm text-[var(--color-foreground-muted)]">{step.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 pt-6 border-t border-[var(--color-border)]">
                    <p className="text-sm text-[var(--color-foreground-muted)]">
                      <strong>Note:</strong> We assess eligibility and connect you with trusted partners who fulfill the work.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Who Qualifies */}
        <section className="ef-section ef-section-alt">
          <div className="ef-container">
            <div className="text-center mb-12">
              <h2 className="ef-section-title">Who Qualifies?</h2>
              <p className="ef-section-subtitle">Companies with qualifying R&D activities may be eligible</p>
            </div>

            <div className="max-w-4xl mx-auto grid md:grid-cols-3 gap-6">
              <div className="p-6 bg-white border border-[var(--color-border)] rounded-lg text-center">
                <div className="text-3xl mb-3">💻</div>
                <h3 className="font-bold mb-2">Software Companies</h3>
                <p className="text-sm text-[var(--color-foreground-muted)]">
                  Building new features, improving performance, developing new products.
                </p>
              </div>

              <div className="p-6 bg-white border border-[var(--color-border)] rounded-lg text-center">
                <div className="text-3xl mb-3">🏭</div>
                <h3 className="font-bold mb-2">Manufacturers</h3>
                <p className="text-sm text-[var(--color-foreground-muted)]">
                  Process improvements, new product development, quality enhancements.
                </p>
              </div>

              <div className="p-6 bg-white border border-[var(--color-border)] rounded-lg text-center">
                <div className="text-3xl mb-3">🔬</div>
                <h3 className="font-bold mb-2">Engineering & Life Sciences</h3>
                <p className="text-sm text-[var(--color-foreground-muted)]">
                  Technical problem-solving, research activities, experimental development.
                </p>
              </div>
            </div>

            <div className="text-center mt-10">
              <button 
                onClick={() => setShowForm(true)}
                className="ef-btn ef-btn-accent ef-btn-lg"
              >
                Check My Eligibility
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
