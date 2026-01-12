import { getProducts, getDashboardStats } from '@/app/actions';
import { ShopkeeperDashboardClient } from './ShopkeeperDashboardClient';

export const dynamic = 'force-dynamic';

export default async function ShopkeeperDashboard() {
  const products = await getProducts();
  const stats = await getDashboardStats();

  return (
    <ShopkeeperDashboardClient 
      initialProducts={products} 
      stats={stats}
    />
  );
}
