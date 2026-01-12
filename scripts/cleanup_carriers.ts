import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
import pg from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

dotenv.config();

const connectionString = process.env.DATABASE_URL;
const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Cleaning up carriers...');
  
  // Ensure 'Self' exists
  const self = await prisma.carrier.findUnique({
    where: { name: 'Self' }
  });

  if (!self) {
    console.log('Creating default carrier: Self');
    await prisma.carrier.create({
      data: { name: 'Self' }
    });
  }

  // Delete mock carriers
  const mockCarriers = ['FedEx', 'DHL Express', 'UPS', 'ups', 'fedex', 'dhl'];
  const deleted = await prisma.carrier.deleteMany({
    where: {
      name: {
        in: mockCarriers,
        mode: 'insensitive'
      }
    }
  });

  console.log(`Deleted ${deleted.count} mock carriers.`);
  
  const carriers = await prisma.carrier.findMany();
  console.log('Remaining carriers:', carriers.map(c => c.name));
}

try {
  await main();
} catch (e) {
  console.error(e);
  process.exit(1);
} finally {
  await prisma.$disconnect();
}
