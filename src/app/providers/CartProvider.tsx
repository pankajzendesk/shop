'use client';

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import Notification from '@/components/ui/Notification';
import {
  addItem,
  applyCouponLocal,
  calculateCartItemCount,
  calculateCartTotal,
  clearCart,
  emptyCartState,
  loadCartFromStorage,
  removeItem,
  removeCouponLocal,
  saveCartToStorage,
  updateQuantity,
  type CartItem,
  type CartState,
} from '@/lib/cart';

type CartContextValue = {
  state: CartState;
  itemCount: number;
  total: number;
  addToCart: (item: Omit<CartItem, 'quantity'>, quantity?: number) => void;
  setQuantity: (id: string, quantity: number) => void;
  removeFromCart: (id: string) => void;
  applyCoupon: (coupon: any) => void;
  removeCoupon: () => void;
  clear: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  const [state, setState] = useState<CartState>(emptyCartState());
  const [isHydrated, setIsHydrated] = useState(false);
  const [notification, setNotification] = useState<{ isVisible: boolean; message: string }>({
    isVisible: false,
    message: '',
  });

  useEffect(() => {
    setState(loadCartFromStorage());
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    saveCartToStorage(state);
  }, [state, isHydrated]);

  const value = useMemo<CartContextValue>(() => {
    const itemCount = calculateCartItemCount(state);
    const total = calculateCartTotal(state);

    return {
      state,
      itemCount,
      total,
      addToCart: (item, quantity) => {
        setState((prev) => addItem(prev, item, quantity));
        setNotification({
          isVisible: true,
          message: `${item.name} added to cart!`,
        });
      },
      setQuantity: (id, quantity) => setState((prev) => updateQuantity(prev, id, quantity)),
      removeFromCart: (id) => setState((prev) => removeItem(prev, id)),
      applyCoupon: (coupon) => setState((prev) => applyCouponLocal(prev, coupon)),
      removeCoupon: () => setState((prev) => removeCouponLocal(prev)),
      clear: () => setState(clearCart()),
    };
  }, [state]);

  return (
    <CartContext.Provider value={value}>
      {children}
      <Notification
        isVisible={notification.isVisible}
        message={notification.message}
        onClose={() => setNotification({ ...notification, isVisible: false })}
      />
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error('useCart must be used within CartProvider');
  }
  return ctx;
}
