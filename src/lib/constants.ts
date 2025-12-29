/**
 * Centralized constants for the application
 * Edit here → Changes everywhere
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

// Credit type configuration
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
  ERC: {
    label: 'Employee Retention Credit',
    shortLabel: 'ERC',
    color: 'gray',
    bgClass: 'bg-gray-50',
    textClass: 'text-gray-600',
    borderClass: 'border-gray-200',
  },
} as const;

// Site configuration
export const SITE_CONFIG = {
  name: 'EverflowCFO',
  tagline: 'Payroll Credit Pre-Assessment Platform',
  description: 'Evaluate your eligibility for FICA Tip Credit, WOTC, and other federal programs.',
} as const;

// Navigation links for public site
export const PUBLIC_NAV_LINKS = [
  { href: '/estimator', label: 'Assessment' },
  { href: '/calculator', label: 'Calculator' },
  { href: '/login', label: 'Partner Login' },
] as const;

// Navigation links for dashboard
export const DASHBOARD_NAV_LINKS = {
  main: [
    { href: '/dashboard', label: 'Dashboard', icon: 'LayoutDashboard' },
    { href: '/dashboard/leads', label: 'Leads', icon: 'Users' },
  ],
  admin: [
    { href: '/dashboard/audit', label: 'Audit Log', icon: 'Activity' },
    { href: '/dashboard/settings', label: 'Settings', icon: 'Settings' },
  ],
} as const;

// Navigation links for partner portal
export const PARTNER_NAV_LINKS = [
  { href: '/partner', label: 'Assigned Leads', icon: 'FileText' },
] as const;
