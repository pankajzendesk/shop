'use client';

import { useState, useEffect } from 'react';
import CartItemCard from './CartItemCard';
import CartSummary from './CartSummary';
import EmptyCart from './EmptyCart';
import RecommendedProducts from './RecommendedProducts';
import SavedForLater from './SavedForLater';
import Icon from '@/components/ui/AppIcon';
import Notification from '@/components/ui/Notification';
import { useCart } from '@/app/providers/CartProvider';
import { validateCoupon } from '@/app/actions';

interface CartItem {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  quantity: number;
  maxQuantity: number;
  image: string;
  alt: string;
  variant?: string;
  inStock: boolean;
  estimatedDelivery?: string;
}

interface SavedItem {
  id: string;
  name: string;
  price: number;
  image: string;
  alt: string;
  inStock: boolean;
}

interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  alt: string;
  rating: number;
  reviews: number;
}

const ShoppingCartInteractive = () => {
  const [isHydrated, setIsHydrated] = useState(false);
  const { state, addToCart, setQuantity, removeFromCart, clear, applyCoupon, removeCoupon } = useCart();
  const [savedItems, setSavedItems] = useState<SavedItem[]>([]);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  
  const appliedCoupon = state.appliedCoupon;

  useEffect(() => {
    setIsHydrated(true);
    setSavedItems([]);
  }, []);

  const cartItems: CartItem[] = state.items.map((item) => ({
    id: item.id,
    name: item.name,
    price: item.price,
    quantity: item.quantity,
    maxQuantity: 99,
    image: item.image || '/assets/images/no_image.svg',
    alt: item.alt || item.name,
    inStock: true,
    estimatedDelivery: 'Jan 12, 2026',
  }));

  const recommendedProducts: Product[] = [];  const handleQuantityChange = (id: string, newQuantity: number) => {
    setQuantity(id, newQuantity);
    showNotificationMessage('Cart updated successfully');
  };

  const handleRemoveItem = (id: string) => {
    removeFromCart(id);
    showNotificationMessage('Item removed from cart');
  };

  const handleSaveForLater = (id: string) => {
    const item = cartItems.find((i) => i.id === id);
    if (item) {
      setSavedItems((prev) => [
        ...prev,
        {
          id: item.id,
          name: item.name,
          price: item.price,
          image: item.image,
          alt: item.alt,
          inStock: item.inStock,
        },
      ]);
      removeFromCart(id);
      showNotificationMessage('Item saved for later');
    }
  };

  const handleMoveToCart = (id: string) => {
    const item = savedItems.find((i) => i.id === id);
    if (item?.inStock) {
      addToCart(
        {
          id: item.id,
          name: item.name,
          price: item.price,
          image: item.image,
          alt: item.alt,
        },
        1
      );
      setSavedItems((prev) => prev.filter((i) => i.id !== id));
      showNotificationMessage('Item moved to cart');
    }
  };

  const handleRemoveSaved = (id: string) => {
    setSavedItems((prev) => prev.filter((item) => item.id !== id));
    showNotificationMessage('Item removed from saved items');
  };

  const handleClearCart = () => {
    clear();
    showNotificationMessage('Cart cleared');
  };

  const handleApplyCoupon = async (code: string) => {
    try {
      const result = await validateCoupon(code);
      if (result.valid) {
        applyCoupon(result.coupon);
        showNotificationMessage(`Coupon "${code}" applied successfully!`);
      } else {
        showNotificationMessage(result.message || 'Invalid coupon code');
      }
    } catch (error) {
      console.error('Coupon validation error:', error);
      showNotificationMessage('Error validating coupon.');
    }
  };

  const handleRemoveCoupon = () => {
    removeCoupon();
    showNotificationMessage('Coupon removed');
  };

  const showNotificationMessage = (message: string) => {
    setNotificationMessage(message);
    setShowNotification(true);
  };

  const calculateSubtotal = () => {
    return cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  const calculateDiscount = () => {
    if (!appliedCoupon) return 0;
    const subtotal = calculateSubtotal();
    if (appliedCoupon.type === 'percentage') {
      return subtotal * (appliedCoupon.discount / 100);
    }
    return appliedCoupon.discount;
  };

  const calculateTax = () => {
    const subtotal = calculateSubtotal();
    const discount = calculateDiscount();
    return (subtotal - discount) * 0.18; // 18% GST estimate
  };

  const calculateShipping = () => {
    const subtotal = calculateSubtotal();
    if (appliedCoupon?.code === 'FREESHIP' || subtotal > 500) return 0;
    return 40;
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const discount = calculateDiscount();
    const tax = calculateTax();
    const shipping = calculateShipping();
    return subtotal - discount + tax + shipping;
  };

  if (!isHydrated) {
    return (
      <div className="mx-auto max-w-[1440px] px-6 py-8">
        <div className="mb-8 h-10 w-48 animate-pulse rounded-lg bg-muted" />
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 animate-pulse rounded-lg bg-muted" />
            ))}
          </div>
          <div className="h-96 animate-pulse rounded-lg bg-muted" />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1440px] px-6 py-8">
      <Notification
        isVisible={showNotification}
        message={notificationMessage}
        onClose={() => setShowNotification(false)}
      />

      <div className="mb-8 flex items-center justify-between">
        <h1 className="font-heading text-3xl font-bold text-foreground md:text-4xl">
          Shopping Cart
        </h1>
        <div className="flex items-center gap-4">
          {cartItems.length > 0 && (
            <span className="text-lg text-muted-foreground">
              {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'}
            </span>
          )}

          <button
            onClick={handleClearCart}
            className="inline-flex items-center gap-2 rounded-lg bg-muted px-4 py-2 text-sm font-medium text-foreground transition-smooth hover:bg-muted/80"
          >
            <Icon name="TrashIcon" size={18} />
            <span>Clear</span>
          </button>
        </div>
      </div>

      {cartItems.length === 0 ? (
        <EmptyCart />
      ) : (
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
            {cartItems.map((item) => (
              <CartItemCard
                key={item.id}
                item={item}
                onQuantityChange={handleQuantityChange}
                onRemove={handleRemoveItem}
                onSaveForLater={handleSaveForLater}
              />
            ))}
          </div>

          <div>
            <CartSummary
              subtotal={calculateSubtotal()}
              tax={calculateTax()}
              shipping={calculateShipping()}
              discount={calculateDiscount()}
              total={calculateTotal()}
              onApplyCoupon={handleApplyCoupon}
              onRemoveCoupon={handleRemoveCoupon}
              appliedCoupon={appliedCoupon}
            />
          </div>
        </div>
      )}

      {savedItems.length > 0 && (
        <div className="mt-12">
          <SavedForLater
            items={savedItems}
            onMoveToCart={handleMoveToCart}
            onRemove={handleRemoveSaved}
          />
        </div>
      )}

      <div className="mt-12">
        <RecommendedProducts products={recommendedProducts} />
      </div>
    </div>
  );
};

export default ShoppingCartInteractive;
