import type { EstimatorInputs } from './validations';
import { getRules, getRulesAsync, CURRENT_RULES_VERSION, type EstimatorRulesConfig } from './rules/estimator-rules';

// ============================================
// PAYROLL CREDIT ESTIMATION ENGINE v2
// Rule-based, versioned, conservative, auditable
// ============================================

export interface CreditBreakdown {
  min: number;
  max: number;
  eligible: boolean;
  explanations: string[];
}

export interface EstimationResult {
  estimatedMin: number;
  estimatedMax: number;
  creditFlags: ('ERC' | 'TIP' | 'WOTC')[];
  eligibility: 'LOW' | 'MODERATE' | 'STRONG';
  rulesVersion: string;
  breakdown: {
    erc: CreditBreakdown;
    tip: CreditBreakdown;
    wotc: CreditBreakdown;
  };
  explanations: string[];
}

// Internal calculation using pre-fetched rules
function _calculateWithRules(
  inputs: EstimatorInputs,
  rules: EstimatorRulesConfig
): EstimationResult {
  const employeeCount = rules.employeeRanges[inputs.fullTimeEmployees] || 20;
  const annualPayroll = rules.payrollRanges[inputs.annualPayroll] || 1000000;

  const breakdown = {
    erc: calculateERC(inputs, employeeCount, annualPayroll, rules),
    tip: calculateTIP(inputs, employeeCount, rules),
    wotc: calculateWOTC(inputs, employeeCount, rules),
  };

  const creditFlags: ('ERC' | 'TIP' | 'WOTC')[] = [];
  if (breakdown.erc.eligible) creditFlags.push('ERC');
  if (breakdown.tip.eligible) creditFlags.push('TIP');
  if (breakdown.wotc.eligible) creditFlags.push('WOTC');

  const estimatedMin = breakdown.erc.min + breakdown.tip.min + breakdown.wotc.min;
  const estimatedMax = breakdown.erc.max + breakdown.tip.max + breakdown.wotc.max;

  const eligibility = determineEligibility(estimatedMax, creditFlags.length);

  // Compile all explanations
  const explanations = generateExplanations(inputs, creditFlags);

  return {
    estimatedMin: Math.round(estimatedMin),
    estimatedMax: Math.round(estimatedMax),
    creditFlags,
    eligibility,
    rulesVersion: rules.version,
    breakdown,
    explanations,
  };
}

// Sync version - uses hardcoded rules (for client-side)
export function calculateEstimate(
  inputs: EstimatorInputs,
  rulesVersion?: string
): EstimationResult {
  const rules = getRules(rulesVersion);
  return _calculateWithRules(inputs, rules);
}

// Async version - fetches rules from DB (for server-side)
export async function calculateEstimateAsync(
  inputs: EstimatorInputs,
  rulesVersion?: string
): Promise<EstimationResult> {
  const rules = await getRulesAsync(rulesVersion);
  return _calculateWithRules(inputs, rules);
}

function calculateERC(
  inputs: EstimatorInputs,
  employeeCount: number,
  _annualPayroll: number,
  rules: EstimatorRulesConfig
): CreditBreakdown {
  const ercRules = rules.credits.erc;
  
  if (!ercRules.enabled) {
    return { min: 0, max: 0, eligible: false, explanations: ['ERC credit currently disabled'] };
  }

  // ERC eligibility: operational disruption OR government mandates in 2020-2021
  const hasDisruption = inputs.operationalDisruption2020;
  const hasMandates = inputs.governmentMandates;
  const eligible = hasDisruption || hasMandates;
  
  if (!eligible) {
    return { 
      min: 0, 
      max: 0, 
      eligible: false, 
      explanations: ercRules.explanations.notEligible 
    };
  }

  // Determine factors based on qualifiers
  const bothQualifiers = hasDisruption && hasMandates;
  const minFactor = bothQualifiers ? ercRules.factors.bothQualifiersMin : ercRules.factors.conservativeMin;
  const maxFactor = bothQualifiers ? ercRules.factors.bothQualifiersMax : ercRules.factors.conservativeMax;

  const min = employeeCount * ercRules.maxPerEmployee * minFactor;
  const max = employeeCount * ercRules.maxPerEmployee * maxFactor;

  return {
    min: Math.round(min),
    max: Math.round(max),
    eligible: true,
    explanations: ercRules.explanations.eligible,
  };
}

function calculateTIP(
  inputs: EstimatorInputs,
  employeeCount: number,
  rules: EstimatorRulesConfig
): CreditBreakdown {
  const tipRules = rules.credits.tip;
  
  if (!tipRules.enabled) {
    return { min: 0, max: 0, eligible: false, explanations: ['TIP credit currently disabled'] };
  }

  // TIP credit: available for restaurants/hospitality with tipped employees
  const industryEligible = tipRules.eligibleIndustries.includes(inputs.industry);
  const hasTipped = inputs.tippedEmployees;

  if (!industryEligible || !hasTipped) {
    return { 
      min: 0, 
      max: 0, 
      eligible: false, 
      explanations: tipRules.explanations.notEligible 
    };
  }

  // Calculate based on tipped workforce
  const tippedEmployees = employeeCount * tipRules.tippedEmployeeRatio;
  const annualCredit = tippedEmployees * tipRules.avgAnnualTipsPerEmployee * tipRules.ficaRate;

  return {
    min: Math.round(annualCredit * tipRules.factors.conservativeMin),
    max: Math.round(annualCredit * tipRules.factors.conservativeMax),
    eligible: true,
    explanations: tipRules.explanations.eligible,
  };
}

function calculateWOTC(
  inputs: EstimatorInputs,
  employeeCount: number,
  rules: EstimatorRulesConfig
): CreditBreakdown {
  const wotcRules = rules.credits.wotc;
  
  if (!wotcRules.enabled) {
    return { min: 0, max: 0, eligible: false, explanations: ['WOTC credit currently disabled'] };
  }

  if (!inputs.targetedHiring) {
    return { 
      min: 0, 
      max: 0, 
      eligible: false, 
      explanations: wotcRules.explanations.notEligible 
    };
  }

  // Calculate based on estimated qualified hires
  const annualHires = employeeCount * wotcRules.annualTurnoverRate;

  return {
    min: Math.round(annualHires * wotcRules.factors.qualifiedHireRateLow * wotcRules.avgCreditPerHire),
    max: Math.round(annualHires * wotcRules.factors.qualifiedHireRateHigh * wotcRules.avgCreditPerHire),
    eligible: true,
    explanations: wotcRules.explanations.eligible,
  };
}

function determineEligibility(maxEstimate: number, creditCount: number): 'LOW' | 'MODERATE' | 'STRONG' {
  if (maxEstimate >= 100000 && creditCount >= 2) return 'STRONG';
  if (maxEstimate >= 25000 || creditCount >= 1) return 'MODERATE';
  return 'LOW';
}

function generateExplanations(
  inputs: EstimatorInputs,
  creditFlags: ('ERC' | 'TIP' | 'WOTC')[]
): string[] {
  const explanations: string[] = [];

  // Always add methodology note
  explanations.push('Conservative pre-assessment based on self-reported information');

  // Add payroll-based explanation
  explanations.push(`Based on payroll scale: ${inputs.annualPayroll}`);

  // Add industry-specific explanation if TIP eligible
  if (creditFlags.includes('TIP')) {
    explanations.push('Tipped workforce in qualifying industry increases credit exposure');
  }

  // Add hiring-based explanation if WOTC eligible
  if (creditFlags.includes('WOTC')) {
    explanations.push('Targeted hiring signals indicate WOTC opportunity');
  }

  // Add ERC note with appropriate caution
  if (creditFlags.includes('ERC')) {
    explanations.push('ERC eligibility requires detailed verification of 2020-2021 qualifying periods');
  }

  // Add verification note
  explanations.push('Final credit amounts subject to payroll documentation review');

  return explanations;
}

// Re-export for compatibility
export { CURRENT_RULES_VERSION };
