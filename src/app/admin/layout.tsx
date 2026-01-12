'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import Icon from '@/components/ui/AppIcon';
import AppImage from '@/components/ui/AppImage';

interface SidebarItemProps {
  href: string;
  icon: string;
  label: string;
  active: boolean;
}

const SidebarItem = ({ href, icon, label, active }: SidebarItemProps) => (
  <Link
    href={href}
    className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-smooth ${
      active
        ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
    }`}
  >
    <Icon name={icon} size={20} />
    <span>{label}</span>
  </Link>
);

export default function AdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const router = useRouter();
  const pathname = usePathname();
  const [isHydrated, setIsHydrated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isChangingAdminPassword, setIsChangingAdminPassword] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');

  useEffect(() => {
    setIsHydrated(true);
    const adminStatus = localStorage.getItem('isAdmin');
    if (adminStatus === 'true') {
      setIsAdmin(true);
    } else if (pathname !== '/admin/login') {
      router.push('/admin/login');
    }
  }, [pathname, router]);

  useEffect(() => {
    // Close sidebar on route change on mobile
    setIsSidebarOpen(false);
  }, [pathname]);

  const handleLogout = () => {
    localStorage.removeItem('isAdmin');
    router.push('/admin/login');
  };

  if (!isHydrated) return null;

  // Render children directly for login page to avoid sidebar
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  if (!isAdmin) return null;

  return (
    <div className="flex min-h-screen bg-muted/30">
      {/* Sidebar Mobile Overlay */}
      {isSidebarOpen && (
        <button 
          type="button"
          className="fixed inset-0 z-40 w-full h-full bg-background/80 backdrop-blur-sm lg:hidden focus:outline-none"
          onClick={() => setIsSidebarOpen(false)}
          aria-label="Close sidebar"
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 border-r border-border bg-card flex flex-col transition-transform duration-300 lg:translate-x-0 lg:static ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 flex-shrink-0 flex items-center justify-between lg:justify-start lg:gap-2">
          <div className="flex items-center gap-2">
            {process.env.NEXT_PUBLIC_SHOP_LOGO_PATH ? (
              <div className="relative h-10 w-10 overflow-hidden rounded-xl">
                 <AppImage 
                   src={process.env.NEXT_PUBLIC_SHOP_LOGO_PATH} 
                   alt="Shop Logo" 
                   fill 
                   className="object-contain"
                 />
              </div>
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
                <Icon name="ShieldCheckIcon" size={24} />
              </div>
            )}
            <span className="font-heading text-lg font-bold tracking-tight text-foreground truncate">
              {process.env.NEXT_PUBLIC_SHOP_NAME || 'Seller Panel'}
            </span>
          </div>
          <button 
            className="lg:hidden p-2 rounded-lg hover:bg-muted text-muted-foreground transition-smooth"
            onClick={() => setIsSidebarOpen(false)}
          >
            <Icon name="XMarkIcon" size={20} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-6 pb-24 scrollbar-hide">
          <div className="flex flex-col gap-2">
            <SidebarItem
              href="/admin"
              icon="Squares2X2Icon"
              label="Dashboard"
              active={pathname === '/admin'}
            />
            <SidebarItem
              href="/admin/products"
              icon="ShoppingBagIcon"
              label="Product List"
              active={pathname.startsWith('/admin/products') && pathname !== '/admin/products/new'}
            />
            <SidebarItem
              href="/admin/products/new"
              icon="PlusCircleIcon"
              label="Add New Product"
              active={pathname === '/admin/products/new'}
            />
            <SidebarItem
              href="/admin/categories"
              icon="TagIcon"
              label="Manage Categories"
              active={pathname === '/admin/categories'}
            />
            <SidebarItem
              href="/admin/orders"
              icon="ClipboardDocumentListIcon"
              label="Orders"
              active={pathname === '/admin/orders'}
            />
            <SidebarItem
              href="/admin/delivery"
              icon="TruckIcon"
              label="Delivery Hub"
              active={pathname === '/admin/delivery'}
            />
            <SidebarItem
              href="/admin/customers"
              icon="UsersIcon"
              label="Customers"
              active={pathname === '/admin/customers'}
            />
            <SidebarItem
              href="/admin/traffic"
              icon="ChartBarIcon"
              label="Traffic Monitoring"
              active={pathname === '/admin/traffic'}
            />
            <SidebarItem
              href="/admin/promotions"
              icon="TicketIcon"
              label="Promotions"
              active={pathname === '/admin/promotions'}
            />
            <SidebarItem
              href="/admin/coupons"
              icon="BanknotesIcon"
              label="Coupon Codes"
              active={pathname === '/admin/coupons'}
            />
            <SidebarItem
              href="/admin/inventory"
              icon="CubeIcon"
              label="Inventory Hub"
              active={pathname === '/admin/inventory'}
            />
            <SidebarItem
              href="/admin/staff"
              icon="UserGroupIcon"
              label="Staff Management"
              active={pathname === '/admin/staff'}
            />
            <SidebarItem
              href="/admin/inventory-logs"
              icon="ClockIcon"
              label="Inventory Logs"
              active={pathname === '/admin/inventory-logs'}
            />
            <SidebarItem
              href="/admin/payments"
              icon="CreditCardIcon"
              label="Payment Methods"
              active={pathname === '/admin/payments'}
            />
            <SidebarItem
              href="/admin/settings"
              icon="Cog6ToothIcon"
              label="Store Settings"
              active={pathname === '/admin/settings'}
            />
          </div>
        </nav>

        <div className="p-6 border-t border-border flex-shrink-0">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive transition-smooth hover:bg-destructive/15"
          >
            <Icon name="ArrowLeftOnRectangleIcon" size={20} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <header className="sticky top-0 z-30 flex h-16 flex-shrink-0 items-center justify-between border-b border-border bg-card/80 px-4 md:px-8 backdrop-blur-md">
          <div className="flex items-center gap-4 overflow-hidden">
             <button 
                onClick={() => setIsSidebarOpen(true)}
                className="lg:hidden p-2 rounded-lg bg-muted text-muted-foreground mr-1"
             >
                <Icon name="Bars3Icon" size={24} />
             </button>
              <h1 className="text-base font-bold tracking-tight text-foreground sm:text-xl truncate">
                {(() => {
                  if (pathname === '/admin') return 'Overview';
                  if (pathname.includes('products/new')) return 'Add Product';
                  if (pathname.includes('categories')) return 'Categories';
                  if (pathname.includes('orders')) return 'Orders';
                  return 'Seller Admin';
                })()}
              </h1>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <button 
              onClick={() => setIsChangingAdminPassword(true)}
              className="flex items-center gap-2 rounded-xl bg-muted px-3 py-2 text-sm font-medium text-foreground transition-smooth hover:bg-primary/10 hover:text-primary sm:px-4"
            >
              <Icon name="KeyIcon" size={18} />
              <span className="hidden sm:inline">Reset Password</span>
            </button>
            <div className="flex items-center gap-3 border-l border-border pl-2 sm:pl-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-foreground leading-none">Admin Seller</p>
                <p className="text-[10px] text-muted-foreground mt-1">Store Owner</p>
              </div>
              <div className="h-9 w-9 overflow-hidden rounded-lg bg-primary/20 text-primary flex items-center justify-center font-bold sm:h-10 sm:w-10">
                A
              </div>
            </div>
            <button 
              onClick={handleLogout}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-destructive/10 text-destructive transition-smooth hover:bg-destructive hover:text-white sm:h-10 sm:w-10"
              title="Sign Out"
            >
              <Icon name="ArrowLeftOnRectangleIcon" size={20} />
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-8 scrollbar-hide">
          {children}
        </main>
      </div>

      {/* Admin Change Password Modal */}
      {isChangingAdminPassword && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-card p-8 shadow-warm-lg border border-border">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="font-heading text-xl font-bold text-foreground tracking-tight">Update Admin Password</h3>
              <button 
                onClick={() => {
                  setIsChangingAdminPassword(false);
                  setAdminPassword('');
                }}
                className="p-1 rounded-lg hover:bg-muted text-muted-foreground"
              >
                <Icon name="XMarkIcon" size={20} />
              </button>
            </div>
            
            <p className="text-sm text-muted-foreground mb-6">
              Security update for administrative access.
            </p>

            <div className="space-y-4">
              <div>
                <label htmlFor="admin-new-password" className="block text-sm font-medium text-foreground mb-1.5">New Admin Password</label>
                <div className="relative">
                  <Icon name="LockClosedIcon" size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    id="admin-new-password"
                    type="password"
                    placeholder="Enter new admin password"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    className="w-full rounded-xl border border-input bg-background/50 py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>
              
              <div className="flex gap-3 mt-8 pt-4 border-t border-border">
                <button
                  onClick={() => {
                    setIsChangingAdminPassword(false);
                    setAdminPassword('');
                  }}
                  className="flex-1 rounded-xl border border-border py-2.5 text-sm font-medium hover:bg-muted transition-smooth"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (adminPassword.length < 8) {
                      globalThis.alert('Admin password must be at least 8 characters for security');
                      return;
                    }
                    // Mock update
                    globalThis.alert('Admin password has been updated securely.');
                    setIsChangingAdminPassword(false);
                    setAdminPassword('');
                  }}
                  className="flex-1 rounded-xl bg-primary py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-smooth"
                >
                  Update Admin
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
