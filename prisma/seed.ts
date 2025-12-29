import { PrismaClient, UserRole } from './generated/prisma/client.js';
import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from 'bcryptjs';

const adapter = new PrismaPg({
  connectionString: process.env.prisma_main_DATABASE_URL,
});
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Seeding database...');

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@everflowcfo.com' },
    update: {},
    create: {   
      name: 'Admin User',
      email: 'admin@everflowcfo.com',
      password: adminPassword,
      role: UserRole.ADMIN,
      isActive: true,
    },
  });
  console.log('✅ Created admin user:', admin.email);

  // Create staff user
  const staffPassword = await bcrypt.hash('staff123', 12);
  const staff = await prisma.user.upsert({
    where: { email: 'staff@everflowcfo.com' },
    update: {},
    create: {
      name: 'Staff Member',
      email: 'staff@everflowcfo.com',
      password: staffPassword,
      role: UserRole.STAFF,
      isActive: true,
    },
  });
  console.log('✅ Created staff user:', staff.email);

  // Create sample leads
  const sampleLeads = [
    {
      companyName: 'Oceanview Restaurant Group',
      contactName: 'Michael Chen',
      email: 'mchen@oceanview.com',
      phone: '555-0101',
      industry: 'Restaurant',
      inputsJson: {
        industry: 'restaurant',
        state: 'CA',
        yearsInOperation: 5,
        fullTimeEmployees: '50-100',
        partTimeEmployees: true,
        tippedEmployees: true,
        annualPayroll: '2000000-5000000',
        operationalDisruption2020: true,
        governmentMandates: true,
        targetedHiring: false,
      },
      estimatedMin: 125000,
      estimatedMax: 275000,
      creditFlags: ['ERC', 'TIP'],
      eligibility: 'STRONG' as const,
      source: 'cold-email-q4',
    },
    {
      companyName: 'Harbor Hotel & Spa',
      contactName: 'Sarah Williams',
      email: 'swilliams@harborhotel.com',
      phone: '555-0102',
      industry: 'Hospitality',
      inputsJson: {
        industry: 'hospitality',
        state: 'FL',
        yearsInOperation: 8,
        fullTimeEmployees: '100-250',
        partTimeEmployees: true,
        tippedEmployees: true,
        annualPayroll: '5000000-10000000',
        operationalDisruption2020: true,
        governmentMandates: true,
        targetedHiring: true,
      },
      estimatedMin: 350000,
      estimatedMax: 650000,
      creditFlags: ['ERC', 'TIP', 'WOTC'],
      eligibility: 'STRONG' as const,
      source: 'cold-email-q4',
    },
    {
      companyName: 'Sunset Diner',
      contactName: 'Robert Martinez',
      email: 'rmartinez@sunsetdiner.com',
      phone: '555-0103',
      industry: 'Restaurant',
      inputsJson: {
        industry: 'restaurant',
        state: 'TX',
        yearsInOperation: 3,
        fullTimeEmployees: '10-25',
        partTimeEmployees: true,
        tippedEmployees: true,
        annualPayroll: '500000-1000000',
        operationalDisruption2020: false,
        governmentMandates: false,
        targetedHiring: false,
      },
      estimatedMin: 15000,
      estimatedMax: 45000,
      creditFlags: ['TIP'],
      eligibility: 'LOW' as const,
      source: 'linkedin-ads',
    },
  ];

  for (const leadData of sampleLeads) {
    const lead = await prisma.lead.create({
      data: leadData,
    });
    console.log('✅ Created lead:', lead.companyName);
  }

  // Create default estimator rules
  const defaultRulesConfig = {
    employeeRanges: {
      '1-10': 5,
      '10-25': 17,
      '25-50': 37,
      '50-100': 75,
      '100-250': 175,
      '250-500': 375,
      '500+': 600,
    },
    payrollRanges: {
      '100000-500000': 300000,
      '500000-1000000': 750000,
      '1000000-2000000': 1500000,
      '2000000-5000000': 3500000,
      '5000000-10000000': 7500000,
      '10000000+': 15000000,
    },
    credits: {
      erc: {
        enabled: true,
        maxPerEmployee: 26000,
        qualifiers: {
          operationalDisruption: true,
          governmentMandates: true,
        },
        factors: {
          conservativeMin: 0.25,
          conservativeMax: 0.45,
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
      tip: {
        enabled: true,
        ficaRate: 0.0765,
        eligibleIndustries: ['restaurant', 'hospitality'],
        avgAnnualTipsPerEmployee: 15000,
        tippedEmployeeRatio: 0.35,
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
      wotc: {
        enabled: true,
        avgCreditPerHire: 4000,
        maxCreditPerHire: 9600,
        annualTurnoverRate: 0.20,
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

  const existingRules = await prisma.estimatorRules.findFirst();
  if (!existingRules) {
    const rules = await prisma.estimatorRules.create({
      data: {
        version: '1.0.0',
        effectiveDate: new Date('2025-12-29'),
        description: 'Initial conservative estimation rules based on statutory limits',
        isActive: true,
        rulesConfig: defaultRulesConfig,
        createdById: admin.id,
      },
    });
    console.log('✅ Created default estimator rules:', rules.version);
  } else {
    console.log('⏭️ Estimator rules already exist, skipping');
  }

  // Create some default site settings
  const defaultSettings = [
    {
      key: 'site_name',
      value: 'EverflowCFO',
      description: 'The name of the site displayed in headers and emails',
      category: 'general',
    },
    {
      key: 'contact_email',
      value: 'support@everflowcfo.com',
      description: 'Primary contact email address',
      category: 'general',
    },
    {
      key: 'minimum_estimate_threshold',
      value: 1000,
      description: 'Minimum estimated credit to qualify as a lead',
      category: 'estimator',
    },
    {
      key: 'default_contingency_fee',
      value: 0.25,
      description: 'Default contingency fee percentage (25%)',
      category: 'estimator',
    },
  ];

  for (const setting of defaultSettings) {
    const existing = await prisma.siteSetting.findUnique({ where: { key: setting.key } });
    if (!existing) {
      await prisma.siteSetting.create({
        data: {
          ...setting,
          updatedById: admin.id,
        },
      });
      console.log('✅ Created setting:', setting.key);
    }
  }

  console.log('');
  console.log('🎉 Seeding complete!');
  console.log('');
  console.log('📧 Login credentials:');
  console.log('   Admin: admin@everflowcfo.com / admin123');
  console.log('   Staff: staff@everflowcfo.com / staff123');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
