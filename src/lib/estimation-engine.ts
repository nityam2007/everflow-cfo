import type { EstimatorInputs } from './validations';

// ============================================
// PAYROLL CREDIT ESTIMATION ENGINE
// Rule-based, conservative, statutory-capped
// ============================================

export interface EstimationResult {
  estimatedMin: number;
  estimatedMax: number;
  creditFlags: ('ERC' | 'TIP' | 'WOTC')[];
  eligibility: 'LOW' | 'MODERATE' | 'STRONG';
  breakdown: {
    erc: { min: number; max: number; eligible: boolean };
    tip: { min: number; max: number; eligible: boolean };
    wotc: { min: number; max: number; eligible: boolean };
  };
}

// Employee count midpoints for ranges
const employeeCountMap: Record<string, number> = {
  '1-10': 5,
  '10-25': 17,
  '25-50': 37,
  '50-100': 75,
  '100-250': 175,
  '250-500': 375,
  '500+': 600,
};

// Payroll midpoints for ranges
const payrollMap: Record<string, number> = {
  '100000-500000': 300000,
  '500000-1000000': 750000,
  '1000000-2000000': 1500000,
  '2000000-5000000': 3500000,
  '5000000-10000000': 7500000,
  '10000000+': 15000000,
};

// Industries eligible for TIP credit
const tipEligibleIndustries = ['restaurant', 'hospitality'];

export function calculateEstimate(inputs: EstimatorInputs): EstimationResult {
  const employeeCount = employeeCountMap[inputs.fullTimeEmployees] || 20;
  const annualPayroll = payrollMap[inputs.annualPayroll] || 1000000;

  const breakdown = {
    erc: calculateERC(inputs, employeeCount, annualPayroll),
    tip: calculateTIP(inputs, employeeCount),
    wotc: calculateWOTC(inputs, employeeCount),
  };

  const creditFlags: ('ERC' | 'TIP' | 'WOTC')[] = [];
  if (breakdown.erc.eligible) creditFlags.push('ERC');
  if (breakdown.tip.eligible) creditFlags.push('TIP');
  if (breakdown.wotc.eligible) creditFlags.push('WOTC');

  const estimatedMin = breakdown.erc.min + breakdown.tip.min + breakdown.wotc.min;
  const estimatedMax = breakdown.erc.max + breakdown.tip.max + breakdown.wotc.max;

  const eligibility = determineEligibility(estimatedMax, creditFlags.length);

  return {
    estimatedMin: Math.round(estimatedMin),
    estimatedMax: Math.round(estimatedMax),
    creditFlags,
    eligibility,
    breakdown,
  };
}

function calculateERC(
  inputs: EstimatorInputs,
  employeeCount: number,
  _annualPayroll: number
): { min: number; max: number; eligible: boolean } {
  // ERC eligibility: operational disruption OR government mandates in 2020-2021
  const eligible = inputs.operationalDisruption2020 || inputs.governmentMandates;
  
  if (!eligible) {
    return { min: 0, max: 0, eligible: false };
  }

  // ERC caps: $5,000 per employee for 2020, $7,000 per quarter (3 quarters) for 2021
  // Max per employee: $5,000 + $21,000 = $26,000
  // Using conservative factors (0.3 to 0.6 of theoretical max)
  
  const maxPerEmployee = 26000;
  const conservativeFactor = inputs.operationalDisruption2020 && inputs.governmentMandates ? 0.5 : 0.3;
  const highFactor = inputs.operationalDisruption2020 && inputs.governmentMandates ? 0.7 : 0.5;

  const min = employeeCount * maxPerEmployee * conservativeFactor;
  const max = employeeCount * maxPerEmployee * highFactor;

  return {
    min: Math.round(min),
    max: Math.round(max),
    eligible: true,
  };
}

function calculateTIP(
  inputs: EstimatorInputs,
  employeeCount: number
): { min: number; max: number; eligible: boolean } {
  // TIP credit: available for restaurants/hospitality with tipped employees
  const industryEligible = tipEligibleIndustries.includes(inputs.industry);
  const hasTipped = inputs.tippedEmployees;

  if (!industryEligible || !hasTipped) {
    return { min: 0, max: 0, eligible: false };
  }

  // FICA TIP credit: ~7.65% of tips over minimum wage
  // Assume 30% of employees are tipped, average $15k/year in tips
  const tippedRatio = 0.3;
  const avgAnnualTips = 15000;
  const ficaRate = 0.0765;

  const tippedEmployees = employeeCount * tippedRatio;
  const annualCredit = tippedEmployees * avgAnnualTips * ficaRate;

  // Apply conservative range (0.6 to 0.9)
  return {
    min: Math.round(annualCredit * 0.6),
    max: Math.round(annualCredit * 0.9),
    eligible: true,
  };
}

function calculateWOTC(
  inputs: EstimatorInputs,
  employeeCount: number
): { min: number; max: number; eligible: boolean } {
  // WOTC: available if hiring from targeted populations
  if (!inputs.targetedHiring) {
    return { min: 0, max: 0, eligible: false };
  }

  // WOTC: $2,400 to $9,600 per qualified hire
  // Assume 5-15% of hires qualify
  const avgCreditPerHire = 4000;
  const qualifiedHireRateLow = 0.05;
  const qualifiedHireRateHigh = 0.12;

  // Assume 20% annual turnover = new hires
  const annualHires = employeeCount * 0.2;

  return {
    min: Math.round(annualHires * qualifiedHireRateLow * avgCreditPerHire),
    max: Math.round(annualHires * qualifiedHireRateHigh * avgCreditPerHire),
    eligible: true,
  };
}

function determineEligibility(maxEstimate: number, creditCount: number): 'LOW' | 'MODERATE' | 'STRONG' {
  if (maxEstimate >= 100000 && creditCount >= 2) return 'STRONG';
  if (maxEstimate >= 25000 || creditCount >= 1) return 'MODERATE';
  return 'LOW';
}
