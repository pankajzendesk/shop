
import { PrismaClient } from '../src/generated/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import * as dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.DATABASE_URL;
const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

try {
  const userCount = await prisma.user.count();
  const roles = await prisma.user.groupBy({
    by: ['role'],
    _count: {
      role: true,
    },
  });

  const productCount = await prisma.product.count();
  const orderCount = await prisma.order.count();
  const bannerCount = await prisma.banner.count();
  const dealCount = await prisma.deal.count();
  const addressCount = await prisma.address.count();
  const orderItemCount = await prisma.orderItem.count();
  const trafficRecordCount = await prisma.trafficRecord.count();
  const inventoryLogCount = await prisma.inventoryLog.count();

  console.log('--- Database Verification Summary ---');
  console.log(`User Count: ${userCount}`);
  console.log('User Roles Distribution:');
  roles.forEach((r: { role: string; _count: { role: number } }) => {
    console.log(`  - ${r.role}: ${r._count.role}`);
  });
  console.log(`Product Count: ${productCount}`);
  console.log(`Order Count: ${orderCount}`);
  console.log(`Banner Count: ${bannerCount}`);
  console.log(`Deal Count: ${dealCount}`);
  console.log(`Address Count: ${addressCount}`);
  console.log(`OrderItem Count: ${orderItemCount}`);
  console.log(`TrafficRecord Count: ${trafficRecordCount}`);
  console.log(`InventoryLog Count: ${inventoryLogCount}`);
  console.log('------------------------------------');
} catch (error) {
  console.error('Error verifying database:', error);
} finally {
  await prisma.$disconnect();
  await pool.end();
}
