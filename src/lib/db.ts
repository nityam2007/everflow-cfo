import { PrismaClient } from '@prisma/generated/client';
import { PrismaPg } from '@prisma/adapter-pg';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  // Use direct postgres URL for connection
  const connectionString = process.env.prisma_main_POSTGRES_URL || 
                           process.env.prisma_main_PRISMA_DATABASE_URL || 
                           process.env.prisma_main_DATABASE_URL;
  
  if (!connectionString) {
    throw new Error('Database URL not found in environment variables');
  }

  const adapter = new PrismaPg({
    connectionString,
    // Connection pool settings for better performance
    max: 10, // Max connections in pool
  });
  
  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });
}

export const db = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db;
