'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Icon from '@/components/ui/AppIcon';
import AppImage from '@/components/ui/AppImage';
import Notification from '@/components/ui/Notification';

export default function AdminLoginPage() {
  const router = useRouter();
  const [isHydrated, setIsHydrated] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMsg, setNotificationMsg] = useState('');
  const [notificationType, setNotificationType] = useState<'success' | 'error'>('success');

  useEffect(() => {
    setIsHydrated(true);
    // Check if already logged in as admin
    const isAdmin = localStorage.getItem('isAdmin');
    if (isAdmin === 'true') {
      router.push('/admin');
    }
  }, [router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Mock admin credentials
    setTimeout(() => {
      if (email === 'admin@seller.sh' && password === 'admin123') {
        localStorage.setItem('isAdmin', 'true');
        setNotificationMsg('Admin login successful! Redirecting...');
        setNotificationType('success');
        setShowNotification(true);
        setTimeout(() => {
          router.push('/admin');
        }, 1500);
      } else {
        setNotificationMsg('Invalid admin credentials.');
        setNotificationType('error');
        setShowNotification(true);
      }
      setIsLoading(false);
    }, 1500);
  };

  if (!isHydrated) return null;

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-6 py-12">
      <Notification
        message={notificationMsg}
        isVisible={showNotification}
        onClose={() => setShowNotification(false)}
        type={notificationType}
      />
      
      <div className="w-full max-w-md overflow-hidden rounded-2xl bg-card shadow-warm-xl">
        <div className="bg-primary px-8 py-10 text-center text-primary-foreground">
          <div className="mb-4 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm relative overflow-hidden">
              {process.env.NEXT_PUBLIC_SHOP_LOGO_PATH ? (
                <AppImage 
                  src={process.env.NEXT_PUBLIC_SHOP_LOGO_PATH} 
                  alt="Shop Logo" 
                  fill 
                  className="object-contain p-2"
                />
              ) : (
                <Icon name="ShieldCheckIcon" size={32} />
              )}
            </div>
          </div>
          <h1 className="font-heading text-2xl font-bold">{process.env.NEXT_PUBLIC_SHOP_NAME || 'GiftShop'} Admin</h1>
          <p className="mt-2 text-primary-foreground/80 text-sm">
            Seller access only. Please sign in to manage your shop.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-8">
          <div className="space-y-6">
            <div>
              <label htmlFor="email" className="mb-2 block text-sm font-medium text-foreground">
                Admin Email
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-muted-foreground">
                  <Icon name="EnvelopeIcon" size={18} />
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-input bg-background py-3 pl-11 pr-4 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-smooth"
                  placeholder="admin@seller.sh"
                  required
                />
              </div>
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <label htmlFor="password" className="block text-sm font-medium text-foreground">
                  Password
                </label>
              </div>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-muted-foreground">
                  <Icon name="LockClosedIcon" size={18} />
                </div>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-input bg-background py-3 pl-11 pr-4 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-smooth"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-primary py-4 font-bold text-primary-foreground transition-smooth hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isLoading ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
              ) : (
                <>
                  <span>Sign In as Seller</span>
                  <Icon name="ArrowRightIcon" size={18} className="transition-transform group-hover:translate-x-1" />
                </>
              )}
            </button>
          </div>

          <div className="mt-8 border-t border-border pt-6 text-center">
            <Link 
              href="/login" 
              className="text-sm font-medium text-muted-foreground transition-smooth hover:text-primary flex items-center justify-center gap-2"
            >
              <Icon name="UserIcon" size={16} />
              <span>Back to Buyer Login</span>
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
