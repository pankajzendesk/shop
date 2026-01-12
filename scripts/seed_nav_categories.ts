import { PrismaClient } from '../src/generated/client';
import * as dotenv from 'dotenv';
import pg from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

dotenv.config();

const connectionString = process.env.DATABASE_URL;
const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Seeding Nav Categories...');
  
  const categories = [
    {
      name: 'Electronics',
      img: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=200&h=200&fit=crop',
      href: '/product-catalog?category=Gadgets',
      displayOrder: 1
    },
    {
      name: 'Smart Home',
      img: 'https://images.unsplash.com/photo-1558002038-1055907df827?w=200&h=200&fit=crop',
      href: '/product-catalog?category=Smart Home',
      displayOrder: 2
    },
    {
      name: 'Gaming',
      img: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=200&h=200&fit=crop',
      href: '/product-catalog?category=Gaming',
      displayOrder: 3
    },
    {
      name: 'Education',
      img: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=200&h=200&fit=crop',
      href: '/product-catalog?category=Educational',
      displayOrder: 4
    },
    {
       name: 'Outdoor',
       img: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=200&h=200&fit=crop',
       href: '/product-catalog?category=Outdoor',
       displayOrder: 5
    }
  ];

  for (const cat of categories) {
    await prisma.navCategory.upsert({
      where: { id: `seed-${cat.name.toLowerCase().replace(' ', '-')}` },
      update: cat,
      create: {
        id: `seed-${cat.name.toLowerCase().replace(' ', '-')}`,
        ...cat
      }
    });
  }

  console.log('Nav Categories seeded successfully.');
}

try {
  await main();
} catch (e) {
  console.error(e);
  process.exit(1);
} finally {
  await prisma.$disconnect();
}
