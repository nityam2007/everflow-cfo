// ============================================
// VERSIONED ESTIMATOR RULES CONFIGURATION
// All credit calculations are driven by this config
// ============================================

export interface EstimatorRulesConfig {
  version: string;
  effectiveDate: string;
  description: string;
  credits: {
    erc: ERCRules;
    tip: TIPRules;
    wotc: WOTCRules;
  };
  employeeRanges: Record<string, number>;
  payrollRanges: Record<string, number>;
}

interface ERCRules {
  enabled: boolean;
  maxPerEmployee: number;
  qualifiers: {
    operationalDisruption: boolean;
    governmentMandates: boolean;
  };
  factors: {
    conservativeMin: number;
    conservativeMax: number;
    bothQualifiersMin: number;
    bothQualifiersMax: number;
  };
  explanations: {
    eligible: string[];
    notEligible: string[];
  };
}

interface TIPRules {
  enabled: boolean;
  ficaRate: number;
  eligibleIndustries: string[];
  avgAnnualTipsPerEmployee: number;
  tippedEmployeeRatio: number;
  factors: {
    conservativeMin: number;
    conservativeMax: number;
  };
  explanations: {
    eligible: string[];
    notEligible: string[];
  };
}

interface WOTCRules {
  enabled: boolean;
  avgCreditPerHire: number;
  maxCreditPerHire: number;
  annualTurnoverRate: number;
  factors: {
    qualifiedHireRateLow: number;
    qualifiedHireRateHigh: number;
  };
  explanations: {
    eligible: string[];
    notEligible: string[];
  };
}

// ============================================
// CURRENT ACTIVE RULES (v1.0.0)
// ============================================

export const CURRENT_RULES_VERSION = '1.0.0';

export const rulesV1_0_0: EstimatorRulesConfig = {
  version: '1.0.0',
  effectiveDate: '2025-12-29',
  description: 'Initial conservative estimation rules based on statutory limits',

  // Employee count midpoints for estimation
  employeeRanges: {
    '1-10': 5,
    '10-25': 17,
    '25-50': 37,
    '50-100': 75,
    '100-250': 175,
    '250-500': 375,
    '500+': 600,
  },

  // Payroll midpoints for estimation
  payrollRanges: {
    '100000-500000': 300000,
    '500000-1000000': 750000,
    '1000000-2000000': 1500000,
    '2000000-5000000': 3500000,
    '5000000-10000000': 7500000,
    '10000000+': 15000000,
  },

  credits: {
    // ERC: Employee Retention Credit
    // Gated - requires specific 2020-2021 eligibility
    erc: {
      enabled: true,
      maxPerEmployee: 26000, // $5,000 (2020) + $21,000 (2021 Q1-Q3)
      qualifiers: {
        operationalDisruption: true,
        governmentMandates: true,
      },
      factors: {
        // Conservative factors when only one qualifier is met
        conservativeMin: 0.25,
        conservativeMax: 0.45,
        // Slightly higher when both qualifiers are met
        bothQualifiersMin: 0.35,
        bothQualifiersMax: 0.55,
      },
      explanations: {
        eligible: [
          'Based on reported 2020-2021 operational disruption',
          'Subject to IRS verification of qualifying periods',
          'Conservative pre-assessment pending documentation review',
        ],
        notEligible: [
          'No qualifying disruption or mandate impact reported',
          'ERC requires specific 2020-2021 eligibility criteria',
        ],
      },
    },

    // TIP: FICA Tip Credit (Section 45B)
    // Hero credit for restaurants/hospitality
    tip: {
      enabled: true,
      ficaRate: 0.0765, // 7.65% FICA rate
      eligibleIndustries: ['restaurant', 'hospitality'],
      avgAnnualTipsPerEmployee: 15000,
      tippedEmployeeRatio: 0.35, // 35% of workforce assumed tipped
      factors: {
        conservativeMin: 0.6,
        conservativeMax: 0.85,
      },
      explanations: {
        eligible: [
          'Based on tipped workforce in qualifying industry',
          'Ongoing annual credit opportunity',
          'Credit applies to FICA taxes on tips above minimum wage',
        ],
        notEligible: [
          'Requires tipped employees in restaurant/hospitality',
        ],
      },
    },

    // WOTC: Work Opportunity Tax Credit
    wotc: {
      enabled: true,
      avgCreditPerHire: 4000,
      maxCreditPerHire: 9600,
      annualTurnoverRate: 0.20, // 20% assumed turnover/new hires
      factors: {
        qualifiedHireRateLow: 0.05,
        qualifiedHireRateHigh: 0.12,
      },
      explanations: {
        eligible: [
          'Based on targeted population hiring signals',
          'Credit varies by hire category ($2,400 - $9,600)',
          'Requires certification documentation per hire',
        ],
        notEligible: [
          'No targeted population hiring reported',
        ],
      },
    },
  },
};

// ============================================
// RULES VERSION REGISTRY (FALLBACK)
// Used when DB is unavailable - prefer DB rules
// ============================================

export const rulesRegistry: Record<string, EstimatorRulesConfig> = {
  '1.0.0': rulesV1_0_0,
};

// Get rules by version (defaults to current) - SYNC version for client-side
export function getRules(version?: string): EstimatorRulesConfig {
  const targetVersion = version || CURRENT_RULES_VERSION;
  const rules = rulesRegistry[targetVersion];
  
  if (!rules) {
    console.warn(`Rules version ${targetVersion} not found, falling back to ${CURRENT_RULES_VERSION}`);
    return rulesRegistry[CURRENT_RULES_VERSION];
  }
  
  return rules;
}

// Get all available rule versions
export function getAvailableVersions(): string[] {
  return Object.keys(rulesRegistry);
}

// ============================================
// DATABASE RULES FETCHER (Server-side only)
// Prefer DB rules over hardcoded registry
// ============================================

import { db } from '@/lib/db';

// Async version for server-side use - fetches from DB
export async function getRulesAsync(version?: string): Promise<EstimatorRulesConfig> {
  try {
    let dbRules;
    
    if (version) {
      // Get specific version from DB
      dbRules = await db.estimatorRules.findUnique({
        where: { version }
      });
    } else {
      // Get active version from DB
      dbRules = await db.estimatorRules.findFirst({
        where: { isActive: true }
      });
    }
    
    if (dbRules && dbRules.rulesConfig) {
      // Parse the DB JSON into our config format
      const config = dbRules.rulesConfig as Partial<EstimatorRulesConfig>;
      return {
        version: dbRules.version,
        effectiveDate: dbRules.effectiveDate.toISOString().split('T')[0],
        description: dbRules.description || '',
        credits: config.credits || rulesV1_0_0.credits,
        employeeRanges: config.employeeRanges || rulesV1_0_0.employeeRanges,
        payrollRanges: config.payrollRanges || rulesV1_0_0.payrollRanges,
      };
    }
  } catch (error) {
    console.warn('Failed to fetch rules from DB, using fallback:', error);
  }
  
  // Fallback to hardcoded rules
  return getRules(version);
}

// Get active rules version from DB
export async function getActiveRulesVersion(): Promise<string> {
  try {
    const activeRules = await db.estimatorRules.findFirst({
      where: { isActive: true },
      select: { version: true }
    });
    
    if (activeRules) {
      return activeRules.version;
    }
  } catch (error) {
    console.warn('Failed to fetch active rules version, using fallback:', error);
  }
  
  return CURRENT_RULES_VERSION;
}
