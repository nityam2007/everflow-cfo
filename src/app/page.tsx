import Link from 'next/link';
import { 
  ArrowRight, 
  Check, 
  Shield, 
  TrendingUp, 
  Building2, 
  Utensils, 
  HardHat, 
  HeartPulse,
  Users,
  DollarSign,
  Clock,
  FileCheck,
  Sparkles,
  BadgeCheck,
  Landmark,
  ChevronRight,
  Star,
  Zap,
  Lock,
  Award,
  Quote,
  Wrench,
  Hotel,
  ShoppingBag,
  Factory,
  Briefcase,
  Heart,
  AlertTriangle,
  CheckCircle2,
  TrendingUp as TrendUp
} from 'lucide-react';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { ScrollAnimations } from '@/components/scroll-animations';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[var(--color-background)] overflow-x-hidden">
      <Header />
      <ScrollAnimations />

      <main>
        {/* Hero Section - Revolut Style */}
        <section className="ef-hero">
          <div className="ef-container">
            <div className="ef-hero-grid">
              {/* Left Content - Premium Restructured */}
              <div className="ef-hero-content animate-fade-in-up">
                {/* Social Proof Eyebrow */}
                <div className="ef-hero-eyebrow">
                  <Star className="h-4 w-4 fill-current" />
                  <span>TRUSTED BY 500+ US BUSINESSES</span>
                </div>

                <h1 className="ef-hero-title">
                  Recover the <span className="ef-hero-title-accent">payroll credits</span> you're owed.
                </h1>

                {/* Feature Checklist (replaces paragraph) */}
                <ul className="ef-hero-checklist">
                  <li className="ef-hero-check-item">
                    <div className="ef-hero-check-icon">
                      <Check className="h-4 w-4" />
                    </div>
                    <span>Recovers FICA, WOTC & ERC Credits</span>
                  </li>
                  <li className="ef-hero-check-item">
                    <div className="ef-hero-check-icon">
                      <Check className="h-4 w-4" />
                    </div>
                    <span>Average Refund: <strong className="text-[var(--brand-success)]">$42,500</strong> per business</span>
                  </li>
                  <li className="ef-hero-check-item">
                    <div className="ef-hero-check-icon">
                      <Check className="h-4 w-4" />
                    </div>
                    <span>No Upfront Cost (Contingency Based)</span>
                  </li>
                </ul>

                {/* CTA Cluster */}
                <div className="ef-hero-cta-cluster">
                  <Link href="/estimator">
                    <button className="ef-btn ef-btn-accent ef-btn-lg">
                      Check My Eligibility
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </Link>
                  <p className="ef-hero-cta-subtext">
                    <Lock className="h-3 w-3" />
                    Free & Confidential · 2 min quiz
                  </p>
                </div>

                {/* Clean Trust Footer */}
                <div className="ef-trust-footer">
                  <div className="ef-trust-item">
                    <Check className="h-4 w-4" />
                    <span>IRS Compliant</span>
                  </div>
                  <div className="ef-trust-item">
                    <Check className="h-4 w-4" />
                    <span>256-bit Encrypted</span>
                  </div>
                  <div className="ef-trust-item">
                    <Check className="h-4 w-4" />
                    <span>CPA Reviewed</span>
                  </div>
                </div>
              </div>

              {/* Right Side - iPhone Frame with Lock Screen Notifications */}
              <div className="ef-iphone-wrapper">
                {/* Premium iPhone 15 Pro Frame */}
                <div className="ef-iphone-frame">
                  {/* 3D Side Buttons */}
                  <div className="ef-iphone-power-btn"></div>
                  <div className="ef-iphone-volume-btns">
                    <div className="ef-iphone-mute-btn"></div>
                    <div className="ef-iphone-volume-btn"></div>
                    <div className="ef-iphone-volume-btn"></div>
                  </div>
                  
                  {/* Dynamic Island */}
                  <div className="ef-iphone-dynamic-island"></div>
                  
                  {/* iPhone Screen with wallpaper */}
                  <div className="ef-iphone-screen">
                    {/* iOS-style wallpaper image */}
                    <img 
                      src="/images/iphone-wallpaper.png" 
                      alt="" 
                      className="ef-iphone-wallpaper"
                      aria-hidden="true"
                    />
                    
                    {/* Lock Screen Time */}
                    <div className="ef-iphone-time">
                      <p className="ef-iphone-time-text">9:41</p>
                      <p className="ef-iphone-date-text">Saturday, January 4</p>
                    </div>

                    {/* iOS Notification Stack */}
                    <div className="ef-iphone-notifications">
                      {/* Bank Deposit Notification - Primary */}
                      <div className="ef-ios-notification animate-slide-in-right animation-delay-400">
                        <div className="ef-ios-notification-header">
                          <div className="ef-ios-notification-app-icon">
                            <Landmark className="h-3 w-3 text-[var(--brand-success)]" />
                          </div>
                          <span className="ef-ios-notification-app">Chase Bank</span>
                          <span className="ef-ios-notification-time">now</span>
                        </div>
                        <p className="ef-ios-notification-title">Direct Deposit Received</p>
                        <p className="ef-ios-notification-body">IRS TREAS 310 TAX REF +$42,500.00</p>
                      </div>

                      {/* ERC Credit Notification */}
                      <div className="ef-ios-notification animate-slide-in-right animation-delay-600">
                        <div className="ef-ios-notification-header">
                          <div className="ef-ios-notification-app-icon ef-ios-icon-blue">
                            <BadgeCheck className="h-3 w-3 text-[var(--brand-primary)]" />
                          </div>
                          <span className="ef-ios-notification-app">EverflowCFO</span>
                          <span className="ef-ios-notification-time">2m ago</span>
                        </div>
                        <p className="ef-ios-notification-title">ERC Claim Approved ✓</p>
                        <p className="ef-ios-notification-body">$26,000 per employee credited</p>
                      </div>
                    </div>
                    
                    {/* Home Indicator */}
                    <div className="ef-iphone-home-indicator"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* What We Do Section - Asymmetrical Bento Grid */}
        <section className="ef-section ef-section-alt">
          <div className="ef-container">
            <div className="text-center mb-8 md:mb-12 animate-on-scroll">
              <p className="ef-section-label">What We Do</p>
              <h2 className="ef-section-title mx-auto" style={{ maxWidth: '700px' }}>
                Billions in tax credits go unclaimed every year
              </h2>
            </div>

            {/* Asymmetrical Bento Grid */}
            <div className="ef-bento-grid">
              {/* Left Column - Impact Card (Tall Dark Card) */}
              <div className="ef-bento-impact animate-on-scroll">
                {/* Background trend graphic */}
                <div className="ef-bento-impact-bg">
                  <svg viewBox="0 0 400 300" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M0 280 L50 250 L100 260 L150 200 L200 180 L250 120 L300 80 L350 40 L400 20" 
                          stroke="url(#trendGradient)" strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.3"/>
                    <path d="M0 280 L50 250 L100 260 L150 200 L200 180 L250 120 L300 80 L350 40 L400 20 L400 300 L0 300 Z" 
                          fill="url(#areaGradient)" opacity="0.1"/>
                    <defs>
                      <linearGradient id="trendGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#60a5fa"/>
                        <stop offset="100%" stopColor="#22d3ee"/>
                      </linearGradient>
                      <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.3"/>
                        <stop offset="100%" stopColor="#60a5fa" stopOpacity="0"/>
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
                <div className="ef-bento-impact-content">
                  <div className="ef-bento-impact-icon">
                    <TrendingUp className="w-8 h-8" />
                  </div>
                  <p className="ef-bento-impact-label">Unclaimed Government Credits</p>
                  <h3 className="ef-bento-impact-billions">BILLIONS</h3>
                  <p className="ef-bento-impact-subtitle">left on the table every year</p>
                  <p className="ef-bento-impact-desc">
                    Government-run programs designed to help business owners often go unused. 
                    That&apos;s money your business could be claiming.
                  </p>
                </div>
              </div>

              {/* Right Column - Two Stacked Cards */}
              <div className="ef-bento-stack">
                {/* Problem Card (Top Right) */}
                <div className="ef-bento-problem animate-on-scroll animation-delay-100">
                  <div className="ef-bento-problem-icon">
                    <AlertTriangle className="w-6 h-6" />
                  </div>
                  <h3 className="ef-bento-problem-title">Most Owners Don&apos;t Know</h3>
                  <p className="ef-bento-problem-desc">
                    Most business owners don&apos;t even realize these programs exist—or they assume they don&apos;t qualify. 
                    Without expert guidance, credits slip through the cracks.
                  </p>
                </div>

                {/* Solution Card (Bottom Right) */}
                <div className="ef-bento-solution animate-on-scroll animation-delay-200">
                  <div className="ef-bento-solution-icon">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h3 className="ef-bento-solution-title">We Get You What You&apos;re Owed</h3>
                  <p className="ef-bento-solution-desc">
                    Our goal is simple: help business owners recover the credits they&apos;re legally entitled to. 
                    If you have employees, you may qualify.
                  </p>
                  <Link href="/estimator" className="ef-bento-solution-cta">
                    See If You Qualify
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>


        {/* Programs Section - "Credit Cards" Style */}
        <section id="programs" className="ef-section">
          <div className="ef-container">
            <div className="text-center mb-12 lg:mb-16 animate-on-scroll">
              <p className="ef-section-label">Credit Programs</p>
              <h2 className="ef-section-title mx-auto" style={{ maxWidth: '600px' }}>
                Targeted programs. Maximum recovery.
              </h2>
            </div>

            <div className="ef-program-grid">
              {/* FICA Tip Credit */}
              <div className="ef-program-card ef-program-card-tip group animate-on-scroll">
                <div className="ef-program-header">
                  <div className="ef-program-icon ef-program-icon-tip">
                    <Utensils className="h-5 w-5" />
                  </div>
                  <span className="ef-program-badge ef-program-badge-tip">Hospitality Focus</span>
                </div>
                <h3 className="ef-program-title">FICA Tip Credit</h3>
                <div className="ef-program-amount-hero">
                  <span className="ef-program-amount-prefix">Up to</span>
                  <span className="ef-program-amount-value">7.65%</span>
                </div>
                <p className="ef-program-desc">
                  Section 45B credit for restaurants, bars, and hospitality employers.
                  Recover 7.65% of tips above minimum wage—every year.
                </p>
                <a href="/estimator" className="ef-program-link">
                  Check Eligibility <ArrowRight className="h-4 w-4" />
                </a>
              </div>

              {/* WOTC */}
              <div className="ef-program-card ef-program-card-wotc group animate-on-scroll animation-delay-100">
                <div className="ef-program-header">
                  <div className="ef-program-icon ef-program-icon-wotc">
                    <Users className="h-5 w-5" />
                  </div>
                  <span className="ef-program-badge ef-program-badge-wotc">New Hire Focus</span>
                </div>
                <h3 className="ef-program-title">WOTC</h3>
                <div className="ef-program-amount-hero">
                  <span className="ef-program-amount-prefix">Up to</span>
                  <span className="ef-program-amount-value">$9,600</span>
                </div>
                <p className="ef-program-desc">
                  Work Opportunity Tax Credit for hiring veterans, SNAP recipients,
                  and other targeted groups. Per qualified hire.
                </p>
                <a href="/estimator" className="ef-program-link">
                  Check Eligibility <ArrowRight className="h-4 w-4" />
                </a>
              </div>

              {/* ERC */}
              <div className="ef-program-card ef-program-card-erc group animate-on-scroll animation-delay-200">
                <div className="ef-program-header">
                  <div className="ef-program-icon ef-program-icon-erc">
                    <Building2 className="h-5 w-5" />
                  </div>
                  <span className="ef-program-badge ef-program-badge-erc">Retention Focus</span>
                </div>
                <h3 className="ef-program-title">ERC</h3>
                <div className="ef-program-amount-hero">
                  <span className="ef-program-amount-prefix">Up to</span>
                  <span className="ef-program-amount-value">$26,000</span>
                </div>
                <p className="ef-program-desc">
                  Employee Retention Credit for 2020–2021 disruptions.
                  Per employee. Subject to IRS verification.
                </p>
                <a href="/estimator" className="ef-program-link">
                  Check Eligibility <ArrowRight className="h-4 w-4" />
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials Section - Trust Grid */}
        <section className="ef-section ef-section-alt">
          <div className="ef-container">
            <div className="text-center mb-12 animate-on-scroll">
              <p className="ef-section-label">Success Stories</p>
              <h2 className="ef-section-title">What Our Clients Say</h2>
              <p className="ef-testimonial-subtitle">
                No upfront cost. We only get paid when you do.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {/* Testimonial 1 - Restaurant */}
              <div className="ef-testimonial animate-on-scroll">
                <span className="ef-testimonial-quote-bg">"</span>
                <div className="ef-testimonial-header">
                  <div className="ef-testimonial-stars">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-[#facc15] text-[#facc15]" />
                    ))}
                  </div>
                  <span className="ef-testimonial-badge">
                    💰 $127,000 Recovered
                  </span>
                </div>
                <p className="ef-testimonial-text">
                  "EverflowCFO helped our restaurant group recover $127,000 in FICA Tip Credits we didn't even know we qualified for. <strong>The process was seamless.</strong>"
                </p>
                <div className="ef-testimonial-divider"></div>
                <div className="ef-testimonial-footer">
                  <div className="ef-testimonial-author">
                    <div className="ef-testimonial-avatar">
                      <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=96&h=96&fit=crop&crop=face" alt="Marco Rodriguez" />
                    </div>
                    <div className="ef-testimonial-info">
                      <p className="ef-testimonial-name">Marco Rodriguez</p>
                      <p className="ef-testimonial-role">
                        <Utensils className="h-3 w-3" />
                        Owner, Coastal Cantina
                      </p>
                    </div>
                  </div>
                  <div className="ef-testimonial-verified">
                    <BadgeCheck className="h-3.5 w-3.5" />
                    Verified
                  </div>
                </div>
              </div>

              {/* Testimonial 2 - Healthcare */}
              <div className="ef-testimonial animate-on-scroll animation-delay-100">
                <span className="ef-testimonial-quote-bg">"</span>
                <div className="ef-testimonial-header">
                  <div className="ef-testimonial-stars">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-[#facc15] text-[#facc15]" />
                    ))}
                  </div>
                  <span className="ef-testimonial-badge">
                    💰 $86,000 Recovered
                  </span>
                </div>
                <p className="ef-testimonial-text">
                  "We were skeptical at first, but EverflowCFO delivered. $86,000 in WOTC credits deposited within 8 weeks. <strong>No upfront cost made it a no-brainer.</strong>"
                </p>
                <div className="ef-testimonial-divider"></div>
                <div className="ef-testimonial-footer">
                  <div className="ef-testimonial-author">
                    <div className="ef-testimonial-avatar">
                      <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=96&h=96&fit=crop&crop=face" alt="Sarah Johnson" />
                    </div>
                    <div className="ef-testimonial-info">
                      <p className="ef-testimonial-name">Sarah Johnson</p>
                      <p className="ef-testimonial-role">
                        <HeartPulse className="h-3 w-3" />
                        CFO, HealthFirst Staffing
                      </p>
                    </div>
                  </div>
                  <div className="ef-testimonial-verified">
                    <BadgeCheck className="h-3.5 w-3.5" />
                    Verified
                  </div>
                </div>
              </div>

              {/* Testimonial 3 - Construction */}
              <div className="ef-testimonial animate-on-scroll animation-delay-200">
                <span className="ef-testimonial-quote-bg">"</span>
                <div className="ef-testimonial-header">
                  <div className="ef-testimonial-stars">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-[#facc15] text-[#facc15]" />
                    ))}
                  </div>
                  <span className="ef-testimonial-badge">
                    💰 $215,000 Recovered
                  </span>
                </div>
                <p className="ef-testimonial-text">
                  "Their conservative approach gave us confidence. <strong>Every claim was documented and IRS-ready.</strong> We received $215,000 in ERC refunds."
                </p>
                <div className="ef-testimonial-divider"></div>
                <div className="ef-testimonial-footer">
                  <div className="ef-testimonial-author">
                    <div className="ef-testimonial-avatar">
                      <img src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=96&h=96&fit=crop&crop=face" alt="David Kim" />
                    </div>
                    <div className="ef-testimonial-info">
                      <p className="ef-testimonial-name">David Kim</p>
                      <p className="ef-testimonial-role">
                        <HardHat className="h-3 w-3" />
                        CEO, Pacific Construction
                      </p>
                    </div>
                  </div>
                  <div className="ef-testimonial-verified">
                    <BadgeCheck className="h-3.5 w-3.5" />
                    Verified
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Trust Section - Professional Dashboard Light Theme */}
        <section className="ef-dashboard-section">
          <div className="ef-container">
            {/* Header */}
            <div className="text-center mb-6 animate-on-scroll">
              <p className="ef-section-label">Built on Integrity</p>
              <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight mx-auto" style={{ maxWidth: '600px' }}>
                Statute-Based & IRS Compliant
              </h2>
            </div>

            {/* Seal of Approval Badge */}
            <div className="ef-seal-container animate-on-scroll">
              <div className="ef-seal-badge">
                <Shield className="w-10 h-10 text-blue-600" />
                <span className="ef-seal-pill">IRS COMPLIANT</span>
              </div>
            </div>

            {/* Connector Line */}
            <div className="ef-seal-connector"></div>

            {/* 2x2 Grid of Feature Cards */}
            <div className="ef-dashboard-grid animate-on-scroll">
              <div className="ef-dashboard-card group">
                <div className="ef-dashboard-card-icon">
                  <FileCheck className="w-5 h-5 text-blue-600" />
                </div>
                <div className="ef-dashboard-card-content">
                  <h4 className="ef-dashboard-card-title">No-Filing-Without-Verification</h4>
                  <p className="ef-dashboard-card-desc">Every claim is thoroughly reviewed and verified before submission to the IRS.</p>
                </div>
              </div>

              <div className="ef-dashboard-card group">
                <div className="ef-dashboard-card-icon">
                  <Lock className="w-5 h-5 text-blue-600" />
                </div>
                <div className="ef-dashboard-card-content">
                  <h4 className="ef-dashboard-card-title">Conservative Methodology</h4>
                  <p className="ef-dashboard-card-desc">We only take defensible positions based on statute-defined calculations.</p>
                </div>
              </div>

              <div className="ef-dashboard-card group">
                <div className="ef-dashboard-card-icon">
                  <Landmark className="w-5 h-5 text-blue-600" />
                </div>
                <div className="ef-dashboard-card-content">
                  <h4 className="ef-dashboard-card-title">Complete Documentation</h4>
                  <p className="ef-dashboard-card-desc">Full paperwork and audit trail maintained for every filed claim.</p>
                </div>
              </div>

              <div className="ef-dashboard-card group">
                <div className="ef-dashboard-card-icon">
                  <BadgeCheck className="w-5 h-5 text-blue-600" />
                </div>
                <div className="ef-dashboard-card-content">
                  <h4 className="ef-dashboard-card-title">Audit-Ready Files</h4>
                  <p className="ef-dashboard-card-desc">All submissions are prepared and organized for potential IRS review.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Scale Section - Financial Table Stats */}
        <section className="ef-section ef-scale-section">
          <div className="ef-container">
            {/* Clustered Industry Icons */}
            <div className="animate-on-scroll" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '2rem' }}>
              <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: '1.5rem' }}>
                <Utensils className="w-10 h-10 lg:w-12 lg:h-12 text-blue-500" />
                <HardHat className="w-10 h-10 lg:w-12 lg:h-12 text-blue-500" />
                <HeartPulse className="w-10 h-10 lg:w-12 lg:h-12 text-blue-500" />
              </div>
              <p style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: '0.75rem' }}>Serving Key Industries</p>
            </div>

            <div className="text-center animate-on-scroll">
              <h2 className="ef-section-title mx-auto" style={{ maxWidth: '700px' }}>
                Billions available. Most businesses leave it on the table.
              </h2>
              <p className="ef-section-subtitle mx-auto text-center">
                From restaurants to construction to healthcare—federal payroll credits are designed for businesses like yours.
                Most employers don't know they qualify.
              </p>

              {/* Single Stats Container with Dividers */}
              <div style={{ marginTop: '2.5rem' }}>
                <div className="ef-stats-grid">
                  <div className="ef-stat-cell">
                    <p className="ef-stat-label-top">Credits Unclaimed Annually</p>
                    <p className="ef-stat-value-big">$5B+</p>
                  </div>
                  <div className="ef-stat-cell">
                    <p className="ef-stat-label-top">FICA Tip Credit Rate</p>
                    <p className="ef-stat-value-big">7.65%</p>
                  </div>
                  <div className="ef-stat-cell">
                    <p className="ef-stat-label-top">Max WOTC Per Hire</p>
                    <p className="ef-stat-value-big">$9,600</p>
                  </div>
                  <div className="ef-stat-cell">
                    <p className="ef-stat-label-top">Max ERC Per Employee</p>
                    <p className="ef-stat-value-big">$26K</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Lifestyle Section - Vision Board */}
        <section className="ef-lifestyle-section">
          {/* Spotlight Overlay */}
          <div className="ef-lifestyle-spotlight"></div>
          
          <div className="ef-container">
            <div className="ef-lifestyle-content animate-on-scroll">
              {/* Massive Headline with Gradient */}
              <h2 className="ef-vision-headline">
                Turn tax credits into<br />
                <span className="ef-vision-gradient">growth capital.</span>
              </h2>
              
              <p className="ef-vision-subtext">
                These aren't just tax refunds—they're capital for your next expansion,
                new equipment, or additional hires. Real money back in your business.
              </p>

              {/* Possibility Cards Grid */}
              <div className="ef-possibility-grid">
                <div className="ef-possibility-card">
                  <div className="ef-possibility-icon">
                    <TrendingUp className="w-6 h-6" />
                  </div>
                  <span className="ef-possibility-text">Business Expansion</span>
                </div>
                <div className="ef-possibility-card">
                  <div className="ef-possibility-icon">
                    <Wrench className="w-6 h-6" />
                  </div>
                  <span className="ef-possibility-text">Equipment Upgrades</span>
                </div>
                <div className="ef-possibility-card">
                  <div className="ef-possibility-icon">
                    <Users className="w-6 h-6" />
                  </div>
                  <span className="ef-possibility-text">Staff Hiring & Retention</span>
                </div>
              </div>

              {/* Glowing CTA Button */}
              <Link href="/estimator" className="ef-vision-cta">
                <button className="ef-btn ef-btn-glow ef-btn-lg">
                  Start Your Assessment
                  <ArrowRight className="h-4 w-4" />
                </button>
              </Link>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section id="about" className="ef-section">
          <div className="ef-container">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-20">
              {/* Features Grid - Sticky Sidebar (shown first on mobile for trust signals) */}
              <div className="order-first lg:order-last lg:sticky lg:top-24 lg:self-start">
                {/* Mobile: Horizontal scroll for quick trust signals */}
                <div className="flex gap-3 overflow-x-auto pb-4 lg:hidden snap-x snap-mandatory -mx-4 px-4">
                  <div className="ef-feature ef-feature-mobile snap-start">
                    <div className="ef-feature-icon">
                      <Zap className="h-5 w-5" />
                    </div>
                    <h3 className="ef-feature-title">Quick Process</h3>
                    <p className="ef-feature-desc">2-minute quiz, fast turnaround</p>
                  </div>
                  <div className="ef-feature ef-feature-mobile snap-start">
                    <div className="ef-feature-icon">
                      <Sparkles className="h-5 w-5" />
                    </div>
                    <h3 className="ef-feature-title">No Obligation</h3>
                    <p className="ef-feature-desc">Free estimate, your approval needed</p>
                  </div>
                  <div className="ef-feature ef-feature-mobile snap-start">
                    <div className="ef-feature-icon">
                      <Landmark className="h-5 w-5" />
                    </div>
                    <h3 className="ef-feature-title">Statute-Based</h3>
                    <p className="ef-feature-desc">IRS guidelines & conservative assumptions</p>
                  </div>
                  <div className="ef-feature ef-feature-mobile snap-start">
                    <div className="ef-feature-icon">
                      <BadgeCheck className="h-5 w-5" />
                    </div>
                    <h3 className="ef-feature-title">Verified Claims</h3>
                    <p className="ef-feature-desc">No filing without documentation</p>
                  </div>
                </div>
                
                {/* Desktop: 2x2 Grid wrapped in Trust Panel */}
                <div className="ef-trust-panel hidden lg:block">
                  <div className="grid grid-cols-2 gap-3 content-start">
                  <div className="ef-feature animate-on-scroll">
                    <div className="ef-feature-icon">
                      <Landmark className="h-5 w-5" />
                    </div>
                    <h3 className="ef-feature-title">Statute-Based</h3>
                    <p className="ef-feature-desc">IRS guidelines & conservative assumptions</p>
                  </div>
                  <div className="ef-feature animate-on-scroll animation-delay-100">
                    <div className="ef-feature-icon">
                      <BadgeCheck className="h-5 w-5" />
                    </div>
                    <h3 className="ef-feature-title">Verified Claims</h3>
                    <p className="ef-feature-desc">No filing without documentation</p>
                  </div>
                  <div className="ef-feature animate-on-scroll animation-delay-200">
                    <div className="ef-feature-icon">
                      <Zap className="h-5 w-5" />
                    </div>
                    <h3 className="ef-feature-title">Quick Process</h3>
                    <p className="ef-feature-desc">2-minute quiz, fast turnaround</p>
                  </div>
                  <div className="ef-feature animate-on-scroll animation-delay-300">
                    <div className="ef-feature-icon">
                      <Sparkles className="h-5 w-5" />
                    </div>
                    <h3 className="ef-feature-title">No Obligation</h3>
                    <p className="ef-feature-desc">Free estimate, your approval needed</p>
                  </div>
                  </div>
                </div>
              </div>

              {/* Steps Column */}
              <div className="order-last lg:order-first animate-on-scroll">
                <p className="ef-section-label">How It Works</p>
                <h2 className="ef-section-title mb-6">From Quiz to Recovery</h2>
                <p className="ef-section-subtitle mb-10">
                  Our statute-based methodology ensures conservative, defensible estimates.
                  Every claim is verified before filing.
                </p>

                <div className="ef-steps-container">
                  {/* Timeline line (hidden on mobile for Bento style) */}
                  <div className="ef-timeline-line" aria-hidden="true"></div>
                  
                  {[
                    { num: '01', title: 'Take the 2-Minute Quiz', desc: 'Answer simple questions about your business and workforce.', icon: Clock, isLast: false, isActive: true },
                    { num: '02', title: 'Get Your Estimate', desc: 'Receive a conservative credit range instantly—no obligation.', icon: DollarSign, isLast: false, isActive: false },
                    { num: '03', title: 'Documentation Review', desc: 'Our team verifies eligibility with your payroll records.', icon: FileCheck, isLast: false, isActive: false },
                    { num: '04', title: 'Credit Recovery', desc: 'Claims filed with IRS. Funds deposited to your account.', icon: Landmark, isLast: true, isActive: false },
                  ].map((step, index) => (
                    <div 
                      key={step.num} 
                      className={`ef-step ${step.isLast ? 'ef-step-success' : ''} ${step.isActive ? 'ef-step-active' : ''} animate-on-scroll animation-delay-${index * 100}`}
                    >
                      <div className={`ef-step-icon ${step.isLast ? 'ef-step-icon-success' : ''}`}>
                        <step.icon className="h-5 w-5" />
                      </div>
                      <div className="ef-step-content">
                        <span className="ef-step-number">{step.num}</span>
                        <h3 className="ef-step-title">{step.title}</h3>
                        <p className="ef-step-desc">{step.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Industries */}
        <section className="ef-section ef-section-alt">
          <div className="ef-container">
            <div className="text-center mb-12">
              <p className="ef-section-label">Eligibility</p>
              <h2 className="ef-section-title">Qualifying Industries</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { name: 'Restaurants & Food Service', icon: Utensils },
                { name: 'Hotels & Hospitality', icon: Hotel },
                { name: 'Healthcare Providers', icon: HeartPulse },
                { name: 'Retail Operations', icon: ShoppingBag },
                { name: 'Manufacturing', icon: Factory },
                { name: 'Construction', icon: HardHat },
                { name: 'Professional Services', icon: Briefcase },
                { name: 'Non-Profit Organizations', icon: Heart },
              ].map((industry) => (
                <div key={industry.name} className="ef-industry-card group">
                  <industry.icon className="ef-industry-card-icon" />
                  <span className="ef-industry-card-text">{industry.name}</span>
                </div>
              ))}
            </div>

            {/* Catch-All Footer */}
            <div className="mt-10 text-center">
              <p className="text-sm" style={{ color: '#64748b' }}>
                Not sure if you qualify?{' '}
                <Link href="/estimator" className="ef-industry-cta-link">
                  Check your eligibility in 2 minutes
                </Link>
              </p>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="ef-section">
          <div className="ef-container">
            <div className="text-center mb-12">
              <p className="ef-section-label">FAQ</p>
              <h2 className="ef-section-title">Common Questions</h2>
            </div>

            <div className="ef-faq-grid max-w-4xl mx-auto">
              {[
                {
                  q: 'Is the quiz really free?',
                  a: 'Yes. The quiz and estimate are completely free. No fees apply without successful credit recovery and your explicit approval.',
                },
                {
                  q: 'How are estimates calculated?',
                  a: 'Estimates use statute-defined caps and conservative assumptions. All figures are ranges, not guarantees, and require documentation verification.',
                },
                {
                  q: 'What is the timeline?',
                  a: 'The quiz takes about 2 minutes. Verification timelines vary by program. IRS processing depends on current agency workload.',
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

        {/* Maximize Your Recovery - Authority Blocks */}
        <section className="ef-maximize-section">
          <div className="ef-container">
            <div className="text-center mb-12">
              <p className="ef-section-label">Proven Results</p>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-gray-900 tracking-tight">
                Maximize Your Recovery
              </h2>
            </div>

            {/* Authority Blocks Grid */}
            <div className="ef-authority-grid">
              {/* Block 1: Experience */}
              <div className="ef-authority-block group">
                <div className="ef-authority-icon-pedestal">
                  <Award className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-3xl font-extrabold text-gray-900 mb-3">20+ Years Experience</h3>
                <p className="text-gray-600 leading-relaxed">
                  Two decades of specialized expertise in federal tax credit recovery for restaurants, hospitality, and service businesses.
                </p>
              </div>

              {/* Flow Connector Arrow */}
              <div className="ef-flow-arrow">
                <ArrowRight className="w-10 h-10" />
              </div>

              {/* Block 2: Results */}
              <div className="ef-authority-block group">
                <div className="ef-authority-icon-pedestal">
                  <DollarSign className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-3xl font-extrabold text-gray-900 mb-3">$1 Billion Recovered</h3>
                <p className="text-gray-600 leading-relaxed">
                  Over one billion dollars in legitimate tax credits successfully claimed for our clients through IRS-compliant processes.
                </p>
              </div>
            </div>

            {/* CTA */}
            <div className="text-center mt-12">
              <Link href="/estimator">
                <button className="ef-btn ef-btn-primary ef-btn-xl">
                  Check My Eligibility
                  <ArrowRight className="h-5 w-5" />
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
