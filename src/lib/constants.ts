/**
 * Centralized constants for the application
 * Edit here → Changes everywhere
 * v5.0.1 - Updated for planv5 with new product structure
 */

// Status colors for leads
export const LEAD_STATUS_COLORS: Record<string, 'default' | 'secondary' | 'success' | 'warning' | 'destructive'> = {
  NEW: 'default',
  ASSIGNED: 'secondary',
  IN_PROGRESS: 'warning',
  CLOSED: 'success',
  LOST: 'destructive',
} as const;

// Eligibility colors
export const ELIGIBILITY_COLORS: Record<string, 'default' | 'secondary' | 'success' | 'warning' | 'destructive'> = {
  LOW: 'warning',
  MODERATE: 'secondary',
  STRONG: 'success',
} as const;

// Partner assignment status colors
export const ASSIGNMENT_STATUS_COLORS: Record<string, 'default' | 'secondary' | 'success' | 'warning' | 'destructive'> = {
  PENDING: 'warning',
  IN_PROGRESS: 'secondary',
  COMPLETED: 'success',
  CANCELLED: 'destructive',
} as const;

// Priority colors
export const PRIORITY_COLORS: Record<number, 'default' | 'secondary' | 'success' | 'warning' | 'destructive'> = {
  0: 'default',
  1: 'warning',
  2: 'destructive',
} as const;

export const PRIORITY_LABELS: Record<number, string> = {
  0: 'Normal',
  1: 'High',
  2: 'Urgent',
} as const;

// Product type configuration - matches Prisma enum
export const PRODUCT_TYPES = {
  // Capital Advisory - Paid
  FINANCIAL_MODELING: {
    label: 'Financial Modeling Core',
    shortLabel: 'Model',
    category: 'capital',
    isPaid: true,
    price: 3500,
    color: 'blue',
  },
  SERIES_A_STACK: {
    label: 'Series A Stack',
    shortLabel: 'Stack',
    category: 'capital',
    isPaid: true,
    price: 9500,
    color: 'indigo',
  },
  DUE_DILIGENCE: {
    label: 'Due Diligence & Deal Room',
    shortLabel: 'DD',
    category: 'capital',
    isPaid: true,
    price: 5000,
    color: 'purple',
  },
  // Tax & Finance - Paid
  TAX_COMPLIANCE: {
    label: 'Business Tax Filing',
    shortLabel: 'Biz Tax',
    category: 'tax',
    isPaid: true,
    price: 1500,
    color: 'green',
  },
  INDIVIDUAL_TAX: {
    label: 'Individual/Freelancer Tax',
    shortLabel: 'Ind Tax',
    category: 'tax',
    isPaid: true,
    price: 500,
    color: 'teal',
  },
  // Tax & Finance - Lead Only
  MANAGED_BACK_OFFICE: {
    label: 'Managed Back-Office',
    shortLabel: 'Back Office',
    category: 'tax',
    isPaid: false,
    price: 750, // Monthly
    color: 'amber',
  },
  FRACTIONAL_CFO: {
    label: 'Fractional CFO',
    shortLabel: 'CFO',
    category: 'tax',
    isPaid: false,
    price: 3000, // Monthly
    color: 'orange',
  },
  // Credits - Lead Only
  RD_CREDIT: {
    label: 'R&D Tax Credit',
    shortLabel: 'R&D',
    category: 'credits',
    isPaid: false,
    price: 0,
    color: 'violet',
  },
  FICA_TIP_CREDIT: {
    label: 'FICA Tip Credit',
    shortLabel: 'FICA',
    category: 'credits',
    isPaid: false,
    price: 0,
    color: 'emerald',
  },
  WOTC_CREDIT: {
    label: 'WOTC',
    shortLabel: 'WOTC',
    category: 'credits',
    isPaid: false,
    price: 0,
    color: 'cyan',
  },
  // Legacy
  ESTIMATOR: {
    label: 'Credit Estimator',
    shortLabel: 'Est',
    category: 'credits',
    isPaid: false,
    price: 0,
    color: 'gray',
  },
  OTHER: {
    label: 'Other',
    shortLabel: 'Other',
    category: 'other',
    isPaid: false,
    price: 0,
    color: 'gray',
  },
} as const;

// Lead source configuration
export const LEAD_SOURCES = {
  DIRECT: { label: 'Direct', color: 'gray' },
  ESTIMATOR: { label: 'Estimator', color: 'blue' },
  TAX_BUSINESS: { label: 'Business Tax', color: 'green' },
  TAX_INDIVIDUAL: { label: 'Individual Tax', color: 'teal' },
  CREDITS_RD: { label: 'R&D Credit', color: 'violet' },
  CREDITS_FICA: { label: 'FICA Credit', color: 'emerald' },
  CREDITS_WOTC: { label: 'WOTC', color: 'cyan' },
  CAPITAL: { label: 'Capital', color: 'indigo' },
  REFERRAL: { label: 'Referral', color: 'pink' },
  OTHER: { label: 'Other', color: 'gray' },
} as const;

// Credit type configuration (for legacy estimator)
export const CREDIT_TYPES = {
  TIP: {
    label: 'FICA Tip Credit',
    shortLabel: 'TIP',
    color: 'emerald',
    bgClass: 'bg-emerald-50',
    textClass: 'text-emerald-700',
    borderClass: 'border-emerald-200',
  },
  WOTC: {
    label: 'Work Opportunity Credit',
    shortLabel: 'WOTC',
    color: 'blue',
    bgClass: 'bg-blue-50',
    textClass: 'text-blue-700',
    borderClass: 'border-blue-200',
  },
  RD: {
    label: 'R&D Tax Credit',
    shortLabel: 'R&D',
    color: 'violet',
    bgClass: 'bg-violet-50',
    textClass: 'text-violet-700',
    borderClass: 'border-violet-200',
  },
} as const;

// Site configuration
export const SITE_CONFIG = {
  name: 'EverflowCFO',
  tagline: 'Financial Architecture for High-Growth Companies',
  description: 'From Series A Fundraising to Tax Compliance & Credit Recovery.',
  version: '5.0.1',
} as const;

// Navigation links for public site (updated for planv5)
export const PUBLIC_NAV_LINKS = [
  { href: '/#capital', label: 'Capital' },
  { href: '/tax', label: 'Tax & Finance' },
  { href: '/credits', label: 'Credits' },
  { href: '/#how-it-works', label: 'How It Works' },
] as const;

// Navigation links for dashboard
export const DASHBOARD_NAV_LINKS = {
  main: [
    { href: '/dashboard', label: 'Dashboard', icon: 'LayoutDashboard' },
    { href: '/dashboard/leads', label: 'Leads', icon: 'Users' },
    { href: '/dashboard/payments', label: 'Payments', icon: 'CreditCard' },
  ],
  admin: [
    { href: '/dashboard/my-tasks', label: 'My Tasks', icon: 'CheckSquare' },
    { href: '/dashboard/audit', label: 'Audit Log', icon: 'Activity' },
    { href: '/dashboard/settings', label: 'Settings', icon: 'Settings' },
  ],
} as const;

// Navigation links for partner portal
export const PARTNER_NAV_LINKS = [
  { href: '/partner', label: 'Dashboard', icon: 'LayoutDashboard' },
  { href: '/partner/leads', label: 'Assigned Leads', icon: 'FileText' },
  { href: '/partner/billing', label: 'Billing', icon: 'CreditCard' },
  { href: '/partner/profile', label: 'Profile', icon: 'User' },
] as const;

// Category labels for filtering
export const PRODUCT_CATEGORIES = {
  capital: { label: 'Capital Advisory', color: 'indigo' },
  tax: { label: 'Tax & Finance', color: 'green' },
  credits: { label: 'Tax Credits', color: 'violet' },
  other: { label: 'Other', color: 'gray' },
} as const;
