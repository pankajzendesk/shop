'use client';

import { useAuth } from '@/app/providers/AuthProvider';
import { useState, useEffect } from 'react';
import { getUserOrders } from '@/app/actions';
import OrderHistoryPageContent from './components/OrderHistoryPageContent';

export default function OrderHistoryPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      if (user?.email) {
        const data = await getUserOrders(user.email);
        setOrders(data as any);
      }
    };
    loadData();
  }, [user?.email]);

  return <OrderHistoryPageContent orders={orders} />;
}
