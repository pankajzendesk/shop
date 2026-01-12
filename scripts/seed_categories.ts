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
  console.log('Seeding categories...');
  
  const categories = [
    'Educational',
    'Gaming',
    'Outdoor',
    'Gadgets',
    'Smart Home',
    'STEM',
    'Logic Puzzles'
  ];

  for (const name of categories) {
    await prisma.productCategory.upsert({
      where: { name },
      update: {},
      create: { name }
    });
  }

  console.log('Categories seeded successfully.');
}

try {
  await main();
} catch (e) {
  console.error(e);
  process.exit(1);
} finally {
  await prisma.$disconnect();
}
