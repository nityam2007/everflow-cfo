'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Menu, X } from 'lucide-react';

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Prevent scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  return (
    <>
      <header className={`ef-header ${scrolled ? 'scrolled' : ''} ${mobileMenuOpen ? 'menu-open' : ''}`}>
        <div className="ef-header-inner">
          <Link href="/" className="ef-logo">
            <span className="ef-logo-text">EverflowCFO</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="ef-nav">
            <Link href="/#capital" className="ef-nav-link">Capital Advisory</Link>
            <Link href="/#cfo-tax" className="ef-nav-link">CFO & Tax</Link>
            <Link href="/#programs" className="ef-nav-link">Payroll Credits</Link>
            <Link href="/#contact" className="ef-nav-link">Contact</Link>
            <Link href="/login">
              <button className="ef-btn ef-btn-secondary">Login</button>
            </Link>
            <Link href="/estimator">
              <button className="ef-btn ef-btn-accent">Check Eligibility</button>
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <button 
            className="ef-mobile-menu-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <div className={`ef-mobile-menu ${mobileMenuOpen ? 'open' : ''}`}>
        <nav className="ef-mobile-nav">
          <Link href="/#capital" className="ef-mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>
            Capital Advisory
          </Link>
          <Link href="/#cfo-tax" className="ef-mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>
            CFO & Tax
          </Link>
          <Link href="/#programs" className="ef-mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>
            Payroll Credits
          </Link>
          <Link href="/#contact" className="ef-mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>
            Contact
          </Link>
          <div className="ef-mobile-nav-buttons">
            <Link href="/login" className="w-full" onClick={() => setMobileMenuOpen(false)}>
              <button className="ef-btn ef-btn-secondary w-full">Login</button>
            </Link>
            <Link href="/estimator" className="w-full" onClick={() => setMobileMenuOpen(false)}>
              <button className="ef-btn ef-btn-accent w-full">Check Eligibility</button>
            </Link>
          </div>
        </nav>
      </div>
    </>
  );
}
