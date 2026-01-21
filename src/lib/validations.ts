import { z } from 'zod';

// ============================================
// ESTIMATOR FORM SCHEMAS
// ============================================

export const industryOptions = [
  { value: 'restaurant', label: 'Restaurant / Food Service' },
  { value: 'hospitality', label: 'Hospitality / Hotels' },
  { value: 'retail', label: 'Retail' },
  { value: 'healthcare', label: 'Healthcare' },
  { value: 'manufacturing', label: 'Manufacturing' },
  { value: 'construction', label: 'Construction' },
  { value: 'professional_services', label: 'Professional Services' },
  { value: 'other', label: 'Other' },
] as const;

export const stateOptions = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY',
] as const;

export const employeeRangeOptions = [
  { value: '1-10', label: '1-10 employees' },
  { value: '10-25', label: '10-25 employees' },
  { value: '25-50', label: '25-50 employees' },
  { value: '50-100', label: '50-100 employees' },
  { value: '100-250', label: '100-250 employees' },
  { value: '250-500', label: '250-500 employees' },
  { value: '500+', label: '500+ employees' },
] as const;

export const payrollRangeOptions = [
  { value: '100000-500000', label: '$100K - $500K' },
  { value: '500000-1000000', label: '$500K - $1M' },
  { value: '1000000-2000000', label: '$1M - $2M' },
  { value: '2000000-5000000', label: '$2M - $5M' },
  { value: '5000000-10000000', label: '$5M - $10M' },
  { value: '10000000+', label: '$10M+' },
] as const;

// Step 1: Business Profile
export const businessProfileSchema = z.object({
  industry: z.enum(['restaurant', 'hospitality', 'retail', 'healthcare', 'manufacturing', 'construction', 'professional_services', 'other']),
  state: z.enum(stateOptions),
  yearsInOperation: z.number().min(1).max(100),
});

// Step 2: Workforce Composition
export const workforceSchema = z.object({
  fullTimeEmployees: z.enum(['1-10', '10-25', '25-50', '50-100', '100-250', '250-500', '500+']),
  partTimeEmployees: z.boolean(),
  tippedEmployees: z.boolean(),
  seasonalLabor: z.boolean().optional(),
});

// Step 3: Payroll Scale
export const payrollSchema = z.object({
  annualPayroll: z.enum(['100000-500000', '500000-1000000', '1000000-2000000', '2000000-5000000', '5000000-10000000', '10000000+']),
  averageWage: z.number().min(15000).max(500000).optional(),
});

// Step 4: Impact & Hiring Signals
export const impactSchema = z.object({
  operationalDisruption2020: z.boolean(),
  governmentMandates: z.boolean(),
  targetedHiring: z.boolean(),
});

// Combined estimator inputs
export const estimatorInputsSchema = z.object({
  ...businessProfileSchema.shape,
  ...workforceSchema.shape,
  ...payrollSchema.shape,
  ...impactSchema.shape,
});

export type EstimatorInputs = z.infer<typeof estimatorInputsSchema>;

// Identity gate / lead capture
export const identitySchema = z.object({
  contactName: z.string().min(2, 'Name is required'),
  companyName: z.string().min(2, 'Company name is required'),
  email: z.string().email('Valid email is required'),
  phone: z.string().min(10, 'Phone number is required').optional(),
});

export type IdentityInputs = z.infer<typeof identitySchema>;

// Full lead submission
export const leadSubmissionSchema = z.object({
  estimator: estimatorInputsSchema,
  identity: identitySchema,
  source: z.string().optional(),
});

export type LeadSubmission = z.infer<typeof leadSubmissionSchema>;

// ============================================
// ADMIN/STAFF SCHEMAS
// ============================================

export const loginSchema = z.object({
  email: z.string().email('Valid email is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export type LoginInputs = z.infer<typeof loginSchema>;

export const updateLeadStatusSchema = z.object({
  leadId: z.string(),
  status: z.enum(['NEW', 'ASSIGNED', 'IN_PROGRESS', 'CLOSED', 'LOST']),
});

export const assignLeadSchema = z.object({
  leadId: z.string(),
  staffId: z.string(),
});

export const addNoteSchema = z.object({
  leadId: z.string(),
  content: z.string().min(1, 'Note content is required'),
});

export const createUserSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(['ADMIN', 'STAFF']),
});

// ============================================
// PRODUCT-SPECIFIC SCHEMAS (v5.0.1)
// ============================================

// Product types enum matching Prisma schema
export const productTypes = [
  'FINANCIAL_MODELING',
  'SERIES_A_STACK',
  'DUE_DILIGENCE',
  'TAX_COMPLIANCE',
  'INDIVIDUAL_TAX',
  'MANAGED_BACK_OFFICE',
  'FRACTIONAL_CFO',
  'RD_CREDIT',
  'FICA_TIP_CREDIT',
  'WOTC_CREDIT',
  'ESTIMATOR',
  'OTHER',
] as const;

// Lead sources enum matching Prisma schema
export const leadSources = [
  'DIRECT',
  'ESTIMATOR',
  'TAX_BUSINESS',
  'TAX_INDIVIDUAL',
  'CREDITS_RD',
  'CREDITS_FICA',
  'CREDITS_WOTC',
  'CAPITAL',
  'REFERRAL',
  'OTHER',
] as const;

// Product lead identity schema (supports individuals too)
export const productIdentitySchema = z.object({
  contactName: z.string().min(2, 'Name is required'),
  companyName: z.string().optional(),
  email: z.string().email('Valid email is required'),
  phone: z.string().min(10, 'Phone number is required').optional(),
});

// Tax filing schema - business
export const taxBusinessSchema = z.object({
  entityType: z.enum(['LLC', 'S_CORP', 'C_CORP', 'PARTNERSHIP', 'SOLE_PROP']),
  state: z.enum(stateOptions),
  annualRevenue: z.enum(['0-100000', '100000-500000', '500000-1000000', '1000000-5000000', '5000000+']),
  hasPayroll: z.boolean(),
  needsExtension: z.boolean().optional(),
  additionalInfo: z.string().optional(),
});

export type TaxBusinessInputs = z.infer<typeof taxBusinessSchema>;

// Tax filing schema - individual
export const taxIndividualSchema = z.object({
  filingStatus: z.enum(['SINGLE', 'MARRIED_JOINT', 'MARRIED_SEPARATE', 'HEAD_OF_HOUSEHOLD']),
  hasW2: z.boolean(),
  has1099: z.boolean(),
  hasInvestments: z.boolean(),
  hasRealEstate: z.boolean().optional(),
  hasCrypto: z.boolean().optional(),
  additionalInfo: z.string().optional(),
});

export type TaxIndividualInputs = z.infer<typeof taxIndividualSchema>;

// R&D Credit eligibility schema
export const rdCreditSchema = z.object({
  industry: z.enum(['technology', 'manufacturing', 'biotech', 'aerospace', 'construction', 'other']),
  annualRdSpend: z.enum(['0-50000', '50000-250000', '250000-1000000', '1000000+']),
  employeeCount: z.enum(['1-10', '10-50', '50-250', '250+']),
  hasDocumentation: z.boolean(),
  priorRdClaims: z.boolean(),
  description: z.string().min(10, 'Please describe your R&D activities'),
});

export type RdCreditInputs = z.infer<typeof rdCreditSchema>;

// Capital solution schema
export const capitalSchema = z.object({
  fundingStage: z.enum(['SEED', 'SERIES_A', 'SERIES_B', 'GROWTH', 'BRIDGE']),
  monthlyBurnRate: z.enum(['0-50000', '50000-150000', '150000-500000', '500000+']),
  currentRunway: z.enum(['0-3_MONTHS', '3-6_MONTHS', '6-12_MONTHS', '12_PLUS_MONTHS']),
  targetRaise: z.enum(['500000-2000000', '2000000-5000000', '5000000-15000000', '15000000+']),
  primaryUseOfFunds: z.string().min(5, 'Please describe your use of funds'),
});

export type CapitalInputs = z.infer<typeof capitalSchema>;

// Combined product lead submission schema
export const productLeadSchema = z.object({
  productType: z.enum(productTypes),
  identity: productIdentitySchema,
  estimator: z.union([
    taxBusinessSchema,
    taxIndividualSchema,
    rdCreditSchema,
    capitalSchema,
    estimatorInputsSchema,
    z.record(z.unknown()), // Allow flexible data for other products
  ]).optional(),
  source: z.string().optional(),
  leadOnly: z.boolean().optional(),
});

export type ProductLeadSubmission = z.infer<typeof productLeadSchema>;

// ============================================
// CHECKOUT SCHEMAS
// ============================================

export const checkoutSchema = z.object({
  productKey: z.string(),
  email: z.string().email(),
  name: z.string().min(2),
  leadId: z.string().optional(),
  metadata: z.record(z.string()).optional(),
});

export type CheckoutInputs = z.infer<typeof checkoutSchema>;

// ============================================
// PARTNER PORTAL SCHEMAS
// ============================================

export const partnerLoginSchema = z.object({
  email: z.string().email('Valid email is required'),
  password: z.string().min(6, 'Password is required'),
});

export const partnerSignupSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Valid email is required'),
  companyName: z.string().min(2, 'Company name is required'),
  phone: z.string().min(10, 'Phone is required').optional(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

export const partnerProfileSchema = z.object({
  name: z.string().min(2),
  companyName: z.string().min(2).optional(),
  phone: z.string().min(10).optional(),
  address: z.string().optional(),
  website: z.string().url().optional().or(z.literal('')),
});

export const partnerNoteSchema = z.object({
  leadId: z.string(),
  content: z.string().min(1, 'Note is required'),
});

// ============================================
// SETTINGS SCHEMAS
// ============================================

export const siteSettingsSchema = z.object({
  companyName: z.string().min(2),
  companyEmail: z.string().email(),
  companyPhone: z.string().optional(),
  defaultTaxRate: z.number().min(0).max(100).optional(),
  autoAssignLeads: z.boolean().optional(),
  notifyOnNewLead: z.boolean().optional(),
  maintenanceMode: z.boolean().optional(),
});

export type SiteSettings = z.infer<typeof siteSettingsSchema>;
