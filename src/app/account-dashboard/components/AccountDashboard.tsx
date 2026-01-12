'use client';

import { useAuth } from '@/app/providers/AuthProvider';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import WelcomePanel from './WelcomePanel';
import QuickActions from './QuickActions';
import OrderHistory from './OrderHistory';
import AddressBook from './AddressBook';
import PaymentMethods from './PaymentMethods';
import WishlistSection from './WishlistSection';
import ProfileManager from './ProfileManager';
import NotificationPreferences from './NotificationPreferences';
import Icon from '@/components/ui/AppIcon';
import { getUserOrders, getUserAddresses, getUserProfile } from '@/app/actions';

export default function AccountDashboard() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');
  const [orders, setOrders] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [profile, setProfile] = useState<any>(null);
  const [stats, setStats] = useState({ totalOrders: 0 });

  useEffect(() => {
    const loadData = async () => {
      if (user?.email) {
        const [userOrders, userAddresses, userProfile] = await Promise.all([
          getUserOrders(user.email),
          getUserAddresses(user.email),
          getUserProfile(user.email)
        ]);
        setOrders(userOrders as any);
        setAddresses(userAddresses as any);
        setProfile(userProfile);
        setStats({ totalOrders: userOrders.length });
      }
    };
    loadData();
  }, [user?.email]);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: 'Squares2X2Icon' },
    { id: 'orders', label: 'Order History', icon: 'ShoppingBagIcon' },
    { id: 'profile', label: 'Profile Settings', icon: 'UserCircleIcon' },
    { id: 'wishlist', label: 'My Wishlist', icon: 'HeartIcon' },
    { id: 'addresses', label: 'Address Book', icon: 'MapPinIcon' },
    { id: 'payments', label: 'Payment Methods', icon: 'CreditCardIcon' },
    { id: 'notifications', label: 'Notifications', icon: 'BellIcon' },
  ];

  return (
    <div className="min-h-screen bg-muted/30 pb-20">
      {/* Dashboard Header */}
      <div className="bg-card border-b border-border shadow-warm-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                <Icon name="UserIcon" size={32} />
              </div>
              <div>
                <h1 className="text-2xl font-heading font-bold text-foreground">Welcome back, {user?.name || 'Explorer'}!</h1>
                <p className="text-muted-foreground text-sm">Manage your orders, profile and shopping preferences.</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
               <button 
                 onClick={handleLogout}
                 className="flex items-center gap-2 px-4 py-2 rounded-xl border border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100 transition-smooth text-sm font-medium"
               >
                 <Icon name="ArrowRightOnRectangleIcon" size={18} />
                 <span>Sign Out</span>
               </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <nav className="space-y-1 bg-card rounded-2xl border border-border p-2 shadow-warm-sm sticky top-24">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-smooth ${
                    activeTab === tab.id
                      ? 'bg-primary text-primary-foreground shadow-md'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >
                  <Icon name={tab.icon as any} size={20} />
                  {tab.label}
                </button>
              ))}
              <div className="my-2 border-t border-border mx-2" />
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-rose-500 hover:bg-rose-50 transition-smooth"
              >
                <Icon name="ArrowRightOnRectangleIcon" size={20} />
                Sign Out
              </button>
            </nav>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3 space-y-8">
            {activeTab === 'overview' && (
              <>
                <WelcomePanel 
                  userName={profile?.name || user?.name || 'Customer'} 
                  userEmail={profile?.email || user?.email || ''} 
                  userPhone={profile?.phone || user?.phone || ''}
                  userGender={profile?.gender || (user as any)?.gender || ''}
                  totalOrders={stats.totalOrders}
                  memberSince={profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : "Jan 2026"}
                />
                <QuickActions />
              </>
            )}

            {activeTab === 'orders' && <OrderHistory orders={orders} />}
            {activeTab === 'profile' && (
              <ProfileManager 
                initialData={{
                  firstName: profile?.name?.split(' ')[0] || user?.name?.split(' ')[0] || '',
                  lastName: profile?.name?.split(' ').slice(1).join(' ') || user?.name?.split(' ').slice(1).join(' ') || '',
                  email: profile?.email || user?.email || '',
                  phone: profile?.phone || user?.phone || '',
                  gender: profile?.gender || (user as any)?.gender || '',
                }} 
              />
            )}
            {activeTab === 'wishlist' && <WishlistSection />}
            {activeTab === 'addresses' && <AddressBook addresses={addresses} />}
            {activeTab === 'payments' && <PaymentMethods methods={[]} />}
            {activeTab === 'notifications' && (
              <NotificationPreferences 
                preferences={[
                  { id: 'orderUpdates', label: 'Order Updates', description: 'Receive notifications about your order status.', enabled: profile?.preferences?.orderUpdates ?? true, icon: 'ShoppingBagIcon' },
                  { id: 'promotions', label: 'Promotions', description: 'Get notified about sales and special offers.', enabled: profile?.preferences?.promotions ?? false, icon: 'TagIcon' },
                  { id: 'stockAlerts', label: 'In-Stock Alerts', description: 'Notifications when items in your wishlist are back.', enabled: profile?.preferences?.stockAlerts ?? true, icon: 'ClockIcon' },
                ]} 
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
