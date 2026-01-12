import { getOrder } from '@/app/actions';
import { notFound } from 'next/navigation';
import { AdminOrderDetailClient } from './AdminOrderDetailClient';

export const dynamic = 'force-dynamic';

export default async function OrderDetailsPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const order = await getOrder(id);

  if (!order) {
    notFound();
  }

  return (
    <AdminOrderDetailClient order={order as any} />
  );
}
