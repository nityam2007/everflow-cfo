import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not defined in environment variables');
}

// Initialize Stripe with API version
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-12-15.clover',
  typescript: true,
});

// Product configurations for pricing (v5.0.1 - updated for planv5)
export const PRODUCTS = {
  // ============================================
  // Capital Advisory Products (Paid)
  // ============================================
  FINANCIAL_MODELING: {
    name: 'Financial Modeling Core',
    price: 3500,
    description: 'The Math - 3-Statement Financial Model, 5-Year Forecast, Unit Economics & Valuation Analysis. 7 Days Turnaround.',
    recurring: false,
    turnaround: '7 days',
    features: [
      '3-Statement Financial Model (Excel)',
      '5-Year Dynamic Forecast',
      'Unit Economics & KPI Dashboard',
      'Valuation Analysis (DCF/Comps)',
    ],
  },
  SERIES_A_STACK: {
    name: 'The Series A Stack',
    price: 9500,
    description: 'The Full Package - Everything in Financial Modeling + 15-Slide Pitch Deck & Async Narrative Intake. 14 Days Turnaround.',
    recurring: false,
    turnaround: '14 days',
    features: [
      'Everything in Financial Modeling',
      '15-Slide Institutional Pitch Deck',
      'Async Narrative Intake + Review',
      'Investor Teaser One-Pager',
    ],
  },
  DUE_DILIGENCE: {
    name: 'Due Diligence & Deal Room',
    price: 5000,
    description: 'The Support - Virtual Data Room, Financial Cleanup, Cap Table & Async Q&A Support.',
    recurring: false,
    turnaround: 'Custom',
    features: [
      'Virtual Data Room (VDR) Structure',
      'Historical Financial cleanup (Reconciliation)',
      'Cap Table Management',
      'Async Q&A Support',
    ],
  },
  
  // ============================================
  // Tax & Finance Products (Paid)
  // ============================================
  TAX_COMPLIANCE: {
    name: 'Business Tax Filing',
    price: 1500,
    description: 'Complete Business Tax Filing - Federal & State Returns, Bookkeeping Review & K-1 Distribution.',
    recurring: false,
    turnaround: '7-14 days',
    features: [
      'Federal & State Corporate Tax Return',
      'Year-End Bookkeeping Review & Adjustments',
      'K-1 Distribution to Partners',
      'Extension Filing (if needed)',
    ],
  },
  INDIVIDUAL_TAX: {
    name: 'Individual/Freelancer Tax Filing',
    price: 500,
    description: 'Personal Tax Filing - Federal & State Returns, Schedule C, Freelance Income & Deductions.',
    recurring: false,
    turnaround: '5-7 days',
    features: [
      'Federal & State Personal Tax Return',
      'Schedule C for Self-Employment Income',
      'Freelance / 1099 Income Reporting',
      'Deduction Optimization',
    ],
  },
  
  // ============================================
  // Tax & Finance Products (Lead-Only - for display)
  // ============================================
  MANAGED_BACK_OFFICE: {
    name: 'Managed Back-Office',
    price: 750,
    description: 'The Monthly - Bookkeeping, Payroll Processing, Sales Tax Filing & Financial Statements.',
    recurring: true,
    turnaround: 'Ongoing',
    features: [
      'Monthly Bookkeeping & Reconciliation',
      'Full-Service Payroll Processing (Gusto/ADP)',
      'Sales Tax Filing (State Nexus)',
      'Monthly P&L and Balance Sheet',
    ],
  },
  FRACTIONAL_CFO: {
    name: 'Fractional CFO',
    price: 3000,
    description: 'The Strategic - Everything in Back-Office + Financial Modeling, Burn Analysis & Board Decks.',
    recurring: true,
    turnaround: 'Ongoing',
    features: [
      'Everything in Managed Back-Office',
      'Custom Financial Modeling & Forecasting',
      'Monthly Burn Rate & Runway Analysis',
      'Board Deck Preparation & Presentation',
    ],
  },
  
  // ============================================
  // Tax Credit Products (Lead-Only)
  // ============================================
  RD_CREDIT: {
    name: 'R&D Tax Credit',
    price: 0, // Success-based pricing
    description: 'Research & Development Tax Credit - Claim credits for qualifying R&D activities. Success-based pricing.',
    recurring: false,
    turnaround: '60-90 days',
    features: [
      'Eligibility Assessment',
      'Documentation & Study',
      'IRS Compliance',
      'Audit Defense Support',
    ],
  },
  FICA_TIP_CREDIT: {
    name: 'FICA Tip Credit',
    price: 0, // Success-based pricing
    description: 'FICA Tip Tax Credit for restaurants and hospitality businesses. Success-based pricing.',
    recurring: false,
    turnaround: '30-45 days',
    features: [
      'Tip Credit Calculation',
      'Payroll Analysis',
      'IRS Form Preparation',
      'Multi-Year Recovery',
    ],
  },
  WOTC_CREDIT: {
    name: 'WOTC Credit',
    price: 0, // Success-based pricing
    description: 'Work Opportunity Tax Credit for targeted hiring. Success-based pricing.',
    recurring: false,
    turnaround: '30-45 days',
    features: [
      'Employee Screening',
      'Certification Processing',
      'Credit Calculation',
      'Ongoing Compliance',
    ],
  },
} as const;

export type ProductKey = keyof typeof PRODUCTS;

// Products that go through checkout (paid products)
export const PAID_PRODUCT_KEYS: ProductKey[] = [
  'FINANCIAL_MODELING',
  'SERIES_A_STACK', 
  'DUE_DILIGENCE',
  'TAX_COMPLIANCE',
  'INDIVIDUAL_TAX',
];

// Products that are lead-only (no checkout)
export const LEAD_ONLY_PRODUCT_KEYS: ProductKey[] = [
  'MANAGED_BACK_OFFICE',
  'FRACTIONAL_CFO',
  'RD_CREDIT',
  'FICA_TIP_CREDIT',
  'WOTC_CREDIT',
];

/**
 * Check if a product requires checkout
 */
export function isProductPaid(productKey: string): boolean {
  return PAID_PRODUCT_KEYS.includes(productKey as ProductKey);
}

/**
 * Create a Stripe Checkout Session for one-time or recurring payments
 */
export async function createCheckoutSession(
  productKey: ProductKey,
  successUrl: string,
  cancelUrl: string,
  customerEmail?: string,
  metadata?: Record<string, string>
) {
  const product = PRODUCTS[productKey];
  
  const session = await stripe.checkout.sessions.create({
    mode: product.recurring ? 'subscription' : 'payment',
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: product.name,
            description: product.description,
          },
          unit_amount: product.price * 100, // Convert to cents
          ...(product.recurring && {
            recurring: {
              interval: 'month',
            },
          }),
        },
        quantity: 1,
      },
    ],
    customer_email: customerEmail,
    success_url: successUrl,
    cancel_url: cancelUrl,
    // We collect phone in our form, no need for Stripe to collect again
    // phone_number_collection: { enabled: true },
    // Collect billing address
    billing_address_collection: 'required',
    metadata: {
      productKey,
      ...metadata,
    },
  });

  return session;
}

/**
 * Retrieve a Checkout Session by ID
 */
export async function getCheckoutSession(sessionId: string) {
  return await stripe.checkout.sessions.retrieve(sessionId);
}
