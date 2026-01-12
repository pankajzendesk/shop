'use client';

import { useState, useEffect } from 'react';
import Icon from '@/components/ui/AppIcon';
import { getOrders, getCarriers, createCarrier, deleteCarrier } from '@/app/actions';

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface Order {
  id: string;
  customerName?: string;
  email?: string;
  items: OrderItem[];
  total: number;
  status: string;
  date: Date | string;
  carrier?: string;
  trackingNumber?: string;
}

export default function AdminDeliveryPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [carriers, setCarriers] = useState<{id: string, name: string}[]>([]);
  const [newCarrierName, setNewCarrierName] = useState('');
  const [isHydrated, setIsHydrated] = useState(false);
  const [filter, setFilter] = useState('All active');
  const [showConfirmModal, setShowConfirmModal] = useState<{type: 'add' | 'remove', name: string} | null>(null);

  const loadData = async () => {
    const [o, c] = await Promise.all([getOrders(), getCarriers()]);
    setOrders(o as any);
    setCarriers(c as any);
  };

  useEffect(() => {
    setIsHydrated(true);
    loadData();
  }, []);

  const handleAddRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCarrierName.trim()) return;
    setShowConfirmModal({ type: 'add', name: newCarrierName });
  };

  const handleRemoveRequest = (name: string) => {
    setShowConfirmModal({ type: 'remove', name });
  };

  const confirmAdd = async () => {
    if (!showConfirmModal) return;
    await createCarrier(showConfirmModal.name);
    setNewCarrierName('');
    setShowConfirmModal(null);
    loadData();
  };

  const confirmRemove = async () => {
    if (!showConfirmModal) return;
    const carrier = carriers.find(c => c.name === showConfirmModal.name);
    if (carrier) {
      await deleteCarrier(carrier.id);
    }
    setShowConfirmModal(null);
    loadData();
  };

  const getStatusColor = (status: string) => {
    if (status === 'Delivered') return 'bg-success/10 text-success';
    if (status === 'Shipped') return 'bg-primary/10 text-primary';
    if (status === 'Processing') return 'bg-warning/10 text-warning';
    return 'bg-muted text-muted-foreground';
  };

  if (!isHydrated) return null;

  const deliveryStats = {
    pending: orders.filter(o => o.status === 'Processing').length,
    shipped: orders.filter(o => o.status === 'Shipped').length,
    delivered: orders.filter(o => o.status === 'Delivered').length,
    cancelled: orders.filter(o => o.status === 'Cancelled').length,
  };

  const filteredOrders = orders.filter(o => {
    if (filter === 'To Ship') return o.status === 'Processing';
    if (filter === 'In Transit') return o.status === 'Shipped';
    if (filter === 'Delivered') return o.status === 'Delivered';
    return o.status !== 'Cancelled';
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-3xl font-bold text-foreground">Delivery Hub</h1>
        <p className="mt-1 text-muted-foreground">Manage logistics, track shipments, and monitor delivery performance.</p>
      </div>

      {/* Logistics Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { id: 'stat-pending', label: 'Pending Shipment', count: deliveryStats.pending, icon: 'ClockIcon', color: 'text-warning bg-warning/10' },
          { id: 'stat-transit', label: 'In Transit', count: deliveryStats.shipped, icon: 'TruckIcon', color: 'text-primary bg-primary/10' },
          { id: 'stat-delivered', label: 'Successful Deliveries', count: deliveryStats.delivered, icon: 'CheckCircleIcon', color: 'text-success bg-success/10' },
          { id: 'stat-cancelled', label: 'Cancelled Orders', count: deliveryStats.cancelled, icon: 'XMarkIcon', color: 'text-destructive bg-destructive/10' }
        ].map((stat) => (
          <div key={stat.id} className="rounded-2xl border border-border bg-card p-5 shadow-warm-sm">
             <div className="flex items-center gap-4">
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${stat.color}`}>
                   <Icon name={stat.icon} size={24} />
                </div>
                <div>
                   <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{stat.label}</p>
                   <h3 className="text-2xl font-bold text-foreground">{stat.count}</h3>
                </div>
             </div>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-border bg-card shadow-warm-sm overflow-hidden">
        <div className="border-b border-border p-4 bg-muted/20 flex flex-wrap gap-2">
           {['All active', 'To Ship', 'In Transit', 'Delivered'].map((f) => (
             <button 
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-lg px-4 py-2 text-xs font-bold uppercase tracking-widest transition-smooth ${
                filter === f ? 'bg-primary text-primary-foreground' : 'bg-card text-muted-foreground hover:bg-muted'
              }`}
             >
                {f}
             </button>
           ))}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/10 text-xs font-bold uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-6 py-4">Order & Customer</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Logistics Info</th>
                <th className="px-6 py-4">Last Update</th>
                <th className="px-6 py-4 text-right">Label</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredOrders.length > 0 ? (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="group hover:bg-muted/20 transition-smooth">
                    <td className="px-6 py-4">
                       <div className="font-bold text-foreground">{order.id}</div>
                       <div className="text-xs text-muted-foreground">{order.customerName}</div>
                    </td>
                    <td className="px-6 py-4">
                       <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${getStatusColor(order.status)}`}>
                         {order.status === 'Processing' ? 'Order Received' : order.status}
                       </span>
                    </td>
                    <td className="px-6 py-4">
                       {order.trackingNumber ? (
                         <div>
                            <div className="text-xs font-bold text-foreground">{order.carrier}</div>
                            <div className="text-[10px] font-mono text-primary select-all">{order.trackingNumber}</div>
                         </div>
                       ) : (
                         <span className="text-xs italic text-muted-foreground">Tracking not assigned</span>
                       )}
                    </td>
                    <td className="px-6 py-4 text-xs text-muted-foreground">
                       {new Date(order.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                       <button className="rounded-lg border border-border p-2 text-muted-foreground hover:bg-primary/10 hover:text-primary transition-smooth" title="Print Shipping Label">
                          <Icon name="PrinterIcon" size={18} />
                       </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                   <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground italic">
                      No orders matching this delivery status.
                   </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
         <div className="rounded-2xl border border-border bg-card p-6 shadow-warm-sm">
            <h3 className="font-heading text-lg font-bold text-foreground mb-4">Carrier Performance</h3>
            <div className="space-y-4">
               {carriers.length > 0 ? carriers.map((c) => (
                 <div key={c.id} className="flex items-center justify-between">
                    <div>
                       <p className="text-sm font-bold text-foreground">{c.name}</p>
                       <p className="text-xs text-muted-foreground">On-time rate: {Math.floor(Math.random() * 10 + 90)}%</p>
                    </div>
                    <div className="text-right">
                       <p className="text-sm font-bold text-primary">{(Math.random() * 2 + 1).toFixed(1)} days</p>
                       <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-tighter">Avg Delivery</p>
                    </div>
                 </div>
               )) : (
                 <p className="text-sm text-muted-foreground italic">No carriers performance data.</p>
               )}
            </div>
         </div>
         <div className="rounded-2xl border border-border bg-primary/5 p-6 shadow-warm-sm flex flex-col items-center justify-center text-center">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
               <Icon name="TruckIcon" size={32} className="text-primary" />
            </div>
            <h3 className="font-heading text-lg font-bold text-foreground mb-1">Logistics Optimization</h3>
            <p className="text-sm text-muted-foreground mb-4">You can save up to 12% on shipping by using pre-negotiated DHL rates.</p>
            <button className="rounded-xl bg-primary px-6 py-2.5 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/20 hover:bg-primary/90 transition-smooth">
               Activate DHL Rates
            </button>
         </div>
      </div>

      {/* Carrier Management Section */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-warm-sm">
         <div className="mb-6">
            <h3 className="font-heading text-xl font-bold text-foreground">Carrier Management</h3>
            <p className="text-sm text-muted-foreground">Add or remove shipping partners available for order fulfillment.</p>
         </div>
         
         <div className="grid gap-8 md:grid-cols-2">
            <div>
               <p id="active-carriers-label" className="mb-2 block text-xs font-bold uppercase text-muted-foreground">Active Carriers</p>
               <div className="flex flex-wrap gap-2" aria-labelledby="active-carriers-label">
                  {carriers.map((carrier) => (
                    <div key={`carrier-${carrier.id}`} className="flex items-center gap-2 rounded-lg bg-muted px-3 py-2 text-sm font-medium text-foreground">
                       <span>{carrier.name}</span>
                       {carrier.name !== 'Self' && (
                         <button 
                          onClick={() => handleRemoveRequest(carrier.name)}
                          className="text-muted-foreground hover:text-error transition-smooth"
                         >
                            <Icon name="XMarkIcon" size={14} />
                         </button>
                       )}
                       {carrier.name === 'Self' && (
                         <span className="text-[10px] font-bold uppercase text-primary bg-primary/10 px-2 py-0.5 rounded-full">Default</span>
                       )}
                    </div>
                  ))}
               </div>
            </div>
            
            <form onSubmit={handleAddRequest} className="space-y-4">
               <div>
                  <label htmlFor="new-carrier-input" className="mb-2 block text-xs font-bold uppercase text-muted-foreground">New Carrier Name</label>
                  <div className="flex gap-2">
                     <input 
                        id="new-carrier-input"
                        type="text"
                        value={newCarrierName}
                        onChange={(e) => setNewCarrierName(e.target.value)}
                        placeholder="e.g. BlueDart, Aramex"
                        className="flex-1 rounded-xl border border-input bg-background px-4 py-2 text-sm focus:ring-2 focus:ring-primary/20"
                     />
                     <button className="rounded-xl bg-secondary px-6 py-2 text-sm font-bold text-secondary-foreground hover:bg-secondary/90 transition-smooth">
                        Add
                     </button>
                  </div>
               </div>
            </form>
         </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl bg-card p-6 shadow-warm-xl border border-border animate-in fade-in zoom-in duration-200">
             <div className="flex h-12 w-12 items-center justify-center rounded-full bg-warning/10 text-warning mb-4">
                <Icon name="ExclamationTriangleIcon" size={24} />
             </div>
             <h3 className="font-heading text-lg font-bold text-foreground mb-2">
                {showConfirmModal.type === 'add' ? 'Add New Carrier?' : 'Remove Carrier?'}
             </h3>
             <p className="text-sm text-muted-foreground mb-6">
                {showConfirmModal.type === 'add' 
                  ? `Are you sure you want to add "${showConfirmModal.name}" as a shipping partner?`
                  : `Are you sure you want to remove "${showConfirmModal.name}"? This will hide it from new fulfillment options.`}
             </p>
             <div className="flex gap-3">
                <button 
                  onClick={() => setShowConfirmModal(null)}
                  className="flex-1 rounded-xl border border-border py-2.5 text-xs font-bold text-foreground hover:bg-muted"
                >
                   Cancel
                </button>
                <button 
                  onClick={showConfirmModal.type === 'add' ? confirmAdd : confirmRemove}
                  className={`flex-1 rounded-xl py-2.5 text-xs font-bold text-white shadow-lg transition-smooth ${
                    showConfirmModal.type === 'add' ? 'bg-primary shadow-primary/20 hover:bg-primary/90' : 'bg-error shadow-error/20 hover:bg-error/90'
                  }`}
                >
                   {showConfirmModal.type === 'add' ? 'Yes, Add it' : 'Yes, Remove it'}
                </button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
}
