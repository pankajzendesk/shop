import { getCustomers } from '@/app/actions';
import { AdminCustomersClient } from './AdminCustomersClient';

export const dynamic = 'force-dynamic';

export default async function AdminCustomersPage() {
  const customers = await getCustomers();
  
  return (
    <AdminCustomersClient initialCustomers={customers as any} />
  );
}
