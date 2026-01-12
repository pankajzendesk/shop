'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Icon from '@/components/ui/AppIcon';
import OrderDetailsModal from './OrderDetailsModal';

interface Order {
  id: string;
  orderNumber: string;
  date: string;
  status: string;
  total: number;
  itemCount: number;
  trackingNumber?: string;
  shippingAddress?: string;
  paymentMethod?: string;
  items?: any[];
  statusHistory?: any[];
  deliveryImage?: string;
}

interface OrderHistoryProps {
  orders: Order[];
}

const OrderHistory = ({ orders: initialOrders }: OrderHistoryProps) => {
  const [orders, setOrders] = useState<any[]>(initialOrders || []);
  const [isHydrated, setIsHydrated] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'total'>('date');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  useEffect(() => {
    setIsHydrated(true);
    if (initialOrders) {
      const mapped = initialOrders.map((o: any) => ({
        ...o,
        orderNumber: o.id,
        date: typeof o.date === 'string' ? o.date : o.date.toISOString(),
        status: o.status,
        itemCount: o.items?.length || 0,
      }));
      setOrders(mapped);
    }
  }, [initialOrders]);

  const getStatusColor = (status: string) => {
    const s = status.toLowerCase();
    if (s === 'pending') return 'bg-warning/10 text-warning';
    if (s === 'processing') return 'bg-blue-500/10 text-blue-600';
    if (s === 'packed') return 'bg-orange-500/10 text-orange-600';
    if (s === 'shipped' || s === 'picked carrier') return 'bg-purple-500/10 text-purple-600';
    if (s === 'in transit') return 'bg-indigo-500/10 text-indigo-600';
    if (s === 'out for delivery') return 'bg-pink-500/10 text-pink-600';
    if (s === 'delivered' || s === 'delivered to customer') return 'bg-success/10 text-success';
    return 'bg-error/10 text-error';
  };

  const getStatusIcon = (status: string) => {
    const s = status.toLowerCase();
    if (s === 'pending') return 'ClockIcon';
    if (s === 'processing') return 'CogIcon';
    if (s === 'packed') return 'ArchiveBoxIcon';
    if (s === 'shipped' || s === 'picked carrier' || s === 'in transit') return 'TruckIcon';
    if (s === 'out for delivery') return 'MapPinIcon';
    if (s === 'delivered' || s === 'delivered to customer') return 'CheckCircleIcon';
    return 'XCircleIcon';
  };

  const getStatusLabel = (status: string) => {
    const s = status.toLowerCase();
    // User Perspective mapping
    if (s === 'processing' || s === 'pending') return 'Order Placed';
    if (s === 'packed') return 'Order Packed';
    if (s === 'shipped' || s === 'picked carrier' || s === 'in transit') return 'Order in Transit';
    if (s === 'out for delivery') return 'Out for Delivery';
    if (s === 'delivered' || s === 'delivered to customer') return 'Delivered';
    if (s === 'cancelled') return 'Order Cancelled';
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const filteredOrders = orders
    .filter((order) => filterStatus === 'all' || order.status === filterStatus)
    .sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      }
      return b.total - a.total;
    });

  if (!isHydrated) return null;

  return (
    <div className="rounded-lg bg-card p-6 shadow-warm-md">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h2 className="font-heading text-2xl font-semibold text-card-foreground">Order History</h2>

        <div className="flex flex-wrap gap-3">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="rounded-lg border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-smooth focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="all">All Orders</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="packed">Packed</option>
            <option value="shipped">Shipped</option>
            <option value="in transit">In Transit</option>
            <option value="out for delivery">Out for Delivery</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'date' | 'total')}
            className="rounded-lg border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-smooth focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="date">Sort by Date</option>
            <option value="total">Sort by Total</option>
          </select>
        </div>
      </div>

      {filteredOrders.length === 0 ? (
        <div className="py-12 text-center">
          <Icon name="ShoppingBagIcon" size={48} className="mx-auto mb-4 text-muted-foreground" />
          <p className="text-lg font-medium text-card-foreground">No orders found</p>
          <p className="mt-2 text-sm text-muted-foreground">
            {filterStatus === 'all'
              ? 'Start shopping to see your orders here'
              : `No ${filterStatus} orders`}
          </p>
          <Link
            href="/product-catalog"
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 font-medium text-primary-foreground transition-smooth hover:bg-primary/90"
          >
            <span>Browse Products</span>
            <Icon name="ArrowRightIcon" size={16} />
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <div
              key={order.id}
              className="flex flex-col gap-4 rounded-lg border border-border p-4 transition-smooth hover:shadow-warm-sm md:flex-row md:items-center md:justify-between"
            >
              <div className="flex-1">
                <div className="mb-2 flex items-center gap-3">
                  <p className="font-mono text-lg font-semibold text-card-foreground">
                    #{order.orderNumber}
                  </p>
                  <span
                    className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${getStatusColor(
                      order.status
                    )}`}
                  >
                    <Icon name={getStatusIcon(order.status) as any} size={14} />
                    {getStatusLabel(order.status)}
                  </span>
                </div>
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <Icon name="CalendarIcon" size={16} />
                    <span>{order.date}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Icon name="CubeIcon" size={16} />
                    <span>
                      {order.itemCount} {order.itemCount === 1 ? 'item' : 'items'}
                    </span>
                  </div>
                  {order.trackingNumber && (
                    <div className="flex items-center gap-1.5">
                      <Icon name="TruckIcon" size={16} />
                      <span>Tracking: {order.trackingNumber}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Total</p>
                  <p className="font-mono text-xl font-bold text-primary">
                    {formatPrice(order.total)}
                  </p>
                </div>
                <button 
                  onClick={() => setSelectedOrder(order)}
                  className="flex items-center gap-2 rounded-lg bg-muted px-4 py-2 font-medium text-foreground transition-smooth hover:bg-muted/80"
                >
                  <span>View Details</span>
                  <Icon name="ArrowRightIcon" size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedOrder && (
        <OrderDetailsModal 
          order={selectedOrder} 
          onClose={() => setSelectedOrder(null)} 
        />
      )}
    </div>
  );
};

export default OrderHistory;
