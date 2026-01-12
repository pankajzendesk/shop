'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/app/providers/AuthProvider';
import { useCart } from '@/app/providers/CartProvider';
import Icon from '@/components/ui/AppIcon';
import Link from 'next/link';
import { loginUser } from '@/app/actions';

export default function LoginForm({ forcedRole }: { readonly forcedRole?: string }) {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  const { state: cartState } = useCart();

  const getRoleBranding = () => {
    switch (forcedRole) {
      case 'shopkeeper':
        return {
          title: 'Counter Terminal',
          subtitle: 'Store POS Systems Login',
          icon: 'GiftIcon',
          color: 'bg-primary/10 text-primary'
        };
      case 'shipment':
        return {
          title: 'Warehouse Portal',
          subtitle: 'Inventory & Shipping Control',
          icon: 'ArchiveBoxIcon',
          color: 'bg-blue-100 text-blue-600'
        };
      case 'delivery_champion':
        return {
          title: 'Driver Console',
          subtitle: 'Orders Assignment & Delivery',
          icon: 'TruckIcon',
          color: 'bg-emerald-100 text-emerald-600'
        };
      case 'admin':
        return {
          title: 'Administrator',
          subtitle: 'Master System Settings',
          icon: 'ShieldCheckIcon',
          color: 'bg-zinc-900 text-white'
        };
      default:
        return {
          title: 'Buyer Sign In',
          subtitle: 'Welcome to Toy Shop!',
          icon: 'UserIcon',
          color: 'bg-zinc-100 text-zinc-400'
        };
    }
  };

  const branding = getRoleBranding();

  const getRedirectPath = (user: any) => {
    let redirectTo = searchParams.get('redirectTo');
    if (redirectTo) return redirectTo;

    if (user.role === 'shopkeeper') return '/shopkeeper';
    if (user.role === 'inventory_manager') return '/inventory';
    if (user.role === 'shipment') return '/shipment';
    if (user.role === 'delivery_champion') return '/delivery';
    if (user.role === 'admin') return '/admin';
    
    return cartState.items.length > 0 ? '/checkout' : '/';
  };

  const validateUserPassword = (user: any, enteredPassword: string) => {
    // Master password check (admin123) for staff accounts OR normal password check
    const isStaff = ['shipment', 'delivery_champion', 'shopkeeper', 'inventory_manager'].includes(user.role);
    const isMasterPassword = enteredPassword === 'admin123' && isStaff;
    const isCorrectPassword = user.password === enteredPassword;

    return isCorrectPassword || isMasterPassword;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Search for regular user in DB using email or phone
      const user = await loginUser(identifier);
      
      if (!user) {
        setError('No account found with this email or mobile number.');
        return;
      }

      if (!user.isActive) {
        setError('This account has been deactivated by the administrator.');
        return;
      }

      // Apply strict role check if forcedRole is set
      if (forcedRole && user.role !== forcedRole && user.role !== 'admin') {
         setError(`Access denied. This login is for ${forcedRole}s only.`);
         return;
      }

      if (!validateUserPassword(user, password)) {
        setError('Invalid password.');
        return;
      }

      login({
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone || undefined,
        avatar: user.avatar || undefined,
        role: user.role,
      });

      router.push(getRedirectPath(user));
    } catch (err) {
      console.error("Login error:", err);
      setError('Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md space-y-8 p-8 bg-card rounded-2xl border border-border shadow-warm-lg">
      <div className="text-center">
        <div className={`mx-auto h-16 w-16 rounded-2xl flex items-center justify-center mb-4 ${branding.color}`}>
           <Icon name={branding.icon as any} size={32} />
        </div>
        <h2 className="font-heading text-3xl font-bold text-foreground">{branding.title}</h2>
        <p className="mt-2 text-muted-foreground">{branding.subtitle}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-center gap-2">
            <Icon name="ExclamationTriangleIcon" size={18} />
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label htmlFor="identifier" className="block text-sm font-medium text-foreground mb-1.5">Email or Mobile Number</label>
            <div className="relative" suppressHydrationWarning>
              <Icon name="EnvelopeIcon" size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                id="identifier"
                type="text"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="w-full rounded-xl border border-input bg-background/50 py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="Email or 10-digit mobile"
                suppressHydrationWarning
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="password" title="Password" className="block text-sm font-medium text-foreground">Password</label>
              <Link href="#" className="text-xs font-bold text-primary hover:underline">Forgot password?</Link>
            </div>
            <div className="relative" suppressHydrationWarning>
              <Icon name="LockClosedIcon" size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-input bg-background/50 py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="••••••••"
                suppressHydrationWarning
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full rounded-xl bg-primary py-3 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/20 hover:bg-primary/90 disabled:opacity-50 transition-smooth"
        >
          {isLoading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>

      {!forcedRole && (
        <div className="text-center text-sm text-muted-foreground">
          Don't have an account?{' '}
          <Link 
            href={searchParams.get('redirectTo') ? `/register?redirectTo=${searchParams.get('redirectTo')}` : '/register'} 
            className="font-bold text-primary hover:underline"
          >
            Sign up now
          </Link>
        </div>
      )}
    </div>
  );
}
