'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Icon from '@/components/ui/AppIcon';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

interface CartStatusIndicatorProps {
  itemCount?: number;
  total?: number;
  recentItems?: CartItem[];
  className?: string;
}

const CartStatusIndicator = ({
  itemCount = 0,
  total = 0,
  recentItems = [],
  className = '',
}: CartStatusIndicatorProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        buttonRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  if (itemCount === 0) {
    return (
      <div className={`flex items-center gap-2 rounded-lg bg-muted px-4 py-2 ${className}`}>
        <Icon name="ShoppingCartIcon" size={20} className="text-muted-foreground" />
        <span className="text-sm font-medium text-muted-foreground">Cart Empty</span>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        onMouseEnter={() => setIsOpen(true)}
        className="flex items-center gap-3 rounded-lg bg-muted px-4 py-2 transition-smooth hover:bg-muted/80"
        aria-label="View cart summary"
        aria-expanded={isOpen}
      >
        <Icon name="ShoppingBagIcon" size={20} className="text-primary" />
        <div className="flex flex-col items-start">
          <span className="text-xs font-medium text-muted-foreground">
            {itemCount} {itemCount === 1 ? 'item' : 'items'}
          </span>
          <span className="font-mono text-sm font-semibold text-foreground">
            {formatPrice(total)}
          </span>
        </div>
        <Icon
          name="ChevronDownIcon"
          size={16}
          className={`text-muted-foreground transition-smooth ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <aside
          ref={dropdownRef}
          onMouseLeave={() => setIsOpen(false)}
          className="absolute right-0 top-full z-1010 mt-2 w-80 animate-slide-down rounded-lg bg-popover shadow-warm-lg"
          aria-label="Cart summary dropdown"
        >
          <div className="p-4">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-heading text-lg font-semibold text-popover-foreground">
                Cart Summary
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-smooth hover:bg-muted hover:text-foreground"
                aria-label="Close cart summary"
              >
                <Icon name="XMarkIcon" size={20} />
              </button>
            </div>

            {recentItems.length > 0 ? (
              <div className="mb-4 space-y-3">
                {recentItems.slice(0, 3).map((item) => (
                  <div key={item.id} className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-md bg-muted">
                      <Icon name="CubeIcon" size={20} className="text-muted-foreground" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-popover-foreground line-clamp-1">
                        {item.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Qty: {item.quantity} × {formatPrice(item.price)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mb-4 py-8 text-center">
                <Icon
                  name="ShoppingCartIcon"
                  size={48}
                  className="mx-auto mb-2 text-muted-foreground"
                />
                <p className="text-sm text-muted-foreground">No recent items</p>
              </div>
            )}

            <div className="mb-4 border-t border-border pt-3">
              <div className="flex items-center justify-between">
                <span className="font-medium text-popover-foreground">Total</span>
                <span className="font-mono text-lg font-bold text-primary">
                  {formatPrice(total)}
                </span>
              </div>
            </div>

            <Link
              href="/shopping-cart"
              onClick={() => setIsOpen(false)}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 font-medium text-primary-foreground transition-smooth hover:bg-primary/90"
            >
              <span>View Cart</span>
              <Icon name="ArrowRightIcon" size={16} />
            </Link>
          </div>
        </aside>
      )}
    </div>
  );
};

export default CartStatusIndicator;
