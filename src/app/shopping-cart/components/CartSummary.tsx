'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Icon from '@/components/ui/AppIcon';
import { useAuth } from '@/app/providers/AuthProvider';

interface CartSummaryProps {
  subtotal: number;
  tax: number;
  shipping: number;
  discount: number;
  total: number;
  onApplyCoupon: (code: string) => void;
  onRemoveCoupon: () => void;
  appliedCoupon?: {
    code: string;
    discount: number;
    type: string;
  } | null;
}

const CartSummary = ({
  subtotal,
  tax,
  shipping,
  discount,
  total,
  onApplyCoupon,
  onRemoveCoupon,
  appliedCoupon,
}: CartSummaryProps) => {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [couponCode, setCouponCode] = useState('');
  const [isApplying, setIsApplying] = useState(false);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;

    setIsApplying(true);
    await new Promise((resolve) => setTimeout(resolve, 500));
    onApplyCoupon(couponCode);
    setIsApplying(false);
  };

  const handleCheckout = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isAuthenticated) {
      router.push('/checkout');
    } else {
      router.push('/login?redirectTo=/shopping-cart');
    }
  };

  return (
    <div className="sticky top-20 rounded-lg border border-border bg-card p-6 shadow-warm-md">
      <h2 className="mb-6 font-heading text-xl font-semibold text-card-foreground">
        Order Summary
      </h2>

      <div className="mb-6 space-y-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Subtotal</span>
          <span className="font-mono font-medium text-card-foreground">
            {formatPrice(subtotal)}
          </span>
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Shipping</span>
          <span className="font-mono font-medium text-card-foreground">
            {shipping === 0 ? 'FREE' : formatPrice(shipping)}
          </span>
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Tax</span>
          <span className="font-mono font-medium text-card-foreground">{formatPrice(tax)}</span>
        </div>

        {discount > 0 && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-success">Discount</span>
            <span className="font-mono font-medium text-success">-{formatPrice(discount)}</span>
          </div>
        )}

        <div className="border-t border-border pt-4">
          <div className="flex items-center justify-between">
            <span className="font-heading text-lg font-semibold text-card-foreground">Total</span>
            <span className="font-mono text-2xl font-bold text-primary">{formatPrice(total)}</span>
          </div>
        </div>
      </div>

            {appliedCoupon ? (
        <div className="mb-6 rounded-lg bg-success/5 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-success">
              <Icon name="TagIcon" size={20} />
              <span className="text-sm font-semibold uppercase tracking-wider">
                {appliedCoupon.code} Applied
              </span>
            </div>
            <button
              onClick={onRemoveCoupon}
              className="text-muted-foreground transition-smooth hover:text-rose-500"
            >
              <Icon name="XMarkIcon" size={16} />
            </button>
          </div>
          <p className="mt-1 text-xs text-success">
            Extra savings applied to your order!
          </p>
        </div>
      ) : (
        <div className="mb-6">
          <label
            htmlFor="coupon-code"
            className="mb-2 block text-sm font-medium text-card-foreground"
          >
            Coupon Code
          </label>
          <div className="flex gap-2">
            <input
              id="coupon-code"
              type="text"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
              placeholder="Enter code"
              className="flex-1 rounded-lg border border-input bg-background px-3 py-2 text-sm transition-smooth focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <button
              onClick={handleApplyCoupon}
              disabled={isApplying || !couponCode.trim()}
              className="rounded-lg bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground transition-smooth hover:bg-secondary/90 shadow-warm-sm disabled:opacity-50"
            >
              {isApplying ? 'Applying...' : 'Apply'}
            </button>
          </div>
        </div>
      )}

      <button
        onClick={handleCheckout}
        className="mb-3 flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-6 py-4 font-medium text-primary-foreground transition-smooth hover:bg-primary/90"
      >
        <span>Proceed to Checkout</span>
        <Icon name="ArrowRightIcon" size={20} />
      </button>

      <Link
        href="/product-catalog"
        className="flex w-full items-center justify-center gap-2 rounded-lg border border-border bg-background px-6 py-3 font-medium text-foreground transition-smooth hover:bg-muted"
      >
        <Icon name="ArrowLeftIcon" size={20} />
        <span>Continue Shopping</span>
      </Link>

      <div className="mt-6 space-y-3 border-t border-border pt-6">
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <Icon name="ShieldCheckIcon" size={20} className="text-success" />
          <span>Secure checkout guaranteed</span>
        </div>
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <Icon name="TruckIcon" size={20} className="text-primary" />
          <span>Free shipping on orders over ₹500</span>
        </div>
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <Icon name="ArrowPathIcon" size={20} className="text-secondary" />
          <span>30-day return policy</span>
        </div>
      </div>
    </div>
  );
};

export default CartSummary;
