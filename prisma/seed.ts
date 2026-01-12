import { PrismaClient } from '../src/generated/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import 'dotenv/config';

const connectionString = `${process.env.DATABASE_URL}`;
const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const MOCK_PRODUCTS = [
  {
    id: '1',
    name: 'Wireless Gaming Headset Pro',
    price: 6499,
    originalPrice: 7999,
    rating: 4.8,
    reviewCount: 128,
    image: '/images/products/product-1.jpg',
    category: 'Gaming',
    brand: 'TechGear',
    ageGroup: '12+',
    inStock: true,
    isNew: true,
    description: 'Ultra-low latency wireless gaming headset with 50mm drivers and a noise-canceling microphone. Perfect for competitive gaming.',
    features: ['5.1 Surround Sound', '40-hour Battery Life', 'Memory Foam Cushions']
  },
  {
    id: '2',
    name: 'Smart Robot Building Kit',
    price: 4999,
    originalPrice: 5999,
    rating: 4.9,
    reviewCount: 85,
    image: '/images/products/product-2.jpg',
    category: 'Educational',
    brand: 'RoboLearn',
    ageGroup: '8-12',
    inStock: true,
    description: 'Build and program your own robot! Includes sensors, motors, and an easy-to-use coding interface for beginners.',
    features: ['100+ Pieces', 'Bluetooth Connectivity', 'Mobile App Support']
  },
  {
    id: '3',
    name: 'Retro Arcade Console',
    price: 12499,
    rating: 4.7,
    reviewCount: 210,
    image: '/images/products/product-3.jpg',
    category: 'Gaming',
    brand: 'SkyFlyer',
    ageGroup: 'All Ages',
    inStock: true,
    description: 'Relive the classics with this retro arcade console. Pre-loaded with over 1000 legendary games from the 80s and 90s.',
    features: ['HDMI Output', 'Two-Player Support', 'Customizable Controls']
  },
  {
    id: '4',
    name: 'Magnetic Building Blocks',
    price: 2499,
    originalPrice: 2999,
    rating: 4.6,
    reviewCount: 342,
    image: '/images/products/product-4.jpg',
    category: 'Educational',
    brand: 'KidsTech',
    ageGroup: '3-7',
    inStock: true,
    isNew: true,
    description: "Let your child's imagination run wild with these colorful magnetic building blocks. Safe, durable, and educational.",
    features: ['72 Colorful Pieces', 'Non-Toxic Material', 'Strong Magnets']
  },
  {
    id: '5',
    name: 'RC Monster Truck 4WD',
    price: 3499,
    rating: 4.5,
    reviewCount: 156,
    image: '/images/products/product-5.svg',
    category: 'Outdoor',
    brand: 'SkyFlyer',
    ageGroup: '8+',
    inStock: true,
    description: 'High-speed 4WD remote control monster truck, capable of handling rough terrains and performing stunts.',
    features: ['High-Torque Motor', '2.4GHz Remote Control', 'Shockproof Suspension']
  },
  {
    id: '6',
    name: 'Crystal Growing Science Kit',
    price: 1299,
    rating: 4.4,
    reviewCount: 224,
    image: '/images/products/product-6.svg',
    category: 'Educational',
    brand: 'RoboLearn',
    ageGroup: '10+',
    inStock: false,
    description: 'Grow your own beautiful crystals at home! This educational kit comes with everything you need for a fun science experiment.',
    features: ['Safe Chemicals', 'Display Case Included', 'Step-by-Step Guide']
  },
  {
    id: '7',
    name: 'DIY Solar Robot 12-in-1',
    price: 1899,
    originalPrice: 2499,
    rating: 4.6,
    reviewCount: 92,
    image: '/images/products/product-7.svg',
    category: 'Educational',
    brand: 'EcoTech',
    ageGroup: '8-12',
    inStock: true,
    isNew: true,
    description: 'Solar powered robot kit that can be built into 12 different styles. No batteries required!',
    features: ['Solar Powered', '12 Build Styles', 'STEM Learning']
  },
  {
    id: '8',
    name: 'Walkie Talkie Set Long Range',
    price: 1599,
    originalPrice: 1999,
    rating: 4.3,
    reviewCount: 115,
    image: '/images/products/product-8.svg',
    category: 'Gadgets',
    brand: 'TechGear',
    ageGroup: '5-12',
    inStock: true,
    description: 'Adventure ready walkie talkies with 3km range and 22 channels. Perfect for camping and outdoor play.',
    features: ['3km Range', 'Backlit LCD', 'Built-in Flashlight']
  }
];

async function main() {
  console.log('Start seeding...');

  // Clean up existing data to avoid unique constraint violations
  console.log('Cleaning up existing data...');
  await prisma.orderHistory.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.trafficRecord.deleteMany();
  await prisma.coupon.deleteMany();
  await prisma.navCategory.deleteMany();
  await prisma.deal.deleteMany();
  await prisma.banner.deleteMany();
  await prisma.experienceTile.deleteMany();
  await prisma.trendingProduct.deleteMany();
  await prisma.inventoryLog.deleteMany();
  await prisma.paymentMethod.deleteMany();
  await prisma.carrier.deleteMany();
  await prisma.productCategory.deleteMany();

  console.log('Seeding product categories...');
  const productCategories = [
    { name: 'Gaming' },
    { name: 'Educational' },
    { name: 'Outdoor' },
    { name: 'Books' },
    { name: 'Art & Craft' },
  ];
  for (const pc of productCategories) {
    await prisma.productCategory.create({ data: pc });
  }
  
  for (const p of MOCK_PRODUCTS) {
    const product = await prisma.product.upsert({
      where: { id: p.id },
      update: {
        name: p.name,
        price: p.price,
        originalPrice: p.originalPrice,
        image: p.image,
        category: p.category,
        description: p.description,
        inStock: p.inStock,
      },
      create: {
        id: p.id,
        name: p.name,
        price: p.price,
        originalPrice: p.originalPrice,
        rating: p.rating,
        reviewCount: p.reviewCount,
        image: p.image,
        alt: p.name,
        category: p.category,
        brand: p.brand,
        ageGroup: p.ageGroup,
        inStock: p.inStock,
        isNew: p.isNew,
        description: p.description,
        features: p.features,
      },
    });
    console.log(`Created product with id: ${product.id}`);
  }
  
  console.log('Seeding users...');
  const users = [
    {
      id: 'user_1',
      name: 'John Doe',
      email: 'john@example.com',
      role: 'user',
    },
    {
      id: 'admin_1',
      name: 'Admin User',
      email: 'admin@toyshop.com',
      role: 'admin',
    }
  ];

  for (const u of users) {
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: u,
    });
    console.log(`Created user with email: ${user.email}`);
  }

  console.log('Seeding banners...');
  const banners = [
    {
      title: 'New Year Mega Sale',
      subtitle: 'Gadgets starting from ₹99',
      image: 'https://images.unsplash.com/photo-1593305841991-05c297ba4575'
    },
    {
      title: 'Advanced Robotics',
      subtitle: 'Up to 30% Off on STEM Kits',
      image: 'https://images.unsplash.com/photo-1511467687858-23d96c32e4ae'
    },
    {
      title: 'Fast & Secure Delivery',
      subtitle: 'Free shipping on orders over ₹500',
      image: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f'
    }
  ];
  for (const b of banners) {
    await prisma.banner.create({ data: b });
  }

  console.log('Seeding deals...');
  const deals = [
    { name: 'Gaming Headsets', price: '6499', image: '/images/products/product-1.jpg', offer: 'From ₹499' },
    { name: 'Smart Robots', price: '4999', image: '/images/products/product-2.jpg', offer: 'Min 20% Off' },
    { name: 'RC Drones', price: '12499', image: '/images/products/product-3.jpg', offer: 'Best Selling' },
    { name: 'STEM Kits', price: '1299', image: '/images/products/product-6.svg', offer: 'Hot Deal' },
  ];
  for (const d of deals) {
    await prisma.deal.create({ data: d });
  }

  console.log('Seeding categories...');
  const navCategories = [
    { name: 'Latest Gadgets', img: 'https://images.unsplash.com/photo-1550009158-9ebf69173e03', href: '/product-catalog?category=Gaming', displayOrder: 1 },
    { name: 'Educational', img: 'https://images.unsplash.com/photo-1587654780291-39c9404d746b', href: '/product-catalog?category=Educational', displayOrder: 2 },
    { name: 'Outdoor', img: 'https://images.unsplash.com/photo-1506157786151-b8491531f063', href: '/product-catalog?category=Outdoor', displayOrder: 3 },
    { name: 'New Arrivals', img: 'https://images.unsplash.com/photo-1627384113743-6bd5a479fffd', href: '/product-catalog?isNew=true', displayOrder: 4 },
  ];
  for (const nc of navCategories) {
    await prisma.navCategory.create({ data: nc });
  }

  console.log('Seeding coupons...');
  const coupons = [
    { code: 'WELCOME2026', discount: 10, type: 'percentage', expiry: new Date('2026-12-31'), status: 'Active' },
    { code: 'GAPTOP30', discount: 30, type: 'percentage', expiry: new Date('2026-06-30'), status: 'Active' },
  ];
  for (const c of coupons) {
    await prisma.coupon.create({ data: c });
  }

  console.log('Seeding traffic records...');
  const trafficData = [
    { path: '/', country: 'India', city: 'Mumbai', device: 'Desktop', ip: '192.168.1.1' },
    { path: '/product-catalog', country: 'India', city: 'Delhi', device: 'Mobile', ip: '192.168.1.2' },
    { path: '/products/1', country: 'USA', city: 'New York', device: 'Desktop', ip: '1.2.3.4' },
    { path: '/', country: 'India', city: 'Bangalore', device: 'Mobile', ip: '192.168.1.3' },
    { path: '/shopping-cart', country: 'UK', city: 'London', device: 'Desktop', ip: '5.6.7.8' },
  ];
  for (const t of trafficData) {
    await prisma.trafficRecord.create({
      data: {
        ...t,
        timestamp: new Date(Date.now() - Math.random() * 86400000), // Within last 24h
        userAgent: 'Mozilla/5.0'
      }
    });
  }

  console.log('Seeding orders...');
  const statuses = ['Pending', 'Processing', 'Shipped', 'Out for Delivery', 'Delivered', 'Returned'];
  for (let i = 0; i < 20; i++) {
    const randomDays = Math.floor(Math.random() * 10);
    const createdAt = new Date();
    createdAt.setDate(createdAt.getDate() - randomDays);
    
    const order = await prisma.order.create({
      data: {
        customerName: `Customer ${i + 1}`,
        email: `customer${i + 1}@example.com`,
        total: Math.floor(Math.random() * 20000) + 500,
        status: statuses[Math.floor(Math.random() * statuses.length)],
        shippingAddress: '123 Test Street, Mumbai, 400001, India',
        paymentMethod: 'Credit Card',
        createdAt: createdAt,
        date: createdAt,
      }
    });
    
    // Create status history for the order
    await prisma.orderHistory.create({
      data: {
        orderId: order.id,
        status: order.status,
        timestamp: createdAt,
        note: 'Order seeded systematically'
      }
    });
  }
  
  console.log('Seeding finished.');
}

// eslint-disable-next-line
main()
  // eslint-disable-next-line
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  // eslint-disable-next-line
  .finally(async () => {
    await prisma.$disconnect();
  });
