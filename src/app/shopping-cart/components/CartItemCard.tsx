'use client';

import { useState } from 'react';
import Icon from '@/components/ui/AppIcon';
import AppImage from '@/components/ui/AppImage';

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

interface CartItemCardProps {
  item: CartItem;
  onQuantityChange: (id: string, newQuantity: number) => void;
  onRemove: (id: string) => void;
  onSaveForLater: (id: string) => void;
}

const CartItemCard = ({ item, onQuantityChange, onRemove, onSaveForLater }: CartItemCardProps) => {
  const [isUpdating, setIsUpdating] = useState(false);

  const handleQuantityChange = async (newQuantity: number) => {
    if (newQuantity < 1 || newQuantity > item.maxQuantity) return;

    setIsUpdating(true);
    await new Promise((resolve) => setTimeout(resolve, 300));
    onQuantityChange(item.id, newQuantity);
    setIsUpdating(false);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="group relative rounded-lg border border-border bg-card p-3 transition-smooth hover:shadow-warm-md md:p-6">
      <div className="flex flex-row gap-4 md:gap-6">
        <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg bg-muted md:h-40 md:w-40">
          <AppImage
            src={item.image}
            alt={item.alt}
            fill
            className="object-cover transition-smooth group-hover:scale-105"
          />
          {!item.inStock && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/60">
              <span className="rounded-md bg-error px-3 py-1 text-sm font-semibold text-error-foreground">
                Out of Stock
              </span>
            </div>
          )}
        </div>

        <div className="flex flex-1 flex-col">
          <div className="mb-2 flex items-start justify-between gap-4">
            <div className="flex-1">
              <h3 className="mb-1 font-heading text-lg font-semibold text-card-foreground line-clamp-2">
                {item.name}
              </h3>
              {item.variant && (
                <p className="text-sm text-muted-foreground">Variant: {item.variant}</p>
              )}
            </div>
            <button
              onClick={() => onRemove(item.id)}
              className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md text-muted-foreground transition-smooth hover:bg-error/10 hover:text-error"
              aria-label={`Remove ${item.name} from cart`}
            >
              <Icon name="TrashIcon" size={20} />
            </button>
          </div>

          <div className="mb-3 flex items-center gap-2">
            <span className="font-mono text-xl font-bold text-primary">
              {formatPrice(item.price)}
            </span>
            {item.originalPrice && item.originalPrice > item.price && (
              <span className="font-mono text-sm text-muted-foreground line-through">
                {formatPrice(item.originalPrice)}
              </span>
            )}
          </div>

          {item.estimatedDelivery && item.inStock && (
            <div className="mb-3 flex items-center gap-2 text-sm text-success">
              <Icon name="TruckIcon" size={16} />
              <span>Estimated delivery: {item.estimatedDelivery}</span>
            </div>
          )}

          {!item.inStock && (
            <div className="mb-3 flex items-center gap-2 text-sm text-error">
              <Icon name="ExclamationTriangleIcon" size={16} />
              <span>Currently unavailable</span>
            </div>
          )}

          <div className="mt-auto flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-card-foreground">Quantity:</span>
              <div className="flex items-center rounded-lg border border-border bg-background">
                <button
                  onClick={() => handleQuantityChange(item.quantity - 1)}
                  disabled={item.quantity <= 1 || isUpdating || !item.inStock}
                  className="flex h-10 w-10 items-center justify-center text-card-foreground transition-smooth hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
                  aria-label="Decrease quantity"
                >
                  <Icon name="MinusIcon" size={16} />
                </button>
                <span className="flex h-10 w-12 items-center justify-center font-mono text-sm font-semibold text-card-foreground">
                  {item.quantity}
                </span>
                <button
                  onClick={() => handleQuantityChange(item.quantity + 1)}
                  disabled={item.quantity >= item.maxQuantity || isUpdating || !item.inStock}
                  className="flex h-10 w-10 items-center justify-center text-card-foreground transition-smooth hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
                  aria-label="Increase quantity"
                >
                  <Icon name="PlusIcon" size={16} />
                </button>
              </div>
            </div>

            <button
              onClick={() => onSaveForLater(item.id)}
              className="flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium text-muted-foreground transition-smooth hover:bg-muted hover:text-foreground"
            >
              <Icon name="HeartIcon" size={16} />
              <span>Save for Later</span>
            </button>
          </div>

          {item.quantity >= item.maxQuantity && (
            <p className="mt-2 text-xs text-warning">
              Maximum available quantity: {item.maxQuantity}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default CartItemCard;
