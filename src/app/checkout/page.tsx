'use client';

import HeaderWithCart from '@/components/common/HeaderWithCart';
import CheckoutInteractive from './components/CheckoutInteractive';
import { useAuth } from '@/app/providers/AuthProvider';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function CheckoutPage() {
  const { isAuthenticated, isInitialized } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Only redirect if we are sure the initialization is complete
    // and there really is no user.
    if (isInitialized && !isAuthenticated) {
      const timer = setTimeout(() => {
        // Double check after a small delay to avoid race conditions during state propagation
        if (!isAuthenticated) {
          router.push('/login?redirectTo=/checkout');
        }
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, isInitialized, router]);

  if (!isInitialized || (!isAuthenticated && globalThis.window !== undefined)) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <>
      <HeaderWithCart />
      <CheckoutInteractive />
    </>
  );
}
