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
