import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { ArrowRight } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-16">
        {/* Hero */}
        <section className="min-h-[80vh] flex items-center justify-center px-6">
          <div className="max-w-2xl text-center">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-6">
              Payroll Credit Pre-Assessment
            </p>
            <h1 className="text-4xl md:text-5xl font-light tracking-tight leading-tight">
              Federal credits can return six-figure refunds to qualifying employers
            </h1>
            <p className="mt-8 text-lg text-muted-foreground leading-relaxed">
              Most businesses leave $50,000–$500,000+ unclaimed.
            </p>
            <div className="mt-12">
              <Link href="/quiz">
                <Button size="lg" className="px-8">
                  Begin Assessment
                  <ArrowRight className="ml-3 h-4 w-4" />
                </Button>
              </Link>
            </div>
            <p className="mt-6 text-xs text-muted-foreground">
              2 minutes · No account required
            </p>
          </div>
        </section>

        {/* Stats */}
        <section className="py-32 px-6 border-t border-border/10">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-3 gap-16 text-center">
              <div>
                <p className="text-3xl font-light">$2.1B+</p>
                <p className="mt-2 text-xs uppercase tracking-wider text-muted-foreground">
                  Credits Identified
                </p>
              </div>
              <div>
                <p className="text-3xl font-light">15,000+</p>
                <p className="mt-2 text-xs uppercase tracking-wider text-muted-foreground">
                  Businesses Assessed
                </p>
              </div>
              <div>
                <p className="text-3xl font-light">98%</p>
                <p className="mt-2 text-xs uppercase tracking-wider text-muted-foreground">
                  Accuracy Rate
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Credits */}
        <section className="py-32 px-6">
          <div className="max-w-4xl mx-auto">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground text-center mb-4">
              Available Credits
            </p>
            <h2 className="text-2xl md:text-3xl font-light text-center mb-20">
              Federal payroll tax credits we evaluate
            </h2>

            <div className="space-y-16">
              {/* ERC */}
              <div className="grid md:grid-cols-2 gap-8 items-start">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">ERC</p>
                  <h3 className="text-xl font-light">Employee Retention Credit</h3>
                </div>
                <div>
                  <p className="text-3xl font-light mb-4">Up to $26,000<span className="text-base text-muted-foreground">/employee</span></p>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>COVID-19 operational disruption</li>
                    <li>Revenue decline 2020–2021</li>
                    <li>Refundable payroll tax credit</li>
                  </ul>
                </div>
              </div>

              <div className="border-t border-border/10" />

              {/* TIP */}
              <div className="grid md:grid-cols-2 gap-8 items-start">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Section 45B</p>
                  <h3 className="text-xl font-light">FICA Tip Credit</h3>
                </div>
                <div>
                  <p className="text-3xl font-light mb-4">7.65%<span className="text-base text-muted-foreground"> of qualifying tips</span></p>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>Restaurants, bars, hospitality</li>
                    <li>Tipped employee wages</li>
                    <li>Ongoing annual credit</li>
                  </ul>
                </div>
              </div>

              <div className="border-t border-border/10" />

              {/* WOTC */}
              <div className="grid md:grid-cols-2 gap-8 items-start">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">WOTC</p>
                  <h3 className="text-xl font-light">Work Opportunity Tax Credit</h3>
                </div>
                <div>
                  <p className="text-3xl font-light mb-4">Up to $9,600<span className="text-base text-muted-foreground">/qualified hire</span></p>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>Veterans and disabled veterans</li>
                    <li>SNAP and SSI recipients</li>
                    <li>Long-term unemployed</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Process */}
        <section className="py-32 px-6 border-t border-border/10">
          <div className="max-w-3xl mx-auto">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground text-center mb-4">
              Process
            </p>
            <h2 className="text-2xl md:text-3xl font-light text-center mb-20">
              How it works
            </h2>

            <div className="space-y-12">
              {[
                { num: '01', title: 'Complete the assessment', desc: 'Answer questions about your business, workforce, and operations.' },
                { num: '02', title: 'Receive your estimate', desc: 'View your preliminary credit exposure and eligible programs.' },
                { num: '03', title: 'Verify with a specialist', desc: 'Our team reviews documentation and prepares your claim.' },
                { num: '04', title: 'Claim your refund', desc: 'Receive funds directly from the IRS.' },
              ].map((step) => (
                <div key={step.num} className="flex gap-8 items-start">
                  <p className="text-xs text-muted-foreground font-mono">{step.num}</p>
                  <div>
                    <h3 className="font-medium mb-1">{step.title}</h3>
                    <p className="text-sm text-muted-foreground">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Industries */}
        <section className="py-32 px-6">
          <div className="max-w-4xl mx-auto">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground text-center mb-4">
              Eligibility
            </p>
            <h2 className="text-2xl md:text-3xl font-light text-center mb-16">
              Qualifying industries
            </h2>

            <div className="flex flex-wrap justify-center gap-4">
              {[
                'Restaurants',
                'Hotels',
                'Healthcare',
                'Retail',
                'Manufacturing',
                'Construction',
                'Professional Services',
                'Non-Profits',
              ].map((industry) => (
                <span
                  key={industry}
                  className="px-5 py-2 border border-border/30 rounded-full text-sm"
                >
                  {industry}
                </span>
              ))}
            </div>

            <p className="text-center text-sm text-muted-foreground mt-12">
              Businesses with W-2 employees affected by COVID-19 or hiring from targeted groups.
            </p>
          </div>
        </section>

        {/* Results */}
        <section className="py-32 px-6 border-t border-border/10">
          <div className="max-w-4xl mx-auto">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground text-center mb-4">
              Results
            </p>
            <h2 className="text-2xl md:text-3xl font-light text-center mb-16">
              Credits recovered
            </h2>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                { amount: '$180,000', industry: 'Restaurant', location: 'Dallas, TX' },
                { amount: '$425,000', industry: 'Hotel', location: 'Miami, FL' },
                { amount: '$1.2M', industry: 'Healthcare', location: 'Chicago, IL' },
              ].map((item) => (
                <div key={item.location} className="text-center py-8 border border-border/20 rounded-lg">
                  <p className="text-2xl font-light text-primary">{item.amount}</p>
                  <p className="mt-3 text-xs text-muted-foreground uppercase tracking-wider">
                    {item.industry}
                  </p>
                  <p className="text-xs text-muted-foreground">{item.location}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-32 px-6">
          <div className="max-w-2xl mx-auto">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground text-center mb-4">
              Questions
            </p>
            <h2 className="text-2xl md:text-3xl font-light text-center mb-16">
              Frequently asked
            </h2>

            <div className="space-y-8">
              {[
                {
                  q: 'Is the assessment free?',
                  a: 'Yes. The pre-assessment is complimentary. Fees apply only upon successful credit recovery.',
                },
                {
                  q: 'How long does the process take?',
                  a: 'Assessment takes 2 minutes. Verification is 1–2 weeks. IRS processing is typically 8–16 weeks.',
                },
                {
                  q: 'Are these legitimate tax credits?',
                  a: 'Yes. These are federal programs established by Congress. ERC alone has distributed over $230 billion.',
                },
                {
                  q: 'What determines eligibility?',
                  a: 'W-2 employees, COVID-19 impact, and hiring practices. The assessment evaluates these factors.',
                },
              ].map((faq, i) => (
                <div key={i}>
                  <h3 className="font-medium mb-2">{faq.q}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-32 px-6 border-t border-border/10">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-light mb-6">
              Evaluate your eligibility
            </h2>
            <p className="text-muted-foreground mb-10">
              Complimentary assessment. No commitment required.
            </p>
            <Link href="/quiz">
              <Button size="lg" className="px-10">
                Begin Assessment
                <ArrowRight className="ml-3 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
