
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

try {
  console.log('--- Prisma Model Names ---');
  console.log(Object.keys(prisma).filter(k => !k.startsWith('_')));
  
  // @ts-ignore
  const orderFields = Object.keys(prisma.order.fields || {});
  console.log('--- Order Model Fields ---');
  console.log(orderFields);
  
  process.exit(0);
} catch (err) {
  console.error(err);
  process.exit(1);
}
