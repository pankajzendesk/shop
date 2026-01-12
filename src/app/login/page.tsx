import { Suspense } from 'react';
import type { Metadata } from 'next';
import LoginInteractive from './components/LoginInteractive';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

const shopName = process.env.NEXT_PUBLIC_SHOP_NAME || 'GiftShop';

export const metadata: Metadata = {
  title: `Login - ${shopName}`,
  description:
    `Sign in to your ${shopName} account to access your orders, wishlist, and personalized shopping experience with exclusive deals on gadgets and toys.`,
};

async function getFeaturedProducts() {
  try {
    return await prisma.product.findMany({
      take: 5,
      where: {
        inStock: true,
      },
      orderBy: {
        rating: 'desc'
      }
    });
  } catch (error) {
    console.error('Failed to fetch featured products for login:', error);
    return [];
  }
}

export default async function LoginPage() {
  const featuredProducts = await getFeaturedProducts();

  return (
          <main className="flex-1">
        <Suspense fallback={<div className="flex h-screen items-center justify-center">Loading...</div>}>
          <LoginInteractive initialFeaturedProducts={featuredProducts} />
        </Suspense>
      </main>
  );
}
