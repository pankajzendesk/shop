import { PrismaClient } from '../generated/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

const prismaClientSingleton = () => {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error('DATABASE_URL is not set in environment variables');
  }
  const pool = new pg.Pool({ connectionString });
  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
};

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// If you encounter PrismaClientValidationError after schema changes, 
// change the key below (e.g., to prisma_v3) to force a client recreation in dev mode.
const prisma = (globalForPrisma as any).prisma_v3 ?? prismaClientSingleton();

export default prisma;

if (process.env.NODE_ENV !== 'production') (globalForPrisma as any).prisma_v3 = prisma;
