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

  // Create demo partner with password
  const partnerPassword = await bcrypt.hash('partner123', 12);
  const partner = await prisma.partner.upsert({
    where: { email: 'partner@payrollpro.com' },
    update: {},
    create: {
      name: 'John Smith',
      companyName: 'PayrollPro Solutions',
      email: 'partner@payrollpro.com',
      phone: '555-0200',
      password: partnerPassword,
      isActive: true,
      notes: 'Demo partner account for testing',
    },
  });
  console.log('✅ Created demo partner:', partner.email);

  // Create client accounts (form submitters with login access)
  const clientPassword = await bcrypt.hash('client123', 12);
  const clientPartners = [
    {
      name: 'Michael Chen',
      companyName: 'Oceanview Restaurant Group',
      email: 'mchen@oceanview.com',
      phone: '555-0101',
      password: clientPassword,
    },
    {
      name: 'Sarah Williams', 
      companyName: 'Harbor Hotel & Spa',
      email: 'swilliams@harborhotel.com',
      phone: '555-0102',
      password: clientPassword,
    },
    {
      name: 'Robert Martinez',
      companyName: 'Sunset Diner',
      email: 'rmartinez@sunsetdiner.com',
      phone: '555-0103',
      password: clientPassword,
    },
    {
      name: 'Lisa Thompson',
      companyName: 'Mountain Lodge Resort',
      email: 'lthompson@mountainlodge.com',
      phone: '555-0104',
      password: clientPassword,
    },
    {
      name: 'James Rodriguez',
      companyName: 'City Bistro Group',
      email: 'jrodriguez@citybistro.com',
      phone: '555-0105',
      password: clientPassword,
    },
  ];

  const createdPartners: Record<string, string> = {};
  for (const p of clientPartners) {
    const created = await prisma.partner.upsert({
      where: { email: p.email },
      update: {},
      create: {
        ...p,
        isActive: true,
      },
    });
    createdPartners[p.email] = created.id;
    console.log('✅ Created client partner:', created.email);
  }

  // Create sample leads (each linked to their partner/client)
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
      creditFlags: ['TIP'],
      eligibility: 'STRONG' as const,
      source: 'website',
      status: 'IN_PROGRESS' as const,
      assignedStaffId: staff.id,
      partnerId: createdPartners['mchen@oceanview.com'],
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
      creditFlags: ['TIP', 'WOTC'],
      eligibility: 'STRONG' as const,
      source: 'website',
      status: 'ASSIGNED' as const,
      assignedStaffId: staff.id,
      partnerId: createdPartners['swilliams@harborhotel.com'],
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
      status: 'NEW' as const,
      partnerId: createdPartners['rmartinez@sunsetdiner.com'],
    },
    {
      companyName: 'Mountain Lodge Resort',
      contactName: 'Lisa Thompson',
      email: 'lthompson@mountainlodge.com',
      phone: '555-0104',
      industry: 'Hospitality',
      inputsJson: {
        industry: 'hospitality',
        state: 'CO',
        yearsInOperation: 12,
        fullTimeEmployees: '50-100',
        partTimeEmployees: true,
        tippedEmployees: true,
        annualPayroll: '2000000-5000000',
        operationalDisruption2020: true,
        governmentMandates: true,
        targetedHiring: true,
      },
      estimatedMin: 180000,
      estimatedMax: 320000,
      creditFlags: ['TIP', 'WOTC'],
      eligibility: 'STRONG' as const,
      source: 'referral',
      status: 'CLOSED' as const,
      assignedStaffId: staff.id,
      partnerId: createdPartners['lthompson@mountainlodge.com'],
    },
    {
      companyName: 'City Bistro Group',
      contactName: 'James Rodriguez',
      email: 'jrodriguez@citybistro.com',
      phone: '555-0105',
      industry: 'Restaurant',
      inputsJson: {
        industry: 'restaurant',
        state: 'NY',
        yearsInOperation: 6,
        fullTimeEmployees: '25-50',
        partTimeEmployees: true,
        tippedEmployees: true,
        annualPayroll: '1000000-2000000',
        operationalDisruption2020: true,
        governmentMandates: false,
        targetedHiring: false,
      },
      estimatedMin: 75000,
      estimatedMax: 150000,
      creditFlags: ['TIP'],
      eligibility: 'MODERATE' as const,
      source: 'cold-email',
      status: 'NEW' as const,
      partnerId: createdPartners['jrodriguez@citybistro.com'],
    },
  ];

  for (const leadData of sampleLeads) {
    // Check if lead exists, create if not
    const existingLead = await prisma.lead.findFirst({
      where: { 
        email: leadData.email, 
        companyName: leadData.companyName 
      }
    });
    
    if (existingLead) {
      await prisma.lead.update({
        where: { id: existingLead.id },
        data: {
          status: leadData.status,
          assignedStaffId: leadData.assignedStaffId,
          partnerId: leadData.partnerId,
        },
      });
      console.log('⏭️ Updated existing lead:', leadData.companyName);
    } else {
      await prisma.lead.create({ data: leadData });
      console.log('✅ Created lead:', leadData.companyName);
    }
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
  console.log('   Admin:   admin@everflowcfo.com / admin123');
  console.log('   Staff:   staff@everflowcfo.com / staff123');
  console.log('   Client:  mchen@oceanview.com / client123');
  console.log('   Client:  swilliams@harborhotel.com / client123');
  console.log('   Client:  rmartinez@sunsetdiner.com / client123');
  console.log('   (All clients use password: client123)');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
