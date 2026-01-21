'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, ArrowLeft, Check, Clock, Zap, Building2, Loader2 } from 'lucide-react';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { ScrollAnimations } from '@/components/scroll-animations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function BusinessTaxPage() {
  const router = useRouter();
  const [showIntake, setShowIntake] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    companyName: '',
    contactName: '',
    email: '',
    phone: '',
    entityType: '',
    annualRevenue: '',
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
            companyName: formData.companyName,
            contactName: formData.contactName,
            email: formData.email,
            phone: formData.phone,
          },
          estimator: {
            industry: 'professional_services',
            entityType: formData.entityType,
            annualRevenue: formData.annualRevenue,
          },
          source: 'business-tax-filing',
          productType: 'TAX_COMPLIANCE',
        }),
      });

      if (!response.ok) throw new Error('Submission failed');

      const { leadId } = await response.json();
      
      // Redirect to checkout with product info
      router.push(`/api/leads/${leadId}/checkout?product=TAX_COMPLIANCE`);
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
              <p className="ef-section-label">Business Tax Filing</p>
              <h1 className="text-2xl font-bold">Complete Your Intake</h1>
              <p className="text-[var(--color-foreground-muted)] mt-2">
                Fill out the form below to proceed to checkout.
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
                <Label htmlFor="entityType">Entity Type *</Label>
                <select
                  id="entityType"
                  required
                  value={formData.entityType}
                  onChange={(e) => setFormData({ ...formData, entityType: e.target.value })}
                  className="w-full px-3 py-2 border border-[var(--color-border)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]"
                >
                  <option value="">Select entity type</option>
                  <option value="s-corp">S-Corporation (1120S)</option>
                  <option value="c-corp">C-Corporation (1120)</option>
                  <option value="partnership">Partnership (1065)</option>
                  <option value="llc-partnership">LLC (Partnership taxation)</option>
                  <option value="llc-scorp">LLC (S-Corp election)</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="annualRevenue">Annual Revenue Range</Label>
                <select
                  id="annualRevenue"
                  value={formData.annualRevenue}
                  onChange={(e) => setFormData({ ...formData, annualRevenue: e.target.value })}
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

              <div className="space-y-2">
                <Label htmlFor="notes">Additional Notes</Label>
                <textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-[var(--color-border)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] min-h-[100px]"
                  placeholder="Any specific concerns or questions about your tax filing..."
                />
              </div>

              <div className="pt-4 border-t border-[var(--color-border)]">
                <div className="flex items-center justify-between mb-4">
                  <span className="font-semibold">Business Tax Filing</span>
                  <span className="text-xl font-bold text-[var(--brand-primary)]">$1,500</span>
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
                    <Building2 className="h-4 w-4" />
                    Paid Product
                  </div>
                  
                  <h1 className="text-3xl md:text-4xl font-bold text-[var(--color-foreground)] mb-4">
                    Business Tax Filing
                  </h1>
                  
                  <p className="text-lg text-[var(--color-foreground-muted)] mb-6">
                    Complete federal and state tax returns for S-Corps, Partnerships, and LLCs. 
                    All delivered async—no meetings required.
                  </p>

                  <div className="text-4xl font-bold text-[var(--brand-primary)] mb-6">
                    $1,500
                    <span className="text-base font-normal text-[var(--color-foreground-muted)]"> / filing</span>
                  </div>

                  <ul className="space-y-3 mb-8">
                    {[
                      'Federal & State Corporate Tax Return',
                      'Year-End Bookkeeping Review & Adjustments',
                      'K-1 Distribution to Partners/Shareholders',
                      'Extension Filing (if needed)',
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
                      { num: '1', title: 'Complete Intake', desc: 'Fill out our async intake form with your business details.' },
                      { num: '2', title: 'Checkout', desc: 'Pay securely via Stripe. No hidden fees.' },
                      { num: '3', title: 'Upload Documents', desc: 'Upload your financials via our secure portal.' },
                      { num: '4', title: 'Receive Filing', desc: 'Get your completed return for review and signature.' },
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
                      <strong>Delivery:</strong> Typically 7-14 business days after receiving all documents.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Additional Services (Lead-Only) */}
        <section className="ef-section ef-section-alt">
          <div className="ef-container">
            <div className="text-center mb-12">
              <h2 className="ef-section-title">Additional Services</h2>
              <p className="ef-section-subtitle">Ongoing support for growing businesses</p>
            </div>

            <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-6">
              {/* Managed Back Office */}
              <div className="p-6 bg-white border border-[var(--color-border)] rounded-lg">
                <div className="flex items-center gap-2 mb-4">
                  <Clock className="h-5 w-5 text-[var(--brand-primary)]" />
                  <span className="inline-block px-2 py-1 bg-amber-100 text-amber-800 text-xs font-semibold rounded">
                    Lead-Only
                  </span>
                </div>
                <h3 className="text-xl font-bold mb-2">Managed Back-Office</h3>
                <p className="text-2xl font-bold text-[var(--brand-primary)] mb-3">$750/mo</p>
                <ul className="space-y-2 mb-4 text-sm">
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-[var(--brand-success)] mt-0.5" />
                    Monthly Bookkeeping & Reconciliation
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-[var(--brand-success)] mt-0.5" />
                    Full-Service Payroll Processing
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-[var(--brand-success)] mt-0.5" />
                    Sales Tax Filing
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-[var(--brand-success)] mt-0.5" />
                    Monthly P&L and Balance Sheet
                  </li>
                </ul>
                <Link href="/#contact" className="text-[var(--brand-primary)] font-semibold text-sm hover:underline">
                  Contact Us to Learn More →
                </Link>
              </div>

              {/* Fractional CFO */}
              <div className="p-6 bg-white border border-[var(--color-border)] rounded-lg">
                <div className="flex items-center gap-2 mb-4">
                  <Zap className="h-5 w-5 text-[var(--brand-primary)]" />
                  <span className="inline-block px-2 py-1 bg-amber-100 text-amber-800 text-xs font-semibold rounded">
                    Lead-Only
                  </span>
                </div>
                <h3 className="text-xl font-bold mb-2">Fractional CFO</h3>
                <p className="text-2xl font-bold text-[var(--brand-primary)] mb-3">$3,000/mo</p>
                <ul className="space-y-2 mb-4 text-sm">
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-[var(--brand-success)] mt-0.5" />
                    Everything in Managed Back-Office
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-[var(--brand-success)] mt-0.5" />
                    Custom Financial Modeling
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-[var(--brand-success)] mt-0.5" />
                    Monthly Burn Rate Analysis
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-[var(--brand-success)] mt-0.5" />
                    Board Deck Preparation
                  </li>
                </ul>
                <Link href="/#contact" className="text-[var(--brand-primary)] font-semibold text-sm hover:underline">
                  Contact Us to Learn More →
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
