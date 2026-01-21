'use client';

import { useState } from 'react';
import { ArrowRight, Check, Loader2, X } from 'lucide-react';

interface PricingCardProps {
  productKey: string;
  title: string;
  price: number | string;
  badge?: string;
  badgeColor?: 'tip' | 'wotc' | 'erc';
  icon: React.ReactNode;
  iconColor?: 'tip' | 'wotc' | 'erc';
  description: string;
  features: string[];
  ctaText: string;
  recurring?: boolean; // Reserved for future subscription features
  pricePrefix?: string;
  priceSuffix?: string;
  turnaround?: string;
  highlighted?: boolean;
  animationDelay?: number;
}

interface CustomerFormData {
  name: string;
  email: string;
  phone: string;
  companyName: string;
}

export function PricingCard({
  productKey,
  title,
  price,
  badge,
  badgeColor = 'tip',
  icon,
  iconColor = 'tip',
  description,
  features,
  ctaText,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  recurring = false,
  pricePrefix,
  priceSuffix,
  turnaround,
  highlighted = false,
  animationDelay = 0,
}: PricingCardProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState<CustomerFormData>({
    name: '',
    email: '',
    phone: '',
    companyName: '',
  });
  const [errors, setErrors] = useState<Partial<CustomerFormData>>({});

  const validateForm = () => {
    const newErrors: Partial<CustomerFormData> = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone is required';
    } else if (!/^[\d\s\-\+\(\)]{10,}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Invalid phone number';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      // Step 1: Create lead with unpaid status
      const leadResponse = await fetch('/api/leads/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          productKey,
          productName: title,
          amount: typeof price === 'number' ? price : parseFloat(String(price).replace(/,/g, '')),
        }),
      });

      const leadData = await leadResponse.json();
      
      if (!leadResponse.ok) {
        throw new Error(leadData.error || 'Failed to create lead');
      }

      // Step 2: Create Stripe checkout session with customer info
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productKey,
          customerEmail: formData.email,
          customerName: formData.name,
          customerPhone: formData.phone,
          leadId: leadData.leadId,
          metadata: {
            leadId: leadData.leadId,
            customerName: formData.name,
            customerPhone: formData.phone,
            companyName: formData.companyName,
          },
        }),
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        console.error('No checkout URL received');
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
      setIsLoading(false);
    }
  };

  const cardClass = highlighted ? 'ef-program-card-erc' : `ef-program-card-${badgeColor}`;
  const iconClass = `ef-program-icon-${iconColor}`;
  const badgeClass = `ef-program-badge-${badgeColor}`;

  return (
    <>
      <div className={`ef-program-card ${cardClass} group animate-on-scroll animation-delay-${animationDelay} relative`}>
        {highlighted && (
          <div className="ef-pricing-badge">
            {badge === 'The Strategic' ? 'HIGH GROWTH' : 'MOST POPULAR'}
          </div>
        )}
        <div className="ef-program-header">
          <div className={`ef-program-icon ${iconClass}`}>
            {icon}
          </div>
          {badge && <span className={`ef-program-badge ${badgeClass}`}>{badge}</span>}
        </div>
        <h3 className="ef-program-title">{title}</h3>
        <div className="ef-program-amount-hero">
          {pricePrefix && <span className="ef-program-amount-prefix">{pricePrefix}</span>}
          <span className="ef-program-amount-value">${typeof price === 'number' ? price.toLocaleString() : price}</span>
          {priceSuffix && <span className="text-sm text-gray-500">{priceSuffix}</span>}
        </div>
        {turnaround && <p className="text-xs text-gray-500 mb-4">{turnaround}</p>}
        <p className="ef-program-desc mb-6">{description}</p>
        <ul className="space-y-2 mb-6 text-sm">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start gap-2">
              <Check className="h-4 w-4 text-[var(--brand-success)] flex-shrink-0 mt-0.5" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
        <button
          onClick={() => setShowModal(true)}
          className="ef-program-link w-full justify-center"
        >
          {ctaText} <ArrowRight className="h-4 w-4" />
        </button>
      </div>

      {/* Customer Info Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Get Started</h3>
                  <p className="text-sm text-gray-500 mt-1">{title} - ${typeof price === 'number' ? price.toLocaleString() : price}{priceSuffix}</p>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5 text-gray-400" />
                </button>
              </div>
            </div>
            
            <form onSubmit={handleCheckout} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="John Doe"
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] ${
                    errors.name ? 'border-red-500' : 'border-gray-200'
                  }`}
                />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="john@company.com"
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] ${
                    errors.email ? 'border-red-500' : 'border-gray-200'
                  }`}
                />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+1 (555) 123-4567"
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] ${
                    errors.phone ? 'border-red-500' : 'border-gray-200'
                  }`}
                />
                {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Company Name <span className="text-gray-400">(Optional)</span>
                </label>
                <input
                  type="text"
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  placeholder="Your Company Inc."
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]"
                />
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 px-6 bg-[var(--brand-primary)] text-white font-semibold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      Continue to Payment
                      <ArrowRight className="h-5 w-5" />
                    </>
                  )}
                </button>
              </div>

              <p className="text-xs text-center text-gray-500 mt-4">
                🔒 Your information is secure. We&apos;ll redirect you to Stripe for payment.
              </p>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
