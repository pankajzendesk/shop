'use client';

import { useState } from 'react';
import Icon from '@/components/ui/AppIcon';
import Link from 'next/link';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
  Cell
} from 'recharts';

 interface AdminDashboardClientProps {
  readonly stats: any;
}

const getStaffBadgeColor = (idx: number) => {
  if (idx === 0) return 'bg-amber-500 text-white';
  if (idx === 1) return 'bg-zinc-300 text-zinc-700';
  return 'bg-orange-100 text-orange-700';
};

export function AdminDashboardClient({ stats: initialStats }: AdminDashboardClientProps) {
  const [timeRange, setTimeRange] = useState<'day' | 'week' | 'month' | 'year'>('week');

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);

  const getOrderStatusColor = (status: string) => {
    switch (status) {
      case 'Delivered': return 'bg-success/10 text-success';
      case 'Shipped': return 'bg-primary/10 text-primary';
      case 'Out for Delivery': return 'bg-pink-500/10 text-pink-600';
      case 'In Transit': return 'bg-indigo-500/10 text-indigo-600';
      case 'Processing': return 'bg-warning/10 text-warning';
      case 'Pending': return 'bg-muted text-muted-foreground';
      case 'Returned': return 'bg-rose-500/10 text-rose-600';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const fulfillmentStats = [
    { label: 'Order Received', value: initialStats.statusCounts?.received || 0, icon: 'InboxArrowDownIcon', color: 'text-zinc-600', bgColor: 'bg-zinc-50' },
    { label: 'Packed', value: initialStats.statusCounts?.packed || 0, icon: 'ArchiveBoxIcon', color: 'text-amber-600', bgColor: 'bg-amber-50' },
    { label: 'In Transit', value: initialStats.statusCounts?.inTransit || 0, icon: 'TruckIcon', color: 'text-blue-600', bgColor: 'bg-blue-50' },
    { label: 'Out for Delivery', value: initialStats.statusCounts?.outForDelivery || 0, icon: 'ShoppingBagIcon', color: 'text-pink-600', bgColor: 'bg-pink-50' },
    { label: 'Delivered', value: initialStats.statusCounts?.delivered || 0, icon: 'CheckCircleIcon', color: 'text-emerald-600', bgColor: 'bg-emerald-50' },
    { label: 'Failed', value: initialStats.statusCounts?.deliveryFailed || 0, icon: 'ExclamationTriangleIcon', color: 'text-red-700', bgColor: 'bg-red-50' },
    { label: 'Refund Pending', value: initialStats.statusCounts?.pendingRefunds || 0, icon: 'ArrowPathIcon', color: 'text-orange-600', bgColor: 'bg-orange-50' },
    { label: 'Refunded', value: initialStats.statusCounts?.completedRefunds || 0, icon: 'CheckBadgeIcon', color: 'text-indigo-600', bgColor: 'bg-indigo-50' },
  ];

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground tracking-tight md:text-4xl">Store Overview</h1>
          <p className="mt-1 text-sm text-muted-foreground md:text-base">Manage your Indian shop's performance and inventory.</p>
        </div>
      </div>

      {/* Primary Stats */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {[
          { label: 'Total Revenue', value: formatCurrency(initialStats.revenue), icon: 'CurrencyRupeeIcon', color: 'bg-emerald-500' },
          { label: 'Counter Sales', value: formatCurrency(initialStats.posRevenue || 0), icon: 'BuildingStorefrontIcon', color: 'bg-amber-500' },
          { label: 'All Orders', value: initialStats.orders, icon: 'ShoppingBagIcon', color: 'bg-indigo-500' },
          { label: 'Total Visits', value: initialStats.totalVisits || 0, icon: 'ChartBarIcon', color: 'bg-blue-500' },
          { label: 'Unique Visitors', value: initialStats.uniqueVisitors || 0, icon: 'FingerPrintIcon', color: 'bg-purple-500' },
          { label: 'Active Now', value: initialStats.activeNow, icon: 'GlobeAltIcon', color: 'bg-sky-500' },
        ].map((stat: any) => (
          <Link 
            key={stat.label} 
            href={stat.href || '#'}
            className="group relative overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-warm-sm transition-smooth hover:border-primary/20 hover:shadow-warm-md hover:-translate-y-1"
          >
            <div className={`absolute -right-4 -top-4 h-24 w-24 rounded-full opacity-5 transition-smooth group-hover:scale-150 ${stat.color}`}></div>
            <div className="flex items-center gap-4">
              <div className={`rounded-xl p-3 text-white shadow-lg ${stat.color}`}>
                <Icon name={stat.icon} size={24} />
              </div>
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{stat.label}</div>
                <div className="mt-1 text-2xl font-bold text-foreground">{stat.value}</div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Fulfillment Overview */}
      <div className="space-y-4">
        <h2 className="font-heading text-xl font-bold text-foreground px-2">Order Fulfillment</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8">
           {fulfillmentStats.map((item) => (
             <div key={item.label} className="rounded-2xl border border-border bg-card p-5 shadow-warm-sm flex items-center gap-4">
                <div className={`rounded-xl p-3 ${item.bgColor} ${item.color}`}>
                   <Icon name={item.icon as any} size={20} />
                </div>
                <div>
                   <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{item.label}</div>
                   <div className="text-xl font-black text-foreground">{item.value}</div>
                </div>
             </div>
           ))}
        </div>
      </div>

      {/* Staff Performance Section */}
      {initialStats.staffPerformance && initialStats.staffPerformance.length > 0 && (
        <div className="space-y-4">
          <h2 className="font-heading text-xl font-bold text-foreground px-2">Staff Sales Performance</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {initialStats.staffPerformance.map((staff: any) => (
              <div key={staff.staffId} className="rounded-2xl border border-border bg-card p-5 shadow-warm-sm">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 font-bold text-sm">
                      {staff.name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-bold text-foreground text-sm leading-tight">{staff.name}</div>
                      <div className="text-[10px] text-muted-foreground uppercase font-black">Counter Staff</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-md font-black text-foreground">{formatCurrency(staff.revenue || 0)}</div>
                    <div className="text-[10px] text-muted-foreground font-black">{staff.orderCount || 0} Orders</div>
                  </div>
                </div>
                <div className="w-full bg-muted/50 rounded-full h-1.5 overflow-hidden">
                  <div 
                    className="bg-purple-500 h-full rounded-full transition-all duration-1000" 
                    style={{ width: `${Math.min(100, ((staff.revenue || 0) / (initialStats.posRevenue || 1)) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
         {/* Internal Logistics & Staff Team Widget */}
         <div className="rounded-2xl border border-border bg-card p-6 shadow-warm-sm lg:col-span-1">
            <div className="mb-6 flex items-center justify-between">
               <h2 className="font-heading text-lg font-bold text-foreground">Personnel Oversight</h2>
               <Link href="/admin/staff" className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline">Manage Team</Link>
            </div>
            
            <div className="grid grid-cols-1 gap-3">
               <div className="p-3 rounded-xl bg-blue-500/5 border border-blue-500/10 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                     <div className="h-9 w-9 rounded-lg bg-blue-500/10 text-blue-600 flex items-center justify-center">
                        <Icon name="ArchiveBoxIcon" size={18} />
                     </div>
                     <div>
                        <div className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Packers & Shippers</div>
                        <div className="text-[10px] font-bold text-foreground">Godown Operations</div>
                     </div>
                  </div>
                  <div className="text-xl font-black text-foreground">{initialStats.staffCounts?.shipment || 0}</div>
               </div>

               <div className="p-3 rounded-xl bg-pink-500/5 border border-pink-500/10 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                     <div className="h-9 w-9 rounded-lg bg-pink-500/10 text-pink-600 flex items-center justify-center">
                        <Icon name="TruckIcon" size={18} />
                     </div>
                     <div>
                        <div className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Delivery Man</div>
                        <div className="text-[10px] font-bold text-foreground">On-Field Fleet</div>
                     </div>
                  </div>
                  <div className="text-xl font-black text-foreground">{initialStats.staffCounts?.delivery || 0}</div>
               </div>

               <div className="p-3 rounded-xl bg-orange-500/5 border border-orange-500/10 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                     <div className="h-9 w-9 rounded-lg bg-orange-500/10 text-orange-600 flex items-center justify-center">
                        <Icon name="DevicePhoneMobileIcon" size={18} />
                     </div>
                     <div>
                        <div className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Physical Seller</div>
                        <div className="text-[10px] font-bold text-foreground">Counter Terminals</div>
                     </div>
                  </div>
                  <div className="text-xl font-black text-foreground">{initialStats.staffCounts?.shopkeeper || 0}</div>
               </div>

               <div className="p-3 rounded-xl bg-violet-500/5 border border-violet-500/10 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                     <div className="h-9 w-9 rounded-lg bg-violet-500/10 text-violet-600 flex items-center justify-center">
                        <Icon name="BuildingStorefrontIcon" size={18} />
                     </div>
                     <div>
                        <div className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Admins</div>
                        <div className="text-[10px] font-bold text-foreground">Management Panel</div>
                     </div>
                  </div>
                  <div className="text-xl font-black text-foreground">{initialStats.staffCounts?.admin || 0}</div>
               </div>
            </div>

            {/* Staff Performance Section */}
            <div className="mt-8">
               <div className="mb-4 flex items-center justify-between px-2">
                  <h2 className="font-heading text-lg font-bold text-foreground">Top Shopkeepers</h2>
                  <Icon name="TrophyIcon" size={16} className="text-amber-500" />
               </div>
               <div className="space-y-2">
                  {initialStats.staffPerformance?.length > 0 ? 
                    initialStats.staffPerformance.map((staff: any, index: number) => (
                      <div key={staff.staffId} className="p-3 rounded-xl bg-card border border-border flex items-center justify-between shadow-sm">
                        <div className="flex items-center gap-3">
                          <div className={`h-8 w-8 rounded-full flex items-center justify-center text-[10px] font-black ${getStaffBadgeColor(index)}`}>
                            #{index + 1}
                          </div>
                          <div>
                            <div className="text-xs font-bold text-foreground">{staff.name}</div>
                            <div className="text-[9px] font-medium text-muted-foreground uppercase">{staff.orderCount || 0} Orders</div>
                          </div>
                        </div>
                        <div className="text-sm font-black text-foreground">₹{(staff.revenue || 0).toLocaleString('en-IN')}</div>
                      </div>
                    ))
                   : (
                    <div className="p-8 text-center border border-dashed border-border rounded-xl">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase">No Offline Sales Recorded</p>
                    </div>
                  )}
               </div>
            </div>

            <div className="mt-6 pt-4 border-t border-border flex flex-col gap-2">
               <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-muted-foreground uppercase">Awaiting Packing</span>
                  <span className="font-black text-amber-600">{initialStats.statusCounts?.received || 0}</span>
               </div>
               <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-muted-foreground uppercase">Failed Attempts</span>
                  <span className="font-black text-red-600">{initialStats.statusCounts?.deliveryFailed || 0}</span>
               </div>
            </div>
         </div>

        {/* Performance Chart */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between px-2">
            <h2 className="font-heading text-xl font-bold text-foreground">Performance Overview</h2>
            <div className="flex items-center gap-1 rounded-lg border border-border bg-muted/30 p-1">
              {(['day', 'week', 'month', 'year'] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setTimeRange(r)}
                  className={`rounded-md px-3 py-1 text-[10px] font-bold uppercase tracking-wider transition-smooth ${
                    timeRange === r ? 'bg-card text-primary shadow-sm' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
          <div className="rounded-2xl border border-border bg-card p-6 shadow-warm-sm h-[350px]">
             <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={initialStats.performanceData}>
                  <defs>
                    <linearGradient id="colorOnline" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorOffline" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="displayDate" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fontWeight: 600 }}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fontWeight: 600 }}
                    tickFormatter={(value) => `₹${value}`}
                  />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    formatter={(value: any) => [`₹${value.toLocaleString('en-IN')}`, '']}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="onlineRevenue" 
                    name="Online"
                    stroke="#3b82f6" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorOnline)" 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="offlineRevenue" 
                    name="Offline"
                    stroke="#f59e0b" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorOffline)" 
                  />
                </AreaChart>
             </ResponsiveContainer>
          </div>
        </div>

        {/* Order Mix / Channel stats would go here, for now keeping Quick Shortcuts */}
         <div className="space-y-4">
            <h2 className="font-heading text-xl font-bold text-foreground px-2">Order Activity</h2>
            <div className="rounded-2xl border border-border bg-card p-6 shadow-warm-sm h-[350px]">
               <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={initialStats.performanceData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis 
                      dataKey="displayDate" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 10, fontWeight: 600 }}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 10, fontWeight: 600 }}
                    />
                    <Tooltip 
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    />
                    <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={20}>
                      {initialStats.performanceData.map((entry: any) => (
                        <Cell key={entry.date} fill={entry.displayDate === 'Today' ? '#4f46e5' : '#818cf8'} />
                      ))}
                    </Bar>
                  </BarChart>
               </ResponsiveContainer>
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Recent Orders */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between px-2">
            <h2 className="font-heading text-xl font-bold text-foreground">Recent Activity</h2>
            <Link href="/admin/orders" className="text-sm font-bold text-primary hover:underline">View All</Link>
          </div>
          <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-warm-sm">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/30 text-xs font-bold uppercase tracking-wider text-muted-foreground border-b border-border">
                <tr>
                  <th className="px-6 py-4">Order ID</th>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Total</th>
                  <th className="px-6 py-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {initialStats.recentOrders.map((order: any) => (
                  <tr key={order.id} className="transition-smooth hover:bg-muted/10">
                    <td className="px-6 py-4 font-mono font-bold text-primary">{order.id.substring(0, 8)}...</td>
                    <td className="px-6 py-4 text-foreground">{order.customerName}</td>
                    <td className="px-6 py-4 font-bold text-foreground">₹{order.total.toLocaleString('en-IN')}</td>
                    <td className="px-6 py-4 text-right">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${getOrderStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {initialStats.recentOrders.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-muted-foreground italic">No recent orders yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Inventory Alerts */}
        <div className="space-y-4">
          <div className="px-2">
            <h2 className="font-heading text-xl font-bold text-foreground">Inventory Alerts</h2>
          </div>
          <div className="rounded-2xl border border-border bg-card p-6 shadow-warm-sm space-y-5">
            {initialStats.inventoryAlerts.map((alert: any) => (
              <div key={alert.id} className="flex items-center gap-4">
                <div className={`h-2 w-2 rounded-full ${alert.quantity === 0 ? 'bg-destructive animate-pulse' : 'bg-warning'}`}></div>
                <div className="flex-1">
                   <div className="font-bold text-foreground line-clamp-1">{alert.name}</div>
                   <div className="text-xs text-muted-foreground">{alert.quantity === 0 ? 'Completely Out of Stock' : `Only ${alert.quantity} units left` }</div>
                </div>
                <Link href="/admin/products" className="rounded-lg bg-muted p-2 text-muted-foreground hover:text-primary transition-smooth">
                   <Icon name="ArrowTopRightOnSquareIcon" size={16} />
                </Link>
              </div>
            ))}
            {initialStats.inventoryAlerts.length === 0 && (
               <div className="text-center py-4 text-muted-foreground italic">No stock alerts found.</div>
            )}
            <Link 
               href="/admin/products" 
               className="block w-full rounded-xl bg-primary/5 py-3 text-center text-sm font-bold text-primary transition-smooth hover:bg-primary/10"
            >
               Order More Stock
            </Link>
          </div>
          
          {/* Quick Actions */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-warm-sm">
             <h3 className="font-bold text-foreground mb-4">Quick Shortcuts</h3>
             <div className="grid grid-cols-2 gap-3">
                <Link href="/admin/products/new" className="flex flex-col items-center justify-center p-4 rounded-xl border border-border transition-smooth hover:border-primary/30 hover:bg-primary/5 group">
                   <Icon name="PlusCircleIcon" size={24} className="text-primary group-hover:scale-110 transition-smooth" />
                   <span className="mt-2 text-[10px] font-bold uppercase text-muted-foreground">New Product</span>
                </Link>
                <Link href="/admin/promotions" className="flex flex-col items-center justify-center p-4 rounded-xl border border-border transition-smooth hover:border-primary/30 hover:bg-primary/5 group">
                   <Icon name="TagIcon" size={24} className="text-primary group-hover:scale-110 transition-smooth" />
                   <span className="mt-2 text-[10px] font-bold uppercase text-muted-foreground">Banners</span>
                </Link>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
