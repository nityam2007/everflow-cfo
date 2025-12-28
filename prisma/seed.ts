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
      passwordHash: adminPassword,
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
      passwordHash: staffPassword,
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
