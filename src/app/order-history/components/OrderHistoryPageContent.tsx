'use client';

import Link from 'next/link';
import HeaderWithCart from '@/components/common/HeaderWithCart';
import Icon from '@/components/ui/AppIcon';
import OrderHistory from '@/app/account-dashboard/components/OrderHistory';

type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export type OrderHistoryOrder = {
  id: string;
  orderNumber: string;
  date: string;
  status: OrderStatus;
  total: number;
  itemCount: number;
  trackingNumber?: string;
};

interface OrderHistoryPageContentProps {
  orders: OrderHistoryOrder[];
}

export default function OrderHistoryPageContent({
  orders,
}: Readonly<OrderHistoryPageContentProps>) {
  return (
    <div className="min-h-screen bg-background">
      <HeaderWithCart />

      <main className="mx-auto max-w-[1440px] px-6 py-8">
        <div className="mb-6 flex items-center gap-3 text-sm text-muted-foreground">
          <Link href="/account-dashboard" className="transition-smooth hover:text-foreground">
            Account
          </Link>
          <Icon name="ChevronRightIcon" size={16} />
          <span className="text-foreground">Order History</span>
        </div>

        <OrderHistory orders={orders as any} />
      </main>
    </div>
  );
}
