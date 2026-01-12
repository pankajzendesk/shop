import { getProducts } from '@/app/actions';
import { AdminProductListClient } from './AdminProductListClient';

export const dynamic = 'force-dynamic';

export default async function AdminProductsPage() {
  const products = await getProducts();
  
  return (
    <AdminProductListClient initialProducts={products} />
  );
}
