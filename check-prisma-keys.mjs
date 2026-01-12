import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
console.log('Keys:', Object.keys(prisma).filter(k => k.toLowerCase().includes('order')));
process.exit(0);
