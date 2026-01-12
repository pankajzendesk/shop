'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/providers/AuthProvider';
import { useCart } from '@/app/providers/CartProvider';
import LoginForm from './LoginForm';
import FeaturedProductsPanel from './FeaturedProductsPanel';

interface LoginInteractiveProps {
  initialFeaturedProducts: any[];
  role?: string;
}

const LoginInteractive = ({ initialFeaturedProducts, role }: LoginInteractiveProps) => {
  const { user } = useAuth();
  const { state: cartState } = useCart();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      const searchParams = new URLSearchParams(globalThis.location.search);
      let redirectTo = searchParams.get('redirectTo');

      // Role-based redirection if no specific redirect is set
      if (!redirectTo) {
        if (user.role === 'admin') redirectTo = '/admin';
        else if (user.role === 'shipment') redirectTo = '/shipment';
        else if (user.role === 'delivery_champion') redirectTo = '/delivery';
        else if (user.role === 'shopkeeper') redirectTo = '/shopkeeper';
        else redirectTo = cartState.items.length > 0 ? '/checkout' : '/';
      }

      router.replace(redirectTo);
    }
  }, [user, cartState.items.length, router]);

  if (user) return null;

  const isStaffLogin = role && ['shopkeeper', 'shipment', 'delivery_champion', 'admin'].includes(role);

  return (
    <div className={`flex min-h-[calc(100vh-80px)] items-center justify-center p-6 ${isStaffLogin ? 'bg-zinc-50' : ''}`}>
      <div className={`grid w-full grid-cols-1 items-start justify-center gap-10 ${isStaffLogin ? 'max-w-[500px]' : 'max-w-[1000px] md:grid-cols-2'}`}>
        <div className="flex w-full justify-center">
          <LoginForm forcedRole={role} />
        </div>
        {!isStaffLogin && (
          <div className="flex w-full justify-center">
            <FeaturedProductsPanel initialProducts={initialFeaturedProducts} />
          </div>
        )}
      </div>
    </div>
  );
};

export default LoginInteractive;
