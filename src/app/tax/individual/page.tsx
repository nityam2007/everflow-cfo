'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, ArrowLeft, Check, User, Loader2 } from 'lucide-react';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { ScrollAnimations } from '@/components/scroll-animations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function IndividualTaxPage() {
  const router = useRouter();
  const [showIntake, setShowIntake] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    contactName: '',
    email: '',
    phone: '',
    filingStatus: '',
    incomeType: '',
    estimatedIncome: '',
    notes: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Create lead and redirect to checkout
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identity: {
            contactName: formData.contactName,
            email: formData.email,
            phone: formData.phone,
            companyName: 'Individual',
          },
          estimator: {
            industry: 'freelancer',
            filingStatus: formData.filingStatus,
            incomeType: formData.incomeType,
            estimatedIncome: formData.estimatedIncome,
          },
          source: 'individual-tax-filing',
          productType: 'INDIVIDUAL_TAX',
        }),
      });

      if (!response.ok) throw new Error('Submission failed');

      const { leadId } = await response.json();
      
      // Redirect to checkout with product info
      router.push(`/api/leads/${leadId}/checkout?product=INDIVIDUAL_TAX`);
    } catch {
      alert('Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  if (showIntake) {
    return (
      <div className="min-h-screen bg-[var(--color-background)]">
        <Header />
        
        <main className="pt-20 pb-12 px-4 sm:px-6">
          <div className="max-w-xl mx-auto">
            <button 
              onClick={() => setShowIntake(false)}
              className="flex items-center text-sm text-[var(--color-foreground-muted)] hover:text-[var(--color-foreground)] mb-6"
            >
              <ArrowLeft className="h-4 w-4 mr-1" /> Back to overview
            </button>

            <div className="text-center mb-8">
              <p className="ef-section-label">Individual / Freelancer Tax Filing</p>
              <h1 className="text-2xl font-bold">Complete Your Intake</h1>
              <p className="text-[var(--color-foreground-muted)] mt-2">
                Fill out the form below to proceed to checkout.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg border border-[var(--color-border)]">
              <div className="space-y-2">
                <Label htmlFor="contactName">Full Name *</Label>
                <Input
                  id="contactName"
                  required
                  value={formData.contactName}
                  onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                  placeholder="Your full legal name"
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
                  placeholder="you@email.com"
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
                <Label htmlFor="filingStatus">Filing Status *</Label>
                <select
                  id="filingStatus"
                  required
                  value={formData.filingStatus}
                  onChange={(e) => setFormData({ ...formData, filingStatus: e.target.value })}
                  className="w-full px-3 py-2 border border-[var(--color-border)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]"
                >
                  <option value="">Select filing status</option>
                  <option value="single">Single</option>
                  <option value="married-joint">Married Filing Jointly</option>
                  <option value="married-separate">Married Filing Separately</option>
                  <option value="head-of-household">Head of Household</option>
                  <option value="widow">Qualifying Widow(er)</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="incomeType">Primary Income Type *</Label>
                <select
                  id="incomeType"
                  required
                  value={formData.incomeType}
                  onChange={(e) => setFormData({ ...formData, incomeType: e.target.value })}
                  className="w-full px-3 py-2 border border-[var(--color-border)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]"
                >
                  <option value="">Select income type</option>
                  <option value="w2-only">W-2 Employment Only</option>
                  <option value="1099-freelance">1099 / Freelance Income</option>
                  <option value="mixed">Mixed (W-2 + 1099)</option>
                  <option value="self-employed">Self-Employed / Sole Proprietor</option>
                  <option value="investments">Investment Income</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="estimatedIncome">Estimated Annual Income</Label>
                <select
                  id="estimatedIncome"
                  value={formData.estimatedIncome}
                  onChange={(e) => setFormData({ ...formData, estimatedIncome: e.target.value })}
                  className="w-full px-3 py-2 border border-[var(--color-border)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]"
                >
                  <option value="">Select range</option>
                  <option value="0-50k">$0 - $50,000</option>
                  <option value="50k-100k">$50,000 - $100,000</option>
                  <option value="100k-200k">$100,000 - $200,000</option>
                  <option value="200k-500k">$200,000 - $500,000</option>
                  <option value="500k+">$500,000+</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Additional Notes</Label>
                <textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-[var(--color-border)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] min-h-[100px]"
                  placeholder="Any specific concerns, deductions, or questions about your tax filing..."
                />
              </div>

              <div className="pt-4 border-t border-[var(--color-border)]">
                <div className="flex items-center justify-between mb-4">
                  <span className="font-semibold">Individual Tax Filing</span>
                  <span className="text-xl font-bold text-[var(--brand-primary)]">$500</span>
                </div>
                <Button 
                  type="submit" 
                  className="w-full ef-btn ef-btn-accent"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      Proceed to Checkout
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

  return (
    <div className="min-h-screen bg-[var(--color-background)]">
      <Header />
      <ScrollAnimations />

      <main className="pt-20 pb-12">
        {/* Hero Section */}
        <section className="ef-section">
          <div className="ef-container">
            <div className="max-w-4xl mx-auto">
              <Link href="/tax" className="inline-flex items-center text-sm text-[var(--color-foreground-muted)] hover:text-[var(--color-foreground)] mb-6">
                <ArrowLeft className="h-4 w-4 mr-1" /> Back to Tax & Finance
              </Link>

              <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
                {/* Left - Product Info */}
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] rounded-full text-sm font-semibold mb-4">
                    <User className="h-4 w-4" />
                    Paid Product
                  </div>
                  
                  <h1 className="text-3xl md:text-4xl font-bold text-[var(--color-foreground)] mb-4">
                    Individual / Freelancer Tax Filing
                  </h1>
                  
                  <p className="text-lg text-[var(--color-foreground-muted)] mb-6">
                    Personal tax returns for freelancers, 1099 contractors, and individuals. 
                    All delivered async—no meetings required.
                  </p>

                  <div className="text-4xl font-bold text-[var(--brand-primary)] mb-6">
                    $500
                    <span className="text-base font-normal text-[var(--color-foreground-muted)]"> / filing</span>
                  </div>

                  <ul className="space-y-3 mb-8">
                    {[
                      'Federal & State Personal Tax Return',
                      'Schedule C for Self-Employment Income',
                      'Freelance / 1099 Income Reporting',
                      'Deduction Optimization',
                      'Quarterly Estimate Guidance',
                    ].map((feature, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <Check className="h-5 w-5 text-[var(--brand-success)] flex-shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <button 
                    onClick={() => setShowIntake(true)}
                    className="ef-btn ef-btn-accent ef-btn-lg w-full md:w-auto"
                  >
                    Start Tax Filing
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>

                {/* Right - Process Overview */}
                <div className="bg-white p-6 rounded-lg border border-[var(--color-border)]">
                  <h3 className="font-bold text-lg mb-4">How It Works</h3>
                  
                  <div className="space-y-4">
                    {[
                      { num: '1', title: 'Complete Intake', desc: 'Fill out our async intake form with your details.' },
                      { num: '2', title: 'Checkout', desc: 'Pay securely via Stripe. No hidden fees.' },
                      { num: '3', title: 'Upload Documents', desc: 'Upload W-2s, 1099s, and other documents.' },
                      { num: '4', title: 'Receive Filing', desc: 'Get your completed return for review and e-file.' },
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
                      <strong>Delivery:</strong> Typically 5-7 business days after receiving all documents.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* What's Included */}
        <section className="ef-section ef-section-alt">
          <div className="ef-container">
            <div className="text-center mb-12">
              <h2 className="ef-section-title">What's Included</h2>
              <p className="ef-section-subtitle">Comprehensive personal tax filing for freelancers and individuals</p>
            </div>

            <div className="max-w-4xl mx-auto grid md:grid-cols-3 gap-6">
              <div className="p-6 bg-white border border-[var(--color-border)] rounded-lg text-center">
                <div className="text-3xl mb-3">📄</div>
                <h3 className="font-bold mb-2">Federal & State Returns</h3>
                <p className="text-sm text-[var(--color-foreground-muted)]">
                  Complete preparation and e-filing of your federal and state tax returns.
                </p>
              </div>

              <div className="p-6 bg-white border border-[var(--color-border)] rounded-lg text-center">
                <div className="text-3xl mb-3">💼</div>
                <h3 className="font-bold mb-2">Self-Employment Support</h3>
                <p className="text-sm text-[var(--color-foreground-muted)]">
                  Schedule C, SE tax calculations, and business expense deductions.
                </p>
              </div>

              <div className="p-6 bg-white border border-[var(--color-border)] rounded-lg text-center">
                <div className="text-3xl mb-3">📊</div>
                <h3 className="font-bold mb-2">Quarterly Estimates</h3>
                <p className="text-sm text-[var(--color-foreground-muted)]">
                  Guidance on quarterly estimated tax payments for next year.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
