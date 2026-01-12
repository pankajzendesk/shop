import type { Metadata } from 'next';
import ProductDetailsClient from '@/app/product-catalog/components/ProductDetailsClient';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

type PageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const product = await prisma.product.findUnique({ where: { id } });
  const shopName = process.env.NEXT_PUBLIC_SHOP_NAME || 'GiftShop';
  
  return {
    title: product ? `${product.name} - ${shopName}` : `Product Details - ${shopName}`,
    description: product?.description || `View details for product ${id}.`,
  };
}

export default async function ProductDetailsPage({ params }: PageProps) {
  const { id } = await params;
  const product = await prisma.product.findUnique({ where: { id } });

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <ProductDetailsClient id={id} initialData={product} />
    </div>
  );
}
