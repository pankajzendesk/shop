'use client';

import { useState, useEffect } from 'react';
import Icon from '@/components/ui/AppIcon';
import Notification from '@/components/ui/Notification';
import { getStaffUsers, createStaffUser, toggleUserStatus, deleteUser } from '@/app/actions';

export default function StaffManagementPage() {
  const [staff, setStaff] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' as 'success' | 'error' | 'info' });
  
  const [formData, setFormData] = useState({
    name: '',
    lastName: '',
    email: '',
    password: '',
    role: 'shipment' as 'shipment' | 'delivery_champion' | 'shopkeeper' | 'inventory_manager',
    phone: ''
  });

  const loadStaff = async () => {
    try {
      setLoading(true);
      const data = await getStaffUsers();
      setStaff(data);
    } catch (err) {
      console.error(err);
      setNotification({ show: true, message: 'Failed to load staff list', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStaff();
  }, []);

  const handleToggleStatus = async (userId: string) => {
    setProcessingId(userId);
    try {
      const result = await toggleUserStatus(userId);
      if (result.success) {
        setNotification({ show: true, message: 'User status updated', type: 'success' });
        loadStaff();
      } else {
        setNotification({ show: true, message: result.message || 'Update failed', type: 'error' });
      }
    } catch (err) {
      console.error('Update failed:', err);
      setNotification({ show: true, message: 'Update failed', type: 'error' });
    } finally {
      setProcessingId(null);
    }
  };

  const handleDelete = async (userId: string) => {
    if (!globalThis.confirm('Are you sure you want to delete this staff member?')) return;
    setProcessingId(userId);
    try {
      const result = await deleteUser(userId);
      if (result.success) {
        setNotification({ 
          show: true, 
          message: result.message || 'User deleted successfully', 
          type: result.message ? 'info' : 'success' 
        });
        loadStaff();
      } else {
        setNotification({ show: true, message: result.message || 'Delete failed', type: 'error' });
      }
    } catch (err) {
      console.error('Delete failed:', err);
      setNotification({ show: true, message: 'Delete failed', type: 'error' });
    } finally {
      setProcessingId(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const result = await createStaffUser({
        name: formData.name,
        lastName: formData.lastName,
        email: formData.email,
        passwordHash: formData.password, // In real app, hash this client-side or use a dedicated API
        role: formData.role,
        phone: formData.phone
      });

      if (result.success) {
        setNotification({ show: true, message: `Successfully created ${formData.role} account`, type: 'success' });
        setShowAddModal(false);
        setFormData({ name: '', lastName: '', email: '', password: '', role: 'shipment', phone: '' });
        loadStaff();
      } else {
        setNotification({ show: true, message: result.message || 'Failed to create account', type: 'error' });
      }
    } catch (err: any) {
      console.error(err);
      setNotification({ 
        show: true, 
        message: 'A system error occurred. Please try again.', 
        type: 'error' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'shipment': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'delivery_champion': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'shopkeeper': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'inventory_manager': return 'bg-orange-100 text-orange-700 border-orange-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'shipment': return 'Packer & Shipper';
      case 'delivery_champion': return 'Delivery Man';
      case 'shopkeeper': return 'Physical Seller (POS)';
      case 'inventory_manager': return 'Inventory Manager';
      default: return role.replace('_', ' ').toUpperCase();
    }
  };

  return (
    <div className="p-6">
      <Notification 
        isVisible={notification.show} 
        message={notification.message} 
        type={notification.type} 
        onClose={() => setNotification(prev => ({ ...prev, show: false }))} 
      />

      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold text-foreground">Staff Management</h1>
          <p className="text-muted-foreground">Create and manage accounts for Shipper and Delivery teams</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center justify-center gap-2 rounded-2xl bg-primary px-8 py-4 font-black text-white shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <Icon name="PlusIcon" size={24} />
          ADD STAFF MEMBER
        </button>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {staff.map((member) => (
            <div key={member.id} className={`group overflow-hidden rounded-[2rem] border bg-card p-1 shadow-warm-sm transition-all hover:shadow-warm-md ${member.isActive ? 'border-border hover:border-primary/20' : 'border-red-200 bg-red-50/10 opacity-75'}`}>
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${member.isActive ? 'bg-muted group-hover:bg-primary/10 group-hover:text-primary' : 'bg-red-100 text-red-600'} transition-colors`}>
                    <Icon name="UserIcon" size={28} />
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className={`rounded-xl px-3 py-1 text-[10px] font-black uppercase tracking-widest border ${getRoleBadgeColor(member.role)}`}>
                      {getRoleDisplayName(member.role)}
                    </span>
                    {!member.isActive && (
                      <span className="text-[10px] font-black text-red-600 uppercase tracking-widest bg-red-100 px-2 py-0.5 rounded-lg">Suspended</span>
                    )}
                  </div>
                </div>
                
                <h3 className="text-xl font-bold text-foreground">{member.name} {member.lastName}</h3>
                <p className="text-sm text-muted-foreground mb-4">{member.email}</p>
                
                <div className="space-y-3 pt-4 border-t border-border/50">
                   <div className="flex items-center gap-3 text-sm font-medium text-foreground/80">
                      <Icon name="PhoneIcon" size={16} className="text-muted-foreground" />
                      {member.phone || 'No phone provided'}
                   </div>
                   <div className="flex items-center gap-3 text-sm font-medium text-foreground/80">
                      <Icon name="CalendarIcon" size={16} className="text-muted-foreground" />
                      Joined {new Date(member.createdAt).toLocaleDateString()}
                   </div>
                </div>

                <div className="mt-6 flex items-center gap-2 border-t border-border/50 pt-4 opacity-0 transition-opacity group-hover:opacity-100">
                  <button
                    onClick={() => handleToggleStatus(member.id)}
                    disabled={processingId === member.id}
                    title={member.isActive ? 'Pause Account' : 'Resume Account'}
                    className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-2 text-xs font-bold transition-all ${
                      member.isActive ? 'bg-amber-100 text-amber-700 hover:bg-amber-200' : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                    }`}
                  >
                    <Icon name={member.isActive ? 'PauseIcon' : 'PlayIcon'} size={14} />
                    {member.isActive ? 'PAUSE' : 'RESUME'}
                  </button>
                  <button
                    onClick={() => handleDelete(member.id)}
                    disabled={processingId === member.id}
                    title="Delete Staff member"
                    className="flex h-8 w-8 items-center justify-center rounded-xl bg-red-100 text-red-600 hover:bg-red-200 transition-all"
                  >
                    <Icon name="TrashIcon" size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {staff.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center py-20 bg-muted/30 rounded-[3rem] border-2 border-dashed border-border">
               <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center text-muted-foreground mb-4">
                  <Icon name="UsersIcon" size={40} />
               </div>
               <h3 className="text-xl font-bold text-foreground">No staff members found</h3>
               <p className="text-muted-foreground text-center max-w-xs">Start building your team by adding shipment or delivery accounts.</p>
            </div>
          )}
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
          <div className="w-full max-w-xl rounded-[2.5rem] bg-card p-10 shadow-2xl animate-in zoom-in-95 duration-200 border border-border">
            <div className="flex justify-between items-center mb-8">
               <h2 className="font-heading text-3xl font-black text-foreground uppercase tracking-tight">Create Staff Account</h2>
               <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-muted rounded-xl transition-colors">
                  <Icon name="XMarkIcon" size={24} />
               </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div>
                    <label htmlFor="staff-first-name" className="block text-[10px] font-black text-muted-foreground mb-2 uppercase tracking-widest ml-1">First Name</label>
                    <input
                      id="staff-first-name"
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full rounded-2xl border border-border bg-background px-5 py-4 focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all font-medium"
                      placeholder="e.g. John"
                    />
                 </div>
                 <div>
                    <label htmlFor="staff-last-name" className="block text-[10px] font-black text-muted-foreground mb-2 uppercase tracking-widest ml-1">Last Name</label>
                    <input
                      id="staff-last-name"
                      type="text"
                      required
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      className="w-full rounded-2xl border border-border bg-background px-5 py-4 focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all font-medium"
                      placeholder="e.g. Doe"
                    />
                 </div>
              </div>

              <div>
                <label htmlFor="staff-email" className="block text-[10px] font-black text-muted-foreground mb-2 uppercase tracking-widest ml-1">Email Address</label>
                <input
                  id="staff-email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full rounded-2xl border border-border bg-background px-5 py-4 focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all font-medium"
                  placeholder="name@toyshop.com"
                />
              </div>

              <div>
                <label htmlFor="staff-password" className="block text-[10px] font-black text-muted-foreground mb-2 uppercase tracking-widest ml-1">Password</label>
                <input
                  id="staff-password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full rounded-2xl border border-border bg-background px-5 py-4 focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all font-medium"
                  placeholder="Set account password"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div>
                    <label htmlFor="staff-phone" className="block text-[10px] font-black text-muted-foreground mb-2 uppercase tracking-widest ml-1">Phone Number</label>
                    <input
                      id="staff-phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full rounded-2xl border border-border bg-background px-5 py-4 focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all font-medium"
                      placeholder="Optional"
                    />
                 </div>
                   <div>
                    <label htmlFor="staff-role" className="block text-[10px] font-black text-muted-foreground mb-2 uppercase tracking-widest ml-1">Assign Role</label>
                    <select
                      id="staff-role"
                      value={formData.role}
                      onChange={(e: any) => setFormData({ ...formData, role: e.target.value })}
                      className="w-full rounded-2xl border border-border bg-background px-5 py-4 focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all font-medium appearance-none"
                    >
                      <option value="shipment">Packer & Shipper</option>
                      <option value="delivery_champion">Delivery Man</option>
                      <option value="shopkeeper">Physical Seller (POS)</option>
                      <option value="inventory_manager">Inventory Manager</option>
                    </select>
                 </div>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full rounded-[1.5rem] bg-primary py-5 font-black text-white shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 text-lg uppercase tracking-widest"
                >
                  {isSubmitting ? 'Creating Account...' : 'Create Staff Member'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
