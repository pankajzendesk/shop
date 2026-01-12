'use client';

import { useState, useMemo } from 'react';
import Icon from '@/components/ui/AppIcon';
import AppImage from '@/components/ui/AppImage';

interface Customer {
  id: string;
  name: string;
  email: string;
  orders: number;
  totalSpent: number;
  lastOrder: string;
  role: string;
  status: string;
  avatar?: string;
}

export function AdminCustomersClient({ initialCustomers }: { readonly initialCustomers: readonly Customer[] }) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCustomers = useMemo(() => 
    initialCustomers.filter(c => 
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email.toLowerCase().includes(searchTerm.toLowerCase())
    ), [initialCustomers, searchTerm]
  );

  const stats = useMemo(() => ({
    total: initialCustomers.length,
    active: initialCustomers.filter(c => c.status === 'Active').length,
    new: initialCustomers.filter(c => c.status === 'New').length
  }), [initialCustomers]);

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="rounded-2xl border border-border bg-card p-6 shadow-warm-sm">
           <div className="flex items-center gap-4">
              <div className="rounded-xl bg-primary/10 p-3 text-primary">
                 <Icon name="UsersIcon" size={24} />
              </div>
              <div>
                 <div className="text-sm text-muted-foreground uppercase font-bold tracking-wider">Total Customers</div>
                 <div className="text-2xl font-bold text-foreground">{stats.total}</div>
              </div>
           </div>
        </div>
        <div className="rounded-2xl border border-border bg-card p-6 shadow-warm-sm">
           <div className="flex items-center gap-4">
              <div className="rounded-xl bg-success/10 p-3 text-success">
                 <Icon name="CheckBadgeIcon" size={24} />
              </div>
              <div>
                 <div className="text-sm text-muted-foreground uppercase font-bold tracking-wider">Active Users</div>
                 <div className="text-2xl font-bold text-foreground">{stats.active}</div>
              </div>
           </div>
        </div>
        <div className="rounded-2xl border border-border bg-card p-6 shadow-warm-sm">
           <div className="flex items-center gap-4">
              <div className="rounded-xl bg-warning/10 p-3 text-warning">
                 <Icon name="SparklesIcon" size={24} />
              </div>
              <div>
                 <div className="text-sm text-muted-foreground uppercase font-bold tracking-wider">New Signups</div>
                 <div className="text-2xl font-bold text-foreground">{stats.new}</div>
              </div>
           </div>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-4 shadow-warm-sm">
        <div className="relative">
          <Icon name="MagnifyingGlassIcon" size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by name or email..."
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
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Orders</th>
                <th className="px-6 py-4">Total Spent</th>
                <th className="px-6 py-4">Last Activity</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredCustomers.map((customer) => (
                <tr key={customer.id} className="group transition-smooth hover:bg-muted/20">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-full border border-border bg-muted/30 relative">
                        {customer.avatar && <AppImage src={customer.avatar} alt={customer.name} fill className="object-cover" />}
                      </div>
                      <div>
                        <div className="font-bold text-foreground">{customer.name}</div>
                        <div className="text-xs text-muted-foreground">{customer.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="rounded-lg bg-primary/10 px-2 py-1 text-[10px] font-black uppercase tracking-widest text-primary border border-primary/20">
                      Buyer
                    </span>
                  </td>
                  <td className="px-6 py-4 text-foreground font-medium">{customer.orders}</td>
                  <td className="px-6 py-4 font-mono font-bold text-foreground">₹{customer.totalSpent.toLocaleString('en-IN')}</td>
                  <td className="px-6 py-4 text-muted-foreground italic">
                    {customer.lastOrder === 'N/A' ? 'Never' : new Date(customer.lastOrder).toLocaleDateString('en-IN')}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-2 rounded-lg bg-muted text-muted-foreground transition-smooth hover:bg-primary/10 hover:text-primary">
                      <Icon name="PencilSquareIcon" size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
