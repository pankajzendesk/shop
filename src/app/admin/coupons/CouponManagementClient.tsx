'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Icon from '@/components/ui/AppIcon';
import Notification from '@/components/ui/Notification';
import { createOrUpdateCoupon, deleteCoupon } from '@/app/actions';

interface Coupon {
  id: string;
  code: string;
  type: string;
  value: number;
  minOrderAmount: number;
  expiryDate: Date | string | null;
  usageLimit: number | null;
  usageCount: number;
  isActive: boolean;
}

interface CouponManagementClientProps {
  initialCoupons: any[];
}

export function CouponManagementClient({ initialCoupons }: Readonly<CouponManagementClientProps>) {
  const router = useRouter();
  const [coupons, setCoupons] = useState<Coupon[]>(initialCoupons);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Partial<Coupon> | null>(null);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMsg, setNotificationMsg] = useState('');

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await createOrUpdateCoupon(editingCoupon as any);
      if (editingCoupon?.id) {
        setCoupons(coupons.map(c => c.id === editingCoupon.id ? res : c));
      } else {
        setCoupons([res, ...coupons]);
      }
      setIsModalOpen(false);
      setEditingCoupon(null);
      setNotificationMsg('Coupon saved successfully');
      setShowNotification(true);
      router.refresh();
    } catch (error) {
       console.error('Save coupon failed:', error);
       setNotificationMsg('Error saving coupon');
       setShowNotification(true);
    }
  };

  const handleDelete = async (id: string) => {
    if (!globalThis.confirm('Are you sure?')) return;
    try {
        await deleteCoupon(id);
        setCoupons(coupons.filter(c => c.id !== id));
        setNotificationMsg('Coupon deleted');
        setShowNotification(true);
    } catch (error) {
        console.error('Delete coupon failed:', error);
        setNotificationMsg('Error deleting');
        setShowNotification(true);
    }
  };

  return (
    <div className="space-y-8">
      <Notification isVisible={showNotification} message={notificationMsg} onClose={() => setShowNotification(false)} />

      <div className="flex items-center justify-between">
        <div>
           <h1 className="text-3xl font-black text-foreground tracking-tight">Marketing Coupons</h1>
           <p className="text-muted-foreground font-medium">Create and manage discount codes for your shop</p>
        </div>
        <button 
          onClick={() => { setEditingCoupon({ code: '', type: 'PERCENTAGE', value: 10, minOrderAmount: 0, isActive: true }); setIsModalOpen(true); }}
          className="flex items-center gap-2 rounded-2xl bg-zinc-900 px-6 py-3 text-sm font-bold text-white transition-smooth hover:bg-zinc-800"
        >
          <Icon name="PlusIcon" size={18} />
          Create New Coupon
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {coupons.map(coupon => (
          <div key={coupon.id} className="group relative rounded-3xl border border-border bg-card p-6 shadow-warm-sm transition-all hover:shadow-warm-lg hover:-translate-y-1">
             <div className="mb-4 flex items-center justify-between">
                <div className="rounded-xl bg-primary/10 px-3 py-1 text-xs font-black text-primary uppercase tracking-widest">
                   {coupon.code}
                </div>
                <div className={`h-2 w-2 rounded-full ${coupon.isActive ? 'bg-emerald-500' : 'bg-red-500'} shadow-sm`}></div>
             </div>
             
             <div className="mb-6 space-y-1">
                <div className="text-2xl font-black text-foreground">
                   {coupon.type === 'PERCENTAGE' ? `${coupon.value}% OFF` : `₹${coupon.value} OFF`}
                </div>
                <div className="text-xs font-bold text-muted-foreground uppercase opacity-60">
                   Min. Order: ₹{coupon.minOrderAmount}
                </div>
             </div>

             <div className="mb-6 grid grid-cols-2 gap-4 border-t border-border pt-4">
                <div>
                   <div className="text-[10px] font-black uppercase text-muted-foreground mb-1">Used</div>
                   <div className="text-sm font-bold text-foreground">{coupon.usageCount} times</div>
                </div>
                <div>
                   <div className="text-[10px] font-black uppercase text-muted-foreground mb-1">Limit</div>
                   <div className="text-sm font-bold text-foreground">{coupon.usageLimit || '∞'}</div>
                </div>
             </div>

             <div className="flex gap-2">
                <button 
                  onClick={() => { setEditingCoupon(coupon); setIsModalOpen(true); }}
                  className="flex-1 rounded-xl bg-muted py-2 text-xs font-bold text-foreground transition-smooth hover:bg-zinc-200"
                >
                   Edit
                </button>
                <button 
                   onClick={() => handleDelete(coupon.id)}
                   className="rounded-xl bg-red-500/10 p-2 text-red-500 transition-smooth hover:bg-red-500 hover:text-white"
                >
                   <Icon name="TrashIcon" size={16} />
                </button>
             </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
           <div className="w-full max-w-md bg-card p-8 rounded-[2rem] shadow-2xl border border-border">
              <h2 className="text-2xl font-black text-foreground mb-6">Coupon Settings</h2>
              <form onSubmit={handleSave} className="space-y-4">
                 <div>
                    <label htmlFor="couponCode" className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-1.5 block">Coupon Code</label>
                    <input 
                      id="couponCode"
                      required
                      type="text" 
                      className="w-full rounded-xl border border-input bg-muted/20 px-4 py-3 font-bold uppercase"
                      value={editingCoupon?.code}
                      onChange={(e) => setEditingCoupon({...editingCoupon, code: e.target.value.toUpperCase()})}
                    />
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="couponType" className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-1.5 block">Type</label>
                        <select 
                           id="couponType"
                           className="w-full rounded-xl border border-input bg-muted/20 px-4 py-3 text-sm font-bold"
                           value={editingCoupon?.type}
                           onChange={(e) => setEditingCoupon({...editingCoupon, type: e.target.value})}
                        >
                           <option value="PERCENTAGE">Percentage</option>
                           <option value="FIXED">Fixed Amount</option>
                        </select>
                    </div>
                    <div>
                        <label htmlFor="couponValue" className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-1.5 block">Value</label>
                        <input 
                          id="couponValue"
                          required
                          type="number" 
                          className="w-full rounded-xl border border-input bg-muted/20 px-4 py-3 font-bold"
                          value={editingCoupon?.value}
                          onChange={(e) => setEditingCoupon({...editingCoupon, value: Number.parseFloat(e.target.value)})}
                        />
                    </div>
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="minOrder" className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-1.5 block">Min. Order</label>
                        <input 
                          id="minOrder"
                          type="number" 
                          className="w-full rounded-xl border border-input bg-muted/20 px-4 py-3 font-bold"
                          value={editingCoupon?.minOrderAmount}
                          onChange={(e) => setEditingCoupon({...editingCoupon, minOrderAmount: Number.parseFloat(e.target.value)})}
                        />
                    </div>
                    <div>
                        <label htmlFor="usageLimit" className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-1.5 block">Usage Limit</label>
                        <input 
                          id="usageLimit"
                          type="number" 
                          className="w-full rounded-xl border border-input bg-muted/20 px-4 py-3 font-bold"
                          value={editingCoupon?.usageLimit || ''}
                          onChange={(e) => setEditingCoupon({...editingCoupon, usageLimit: Number.parseInt(e.target.value) || null})}
                        />
                    </div>
                 </div>

                 <div className="flex items-center gap-2 pt-4">
                    <input 
                       type="checkbox" 
                       id="isActive"
                       checked={editingCoupon?.isActive}
                       onChange={(e) => setEditingCoupon({...editingCoupon, isActive: e.target.checked})}
                    />
                    <label htmlFor="isActive" className="text-sm font-bold text-foreground">Active Status</label>
                 </div>

                 <div className="flex gap-3 pt-6">
                    <button 
                       type="button" 
                       onClick={() => setIsModalOpen(false)}
                       className="flex-1 rounded-xl bg-muted py-3 text-xs font-bold text-foreground hover:bg-zinc-200"
                    >
                       Cancel
                    </button>
                    <button 
                       type="submit" 
                       className="flex-1 rounded-xl bg-zinc-900 py-3 text-xs font-bold text-white hover:bg-zinc-800"
                    >
                       Save Coupon
                    </button>
                 </div>
              </form>
           </div>
        </div>
      )}
    </div>
  );
}
