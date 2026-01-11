'use client';

import { useState } from 'react';
import { ArrowRight, Check, Loader2 } from 'lucide-react';

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
  recurring?: boolean;
  pricePrefix?: string;
  priceSuffix?: string;
  turnaround?: string;
  highlighted?: boolean;
  animationDelay?: number;
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
  recurring = false,
  pricePrefix,
  priceSuffix,
  turnaround,
  highlighted = false,
  animationDelay = 0,
}: PricingCardProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleCheckout = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productKey,
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
        onClick={handleCheckout}
        disabled={isLoading}
        className="ef-program-link w-full justify-center"
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            {ctaText} <ArrowRight className="h-4 w-4" />
          </>
        )}
      </button>
    </div>
  );
}
