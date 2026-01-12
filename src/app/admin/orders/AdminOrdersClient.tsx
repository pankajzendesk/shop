'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import Icon from '@/components/ui/AppIcon';
import Notification from '@/components/ui/Notification';
import { updateOrder, getOrders, updateReturnStatus } from '@/app/actions';

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
  items: any; // Json
  total: number;
  status: string;
  date: string | Date;
  carrier?: string | null;
  trackingNumber?: string | null;
  returnStatus?: string | null;
  promoCode?: string | null;
  discountAmount?: number | null;
  returnReason?: string | null;
  returnType?: string | null;
  source?: string | null;
  sourceStaffId?: string | null;
  sourceStaff?: { name: string; lastName?: string } | null;
  assignedDelivery?: { name: string; lastName?: string } | null;
  assignedShipment?: { name: string; lastName?: string } | null;
  failureReason?: string | null;
}

interface AdminOrdersClientProps {
  initialOrders: Order[];
  initialCarriers: string[];
}

export function AdminOrdersClient({ initialOrders, initialCarriers }: Readonly<AdminOrdersClientProps>) {
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [carriers] = useState<string[]>(initialCarriers);
  const [searchTerm, setSearchTerm] = useState('');
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMsg, setNotificationMsg] = useState('');
  
  // Delivery State
  const [trackingModalOrder, setTrackingModalOrder] = useState<Order | null>(null);
  const [deliveryInfo, setDeliveryInfo] = useState({ carrier: 'Self', tracking: '' });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Delivered': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'Delivered to Customer': return 'bg-emerald-500 text-white shadow-sm';
      case 'Cancelled': return 'bg-red-100 text-red-700 border-red-200';
      case 'Returned': return 'bg-rose-100 text-rose-700 border-rose-200';
      case 'Out for Delivery': return 'bg-pink-100 text-pink-700 border-pink-200';
      case 'Shipped': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Picked Carrier': return 'bg-indigo-100 text-indigo-700 border-indigo-200';
      default: return 'bg-amber-100 text-amber-700 border-amber-200';
    }
  };

  const getAttendedByName = (order: any) => {
    if (order.source === 'POS') {
      return order.sourceStaff ? `${order.sourceStaff.name} ${order.sourceStaff.lastName || ''}` : 'Counter Staff';
    }
    return order.assignedShipment ? `${order.assignedShipment.name} ${order.assignedShipment.lastName || ''}` : 'Warehouse Team';
  };

  const getReturnStatusColor = (returnStatus: string, orderStatus: string) => {
    if (returnStatus === 'COMPLETED') {
      return 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20';
    }
    if (returnStatus === 'APPROVED' || orderStatus === 'Return-Processing') {
      return 'bg-blue-500/10 text-blue-500 border border-blue-500/20';
    }
    return 'bg-amber-500/10 text-amber-500 border border-amber-500/20';
  };

  const refreshOrders = async () => {
    try {
      const data = await getOrders();
      setOrders(data as Order[]);
    } catch (error) {
      console.error('Failed to refresh orders:', error);
    }
  };

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    if (newStatus === 'Shipped' || newStatus === 'Picked Carrier') {
      const order = orders.find(o => o.id === orderId);
      if (order) {
        setTrackingModalOrder(order);
        const defaultCarrier = order.carrier || (carriers.length > 0 ? carriers[0] : 'Self');
        setDeliveryInfo({ 
          carrier: defaultCarrier, 
          tracking: order.trackingNumber || `${newStatus.split(' ')[0].toUpperCase()}${Math.floor(Math.random() * 10000000)}` 
        });
        return;
      }
    }

    try {
      await updateOrder(orderId, { status: newStatus });
      await refreshOrders();
      setNotificationMsg(`Order ${orderId.substring(0, 8)} updated to ${newStatus}`);
      setShowNotification(true);
    } catch (error) {
      console.error('Failed to update order:', error);
      setNotificationMsg("Error updating order.");
      setShowNotification(true);
    }
  };

  const handleApproveReturn = async (orderId: string, status: string) => {
    try {
      await updateReturnStatus(orderId, status);
      await refreshOrders();
      setNotificationMsg(`Return ${status.toLowerCase()} for order ${orderId.substring(0, 8)}`);
      setShowNotification(true);
    } catch (error) {
      console.error('Failed to update return status:', error);
      setNotificationMsg("Error updating return status.");
      setShowNotification(true);
    }
  };

  const handleSaveTracking = async () => {
    if (!trackingModalOrder) return;
    
    try {
      await updateOrder(trackingModalOrder.id, { 
        status: 'Shipped', 
        carrier: deliveryInfo.carrier, 
        trackingNumber: deliveryInfo.tracking 
      });
      await refreshOrders();
      setNotificationMsg(`Order ${trackingModalOrder.id.substring(0, 8)} marked as Shipped`);
      setShowNotification(true);
      setTrackingModalOrder(null);
    } catch (error) {
      console.error('Failed to mark as shipped:', error);
    }
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);

  const filteredOrders = useMemo(() => 
    orders.filter(order => 
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerEmail.toLowerCase().includes(searchTerm.toLowerCase())
    ), [orders, searchTerm]
  );

  return (
    <div className="space-y-8">
      <Notification 
        message={notificationMsg} 
        isVisible={showNotification} 
        onClose={() => setShowNotification(false)} 
      />

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="font-heading text-3xl font-bold text-foreground">Order Management</h1>
          <p className="mt-1 text-muted-foreground">Track, manage, and process customer orders in real-time.</p>
        </div>
        <button 
          onClick={refreshOrders}
          className="p-3 rounded-xl border border-border bg-card text-muted-foreground hover:text-primary hover:border-primary/30 transition-smooth shadow-warm-sm"
          title="Refresh Orders"
        >
          <Icon name="ArrowPathIcon" size={20} />
        </button>
      </div>

      {/* Return Requests Alert */}
      {orders.some(o => o.returnStatus === 'PENDING') && (
        <div className="rounded-2xl border border-primary/20 bg-primary/5 p-6 shadow-warm-sm animate-in fade-in slide-in-from-top-4 duration-500">
           <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 bg-primary/20 rounded-xl text-primary shadow-sm border border-primary/20">
                 <Icon name="ArrowPathIcon" size={24} />
              </div>
              <div>
                 <h2 className="font-heading text-lg font-bold text-foreground">Pending Return Requests</h2>
                 <p className="text-sm text-muted-foreground">Customers are waiting for your approval on returns or replacements.</p>
              </div>
           </div>
           
           <div className="space-y-3">
              {orders.filter(o => o.returnStatus === 'PENDING').map(order => (
                 <div key={order.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-card border border-border shadow-sm hover:shadow-md transition-smooth">
                    <div className="flex items-center gap-4">
                       <div className="h-12 w-12 flex items-center justify-center rounded-2xl bg-muted text-muted-foreground font-mono text-xs font-bold ring-1 ring-border/50">
                          #{order.id.substring(0, 4).toUpperCase()}
                       </div>
                       <div>
                          <div className="flex items-center gap-2">
                             <span className="font-bold text-foreground">{order.customerName}</span>
                             <span className="text-[10px] font-black bg-primary/10 text-primary px-3 py-1 rounded-full uppercase tracking-widest border border-primary/10 shadow-sm">{order.returnType}</span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">Reason: <span className="italic font-medium text-foreground/70">"{order.returnReason}"</span></p>
                       </div>
                    </div>
                    <div className="flex gap-2">
                       <button 
                          onClick={() => handleApproveReturn(order.id, 'REJECTED')}
                          className="px-6 py-2.5 text-xs font-bold text-muted-foreground hover:text-error transition-smooth"
                       >
                          Reject Request
                       </button>
                       <button 
                          onClick={() => handleApproveReturn(order.id, 'APPROVED')}
                          className="px-8 py-2.5 bg-primary text-primary-foreground text-xs font-bold rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-0.5 transition-smooth active:translate-y-0"
                       >
                          Approve and Restock
                       </button>
                    </div>
                 </div>
              ))}
           </div>
        </div>
      )}

      <div className="rounded-2xl border border-border bg-card p-4 shadow-warm-sm">
        <div className="relative">
          <Icon name="MagnifyingGlassIcon" size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by Order ID or Customer..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-input bg-background py-3 pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-warm-sm text-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-muted/30 text-xs font-bold uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-6 py-4">Order Details</th>
                <th className="px-6 py-4">Channel</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Logistics Trace</th>
                <th className="px-6 py-4">Total</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredOrders.length > 0 ? (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="group transition-smooth hover:bg-muted/20">
                    <td className="px-6 py-4">
                      <div className="font-bold text-foreground overflow-hidden text-ellipsis max-w-[120px]">{order.id.substring(0, 8)}...</div>
                      <div className="text-[10px] text-muted-foreground font-mono mt-0.5">
                        {new Date(order.date).toLocaleDateString()} at {new Date(order.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                      {order.trackingNumber && (
                        <div className="mt-2 flex items-center gap-1.5 text-[10px] font-bold text-primary uppercase">
                          <Icon name="TruckIcon" size={12} />
                          <span>{order.carrier}: {order.trackingNumber}</span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1.5">
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-widest border transition-colors ${
                          order.source === 'POS' 
                            ? 'bg-amber-50 text-amber-700 border-amber-200 group-hover:bg-amber-100' 
                            : 'bg-blue-50 text-blue-700 border-blue-200 group-hover:bg-blue-100'
                        }`}>
                          <Icon name={order.source === 'POS' ? 'BuildingStorefrontIcon' : 'GlobeAltIcon'} size={12} />
                          {order.source || 'ONLINE'}
                        </span>
                        <div className="flex flex-col mt-1">
                          <span className="text-[9px] text-muted-foreground font-bold uppercase tracking-tighter">Attended By</span>
                          <span className="font-bold text-zinc-700 text-[11px] leading-tight">
                            {getAttendedByName(order)}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-foreground">{order.customerName}</div>
                      <div className="text-[10px] text-muted-foreground">{order.customerEmail}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                          <div className={`h-2 w-2 rounded-full ${order.assignedShipment ? 'bg-amber-500' : 'bg-zinc-700'}`}></div>
                          <div className="flex flex-col">
                            <span className="text-[10px] text-muted-foreground font-bold uppercase">Packer</span>
                            <span className="font-medium text-foreground text-[11px]">
                              {order.assignedShipment ? `${order.assignedShipment.name} ${order.assignedShipment.lastName || ''}` : 'Pending'}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className={`h-2 w-2 rounded-full ${order.assignedDelivery ? 'bg-emerald-500' : 'bg-zinc-700'}`}></div>
                          <div className="flex flex-col">
                            <span className="text-[10px] text-muted-foreground font-bold uppercase">Driver</span>
                            <span className="font-medium text-foreground text-[11px]">
                              {order.assignedDelivery ? `${order.assignedDelivery.name} ${order.assignedDelivery.lastName || ''}` : 'Pending'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono font-bold text-foreground">
                      <div>{formatCurrency(order.total)}</div>
                      {order.promoCode && (
                        <div className="text-[10px] text-emerald-600 flex items-center gap-1 font-bold uppercase mt-1">
                          <Icon name="TagIcon" size={10} />
                          {order.promoCode}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1.5">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                        {order.returnStatus && (
                         <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${getReturnStatusColor(order.returnStatus, order.status)}`}>
                           <Icon name={order.returnStatus === 'COMPLETED' ? 'CheckCircleIcon' : 'ClockIcon'} size={10} />
                           {order.returnStatus === 'COMPLETED' ? 'Refunded' : `Refund: ${order.returnStatus}`}
                         </span>
                        )}
                        {(order.status === 'Cancelled' || order.status === 'Delivery Failed') && order.failureReason && (
                          <span className="text-[10px] text-red-500 italic font-medium px-1 leading-tight">
                            Reason: {order.failureReason}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <select 
                          value={order.status}
                          onChange={(e) => handleUpdateStatus(order.id, e.target.value)}
                          className="rounded-lg border border-input bg-background px-2 py-1 text-xs focus:ring-1 focus:ring-primary/20"
                        >
                          <option value="Pending">Pending</option>
                          <option value="Processing">Processing</option>
                          <option value="Packed">Packed</option>
                          <option value="Shipped">Shipped</option>
                          <option value="Picked Carrier">Picked Carrier</option>
                          <option value="In Transit">In Transit</option>
                          <option value="Out for Delivery">Out for Delivery</option>
                          <option value="Delivered">Delivered</option>
                          <option value="Returned">Returned</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                        <Link 
                          href={`/admin/orders/${order.id}`}
                          className="p-1.5 rounded-lg bg-muted text-muted-foreground transition-smooth hover:bg-primary/10 hover:text-primary inline-flex items-center justify-center"
                          title="View Details"
                         >
                           <Icon name="EyeIcon" size={16} />
                         </Link>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground italic">
                    {orders.length === 0 ? "No orders have been placed yet." : "No orders matching your search."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {trackingModalOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-card p-8 shadow-warm-xl border border-border animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-border pb-4 mb-6">
              <h2 className="font-heading text-xl font-bold text-foreground">Shipment Details</h2>
              <button onClick={() => setTrackingModalOrder(null)} className="text-muted-foreground hover:text-foreground">
                <Icon name="XMarkIcon" size={24} />
              </button>
            </div>

            <div className="space-y-5">
               <div>
                  <label htmlFor="carrier-select" className="mb-1.5 block text-xs font-bold uppercase text-muted-foreground">Carrier</label>
                  <select 
                    id="carrier-select"
                    value={deliveryInfo.carrier}
                    onChange={(e) => setDeliveryInfo({...deliveryInfo, carrier: e.target.value})}
                    className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20"
                  >
                    {carriers.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
               </div>
               <div>
                  <label htmlFor="tracking-input" className="mb-1.5 block text-xs font-bold uppercase text-muted-foreground">Tracking Number</label>
                  <input 
                    id="tracking-input"
                    type="text"
                    value={deliveryInfo.tracking}
                    onChange={(e) => setDeliveryInfo({...deliveryInfo, tracking: e.target.value})}
                    placeholder="Enter tracking ID..."
                    className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20"
                  />
               </div>

               <div className="pt-4 flex gap-3">
                  <button 
                    onClick={() => setTrackingModalOrder(null)}
                    className="flex-1 rounded-xl border border-border py-3 text-sm font-bold text-foreground hover:bg-muted transition-smooth"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleSaveTracking}
                    className="flex-1 rounded-xl bg-primary py-3 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/20 hover:bg-primary/90 transition-smooth"
                  >
                    Confirm Shipment
                  </button>
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
