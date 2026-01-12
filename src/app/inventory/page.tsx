// Actually I'll use the existing pattern from other pages
import prisma from '@/lib/prisma';
import { InventoryDashboardClient } from './InventoryDashboardClient';

export const dynamic = 'force-dynamic';

export default async function InventoryPage() {
  let products = [];
  try {
    products = await prisma.product.findMany({
      orderBy: { quantity: 'asc' }
    });
  } catch (error) {
    console.error('Failed to fetch inventory products during build/render:', error);
  }

  const totalProducts = products.length;
  const lowStockCount = products.filter((p: any) => p.quantity < 10).length;
  const totalValue = products.reduce((acc: number, p: any) => acc + (p.price * p.quantity), 0);
  const avgPrice = products.length > 0 ? products.reduce((acc: number, p: any) => acc + p.price, 0) / products.length : 0;

  const stats = {
    totalProducts,
    lowStockCount,
    totalValue,
    avgPrice,
  };

  return (
    <div className="min-h-screen bg-white">
      <InventoryDashboardClient initialProducts={products} stats={stats} />
    </div>
  );
}
