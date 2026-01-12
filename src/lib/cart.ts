export type CartItem = {
  id: string;
  name: string;
  price: number;
  image?: string;
  alt?: string | null;
  quantity: number;
};

export type CartState = {
  items: CartItem[];
  appliedCoupon?: {
    code: string;
    discount: number;
    type: string;
  } | null;
};

export const CART_STORAGE_KEY = 'toyshop.cart.v2';

export const emptyCartState = (): CartState => ({ items: [], appliedCoupon: null });

export const calculateCartItemCount = (state: CartState): number =>
  state.items.reduce((sum, item) => sum + item.quantity, 0);

export const calculateCartTotal = (state: CartState): number =>
  state.items.reduce((sum, item) => sum + item.price * item.quantity, 0);

export const addItem = (
  state: CartState,
  item: Omit<CartItem, 'quantity'>,
  quantity = 1
): CartState => {
  const nextQty = Math.max(1, quantity);
  const existing = state.items.find((i) => i.id === item.id);
  if (existing) {
    return {
      ...state,
      items: state.items.map((i) =>
        i.id === item.id ? { ...i, quantity: i.quantity + nextQty } : i
      ),
    };
  }
  return { ...state, items: [...state.items, { ...item, quantity: nextQty }] };
};

export const updateQuantity = (state: CartState, id: string, quantity: number): CartState => {
  const nextQty = Math.max(0, quantity);
  if (nextQty === 0) {
    return { ...state, items: state.items.filter((i) => i.id !== id) };
  }
  return {
    ...state,
    items: state.items.map((i) => (i.id === id ? { ...i, quantity: nextQty } : i)),
  };
};

export const applyCouponLocal = (state: CartState, coupon: any): CartState => {
  return { ...state, appliedCoupon: coupon };
};

export const removeCouponLocal = (state: CartState): CartState => {
  return { ...state, appliedCoupon: null };
};

export const removeItem = (state: CartState, id: string): CartState => ({
  ...state,
  items: state.items.filter((i) => i.id !== id),
});

export const clearCart = (): CartState => emptyCartState();

export const loadCartFromStorage = (): CartState => {
  if (globalThis.window === undefined) return emptyCartState();
  
  try {
    const raw = globalThis.window.localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) return emptyCartState();
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load cart from storage', e);
    return emptyCartState();
  }
};

export const saveCartToStorage = (state: CartState) => {
  if (globalThis.window === undefined) return;
  
  try {
    globalThis.window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('Failed to save cart to storage', e);
  }
};
