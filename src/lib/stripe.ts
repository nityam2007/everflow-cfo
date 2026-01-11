import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not defined in environment variables');
}

// Initialize Stripe with API version
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-12-15.clover',
  typescript: true,
});

// Product configurations for pricing
export const PRODUCTS = {
  // Capital Advisory Products
  FINANCIAL_MODELING: {
    name: 'Financial Modeling Core',
    price: 3500,
    description: 'The Math - 3-Statement Financial Model, 5-Year Forecast, Unit Economics & Valuation Analysis',
    recurring: false,
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
    description: 'The Full Package - Everything in Financial Modeling + 15-Slide Pitch Deck & Strategy Session',
    recurring: false,
    features: [
      'Everything in Financial Modeling',
      '15-Slide Institutional Pitch Deck',
      'Narrative Strategy Session',
      'Investor Teaser One-Pager',
    ],
  },
  DUE_DILIGENCE: {
    name: 'Due Diligence & Deal Room',
    price: 5000,
    description: 'The Support - Virtual Data Room, Financial Cleanup, Cap Table & Investor Q&A',
    recurring: false,
    features: [
      'Virtual Data Room (VDR) Structure',
      'Historical Financial cleanup (Reconciliation)',
      'Cap Table Management',
      'Investor Q&A Support',
    ],
  },
  
  // CFO & Tax Products
  TAX_COMPLIANCE: {
    name: 'Tax Compliance',
    price: 1500,
    description: 'The Annual - Federal & State Tax Returns, Bookkeeping Review & K-1 Distribution',
    recurring: false,
    features: [
      'Federal & State Corporate Tax Return',
      'Year-End Bookkeeping Review & Adjustments',
      'K-1 Distribution to Partners',
      'Extension Filing (if needed)',
    ],
  },
  MANAGED_BACK_OFFICE: {
    name: 'Managed Back-Office',
    price: 750,
    description: 'The Monthly - Bookkeeping, Payroll Processing, Sales Tax Filing & Financial Statements',
    recurring: true,
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
    description: 'The Strategic - Everything in Back-Office + Financial Modeling, Burn Analysis & Board Decks',
    recurring: true,
    features: [
      'Everything in Managed Back-Office',
      'Custom Financial Modeling & Forecasting',
      'Monthly Burn Rate & Runway Analysis',
      'Board Deck Preparation & Presentation',
    ],
  },
} as const;

export type ProductKey = keyof typeof PRODUCTS;

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
