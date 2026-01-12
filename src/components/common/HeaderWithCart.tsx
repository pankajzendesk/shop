'use client';

import Header from '@/components/common/Header';
import { useCart } from '@/app/providers/CartProvider';
import { useAuth } from '@/app/providers/AuthProvider';

export default function HeaderWithCart() {
  const { itemCount, total } = useCart();
  const { isAuthenticated, user, logout } = useAuth();

  return (
    <Header
      cartItemCount={itemCount}
      cartTotal={total}
      isAuthenticated={isAuthenticated}
      userName={user?.name}
      userAvatar={user?.avatar}
      onLogout={logout}
    />
  );
}
