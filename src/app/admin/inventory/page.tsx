import { getProducts, getProductCategories, getInventoryLogs } from '@/app/actions';
import InventoryDashboardClient from './InventoryDashboardClient';

export const dynamic = 'force-dynamic';

export default async function InventoryDashboardPage() {
  const [products, categories, logs] = await Promise.all([
    getProducts(),
    getProductCategories(),
    getInventoryLogs()
  ]);

  return (
    <InventoryDashboardClient 
      initialProducts={products} 
      categories={categories} 
      initialLogs={logs}
    />
  );
}
