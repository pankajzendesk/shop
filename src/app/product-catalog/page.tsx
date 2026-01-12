import type { Metadata } from 'next';
import { Suspense } from 'react';
import HeaderWithCart from '@/components/common/HeaderWithCart';
import ProductCatalogInteractive from './components/ProductCatalogInteractive';
import ProductGridSkeleton from './components/ProductGridSkeleton';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

const shopName = process.env.NEXT_PUBLIC_SHOP_NAME || 'GiftShop';

export const metadata: Metadata = {
  title: `Product Catalog - ${shopName}`,
  description:
    'Browse our extensive collection of gadgets and toys across multiple categories. Filter by price, brand, age group, and availability to find the perfect products for you.',
};

async function getProducts() {
  try {
    const products = await prisma.product.findMany();
    return products;
  } catch (error) {
    console.error('Failed to fetch products:', error);
    return [];
  }
}

export default async function ProductCatalogPage() {
  const initialProducts = await getProducts();
  
  return (
    <div className="min-h-screen bg-background">
      <HeaderWithCart />
      <Suspense fallback={<ProductGridSkeleton />}>
        <ProductCatalogInteractive initialProducts={initialProducts} />
      </Suspense>
    </div>
  );
}
