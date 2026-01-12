import { getOrders, getCarriers } from '@/app/actions';
import { AdminOrdersClient } from './AdminOrdersClient';

export const dynamic = 'force-dynamic';

export default async function AdminOrdersPage() {
  const [orders, carriers] = await Promise.all([
    getOrders(),
    getCarriers()
  ]);
  
  return (
    <AdminOrdersClient 
      initialOrders={orders} 
      initialCarriers={carriers.map((c: any) => c.name)} 
    />
  );
}
