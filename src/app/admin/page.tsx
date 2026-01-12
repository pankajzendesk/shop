import { getDashboardStats } from '@/app/actions';
import { AdminDashboardClient } from './AdminDashboardClient';

export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
  const stats = await getDashboardStats();
  
  return (
    <AdminDashboardClient stats={stats} />
  );
}
