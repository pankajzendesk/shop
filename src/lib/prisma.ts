import { PrismaClient } from '../generated/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

const prismaClientSingleton = () => {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error('DATABASE_URL is not set in environment variables');
  }

  // Connection pool configuration for 1,000-5,000 users
  const pool = new pg.Pool({
    connectionString,
    max: 20, // Maximum pool size (default: 10)
    min: 5, // Minimum pool connections to keep alive
    idleTimeoutMillis: 30000, // Close idle connections after 30 seconds
    connectionTimeoutMillis: 10000, // Wait 10s before timing out when connecting
    maxUses: 7500, // Retire connections after 7,500 uses to prevent memory leaks
    allowExitOnIdle: false, // Keep pool alive even if all connections are idle
  });

  // Log pool errors
  pool.on('error', (err) => {
    console.error('Unexpected error on idle database client', err);
  });

  // Monitor pool metrics (optional but helpful)
  if (process.env.NODE_ENV === 'development') {
    setInterval(() => {
      console.log(`[DB Pool] Total: ${pool.totalCount}, Idle: ${pool.idleCount}, Waiting: ${pool.waitingCount}`);
    }, 60000); // Log every minute in dev
  }

  const adapter = new PrismaPg(pool);
  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development'
      ? ['query', 'error', 'warn']
      : ['error'],
  });
};

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// If you encounter PrismaClientValidationError after schema changes, 
// change the key below (e.g., to prisma_v3) to force a client recreation in dev mode.
const prisma = (globalForPrisma as any).prisma_v3 ?? prismaClientSingleton();

export default prisma;

if (process.env.NODE_ENV !== 'production') (globalForPrisma as any).prisma_v3 = prisma;
