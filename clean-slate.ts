import { PrismaClient } from './src/generated/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';

const connectionString = `${process.env.DATABASE_URL}`;
const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function clearDatabase() {
  console.log('🗑️ Deleting all orders, history, and transactions...');
  await prisma.orderHistory.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  
  console.log('🗑️ Deleting addresses and non-admin users...');
  await prisma.address.deleteMany();
  
  const deletedUsers = await prisma.user.deleteMany({
    where: {
      role: { not: 'admin' }
    }
  });
  console.log(`✅ Deleted ${deletedUsers.count} non-admin users.`);

  console.log('🗑️ Clearing traffic and inventory logs...');
  await prisma.trafficRecord.deleteMany();
  await prisma.inventoryLog.deleteMany();

  console.log('🔄 Resetting coupon usage counts...');
  await prisma.coupon.updateMany({
    data: { usageCount: 0 }
  });

  console.log('🗑️ Clearing all existing products...');
  await prisma.trendingProduct.deleteMany();
  await prisma.product.deleteMany();
}

async function seedCategories() {
  console.log('🌱 Seeding product categories...');
  const categories = ['Educational', 'Gaming', 'Outdoor', 'Gadgets', 'Smart Home', 'STEM', 'Logic Puzzles', 'Mascots', 'Action Toys', 'Developmental'];
  for (const name of categories) {
    await prisma.productCategory.upsert({
      where: { name },
      update: {},
      create: { name }
    });
  }

  console.log('🌱 Seeding navigation categories...');
  const navCategories = [
    { name: 'Electronics', img: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=200&h=200&fit=crop', href: '/product-catalog?category=Gadgets', displayOrder: 1 },
    { name: 'Smart Home', img: 'https://images.unsplash.com/photo-1558002038-1055907df827?w=200&h=200&fit=crop', href: '/product-catalog?category=Smart Home', displayOrder: 2 },
    { name: 'Gaming', img: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=200&h=200&fit=crop', href: '/product-catalog?category=Gaming', displayOrder: 3 },
    { name: 'Education', img: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=200&h=200&fit=crop', href: '/product-catalog?category=Educational', displayOrder: 4 },
    { name: 'Outdoor', img: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=200&h=200&fit=crop', href: '/product-catalog?category=Outdoor', displayOrder: 5 }
  ];

  for (const cat of navCategories) {
    await prisma.navCategory.upsert({
      where: { id: `seed-${cat.name.toLowerCase().replace(' ', '-')}` },
      update: cat,
      create: {
        id: `seed-${cat.name.toLowerCase().replace(' ', '-')}`,
        ...cat
      }
    });
  }
}

async function seedProducts() {
  console.log('🌱 Seeding sample products...');
  const sampleProducts = [
    {
      name: 'Remote Controlled Racing Car',
      price: 2499,
      originalPrice: 3500,
      category: 'Action Toys',
      brand: 'SpeedMaster',
      ageGroup: '8-12 Years',
      image: '/images/products/product-1.jpg',
      quantity: 50,
      description: 'Super fast RC car with 2.4GHz remote control and rechargeable battery.',
      isNew: true,
      discount: 28,
      returnPolicy: '7_DAYS_REPLACEMENT'
    },
    {
      name: 'Educational Building Blocks Set',
      price: 1299,
      originalPrice: 1500,
      category: 'Developmental',
      brand: 'LegoStyle',
      ageGroup: '4-7 Years',
      image: '/images/products/product-2.jpg',
      quantity: 100,
      description: '500 piece building block set to spark creativity and motor skills.',
      returnPolicy: '7_DAYS_REFUND'
    },
    {
      name: 'Soft Plush Teddy Bear',
      price: 899,
      originalPrice: 1200,
      category: 'Mascots',
      brand: 'CuddleMe',
      ageGroup: 'All Ages',
      image: '/images/products/product-3.jpg',
      quantity: 30,
      description: 'Ultra-soft, premium quality plush bear for perfect gifting.',
      discount: 25,
      returnPolicy: 'NONE'
    }
  ];

  for (const p of sampleProducts) {
    await prisma.product.create({ data: p });
  }
  console.log('✅ Sample products seeded.');
}

async function clearDeliveryUploads() {
  const deliveryPath = path.join(process.cwd(), 'public', 'uploads', 'delivery');
  if (!fs.existsSync(deliveryPath)) return;
  
  console.log('🖼️ Cleaning delivery proof images...');
  const files = fs.readdirSync(deliveryPath);
  for (const file of files) {
    if (file !== '.gitkeep') {
      try {
        fs.unlinkSync(path.join(deliveryPath, file));
      } catch (e) {
        console.error(`Failed to delete ${file}:`, e);
      }
    }
  }
}

async function clearProductImages() {
  const productImagesPath = path.join(process.cwd(), 'public', 'images', 'products');
  if (!fs.existsSync(productImagesPath)) return;

  console.log('📦 Cleaning product images (excluding samples)...');
  const files = fs.readdirSync(productImagesPath);
  const preservedProducts = new Set(['product-1.jpg', 'product-2.jpg', 'product-3.jpg', 'product-4.jpg', 'product-5.svg', 'product-6.svg', 'product-7.svg', 'product-8.svg', '.gitkeep']);
  for (const file of files) {
    if (!preservedProducts.has(file)) {
      try {
        fs.unlinkSync(path.join(productImagesPath, file));
      } catch (e) {
        console.error(`Failed to delete ${file}:`, e);
      }
    }
  }
}

async function clearFiles() {
  await clearDeliveryUploads();
  await clearProductImages();
}

async function main() {
  console.log('🧹 Starting Fresh Start (Clean Slate) operation...');

  try {
    await clearDatabase();
    await seedCategories();
    await seedProducts();
    await clearFiles();

    // Verify Admin Account
    const admins = await prisma.user.findMany({ where: { role: 'admin' } });
    if (admins.length === 0) {
       console.log('⚠️ No admin found! Creating default admin...');
       await prisma.user.create({
         data: {
           name: 'System Admin',
           email: 'admin@seller.sh',
           password: 'adminPassword123',
           role: 'admin'
         }
       });
    }

    // Reset Store Settings
    await prisma.storeSettings.upsert({
      where: { id: 'global' },
      update: { requireDeliveryPhoto: false, taxEnabled: false },
      create: { id: 'global', requireDeliveryPhoto: false, taxEnabled: false }
    });

    console.log('\n✨ FRESH START COMPLETE: The app is now in a clean, production-ready state.');
  } catch (error) {
    console.error('❌ Cleanup failed:', error);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

// eslint-disable-next-line
main()
  // eslint-disable-next-line
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
