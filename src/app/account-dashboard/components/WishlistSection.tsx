'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Icon from '@/components/ui/AppIcon';
import AppImage from '@/components/ui/AppImage';
import { useWishlist } from '@/app/providers/WishlistProvider';

interface WishlistItem {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  imageAlt?: string;
  inStock: boolean;
  category: string;
}

interface WishlistSectionProps {
  items?: WishlistItem[];
  limit?: number;
}

const WishlistSection = ({ items: propItems, limit }: WishlistSectionProps) => {
  const [isHydrated, setIsHydrated] = useState(false);
  const { wishlist } = useWishlist();

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const items = propItems || wishlist;
  const displayItems = limit ? items.slice(0, limit) : items;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  if (!isHydrated) {
    const skeletons = Array.from({ length: 3 }, (_, i) => `wishlist-skeleton-${i}`);
    return (
      <div className="rounded-lg bg-card p-6 shadow-warm-md">
        <div className="mb-4 h-6 w-48 rounded bg-muted" />
        <div className="grid gap-4 md:grid-cols-3">
          {skeletons.map((id) => (
            <div key={id} className="h-64 rounded-lg bg-muted" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg bg-card p-6 shadow-warm-md">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="font-heading text-2xl font-semibold text-card-foreground">My Wishlist</h2>
        <span className="text-sm text-muted-foreground">
          {items.length} {items.length === 1 ? 'item' : 'items'}
        </span>
      </div>

      {displayItems.length === 0 ? (
        <div className="py-12 text-center">
          <Icon name="HeartIcon" size={48} className="mx-auto mb-4 text-muted-foreground" />
          <p className="text-lg font-medium text-card-foreground">Your wishlist is empty</p>
          <p className="mt-2 text-sm text-muted-foreground">Save items you love for later</p>
          <Link
            href="/product-catalog"
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 font-medium text-primary-foreground transition-smooth hover:bg-primary/90"
          >
            <span>Browse Products</span>
            <Icon name="ArrowRightIcon" size={16} />
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {displayItems.map((item) => (
            <div
              key={item.id}
              className="group relative overflow-hidden rounded-lg border border-border transition-smooth hover:shadow-warm-md"
            >
              <div className="relative h-48 overflow-hidden bg-muted">
                <AppImage
                  src={item.image}
                  alt={item.imageAlt || item.name}
                  fill
                  className="object-cover transition-smooth group-hover:scale-105"
                />
                <button className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-error transition-smooth hover:bg-white">
                  <Icon name="HeartIcon" size={20} variant="solid" />
                </button>
                {!item.inStock && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                    <span className="rounded-full bg-error px-4 py-2 text-sm font-semibold text-white">
                      Out of Stock
                    </span>
                  </div>
                )}
              </div>

              <div className="p-4">
                <p className="mb-1 text-xs font-medium text-muted-foreground">{item.category}</p>
                <h3 className="mb-2 font-medium text-card-foreground line-clamp-2">{item.name}</h3>

                <div className="mb-4 flex items-center gap-2">
                  <span className="font-mono text-lg font-bold text-primary">
                    {formatPrice(item.price)}
                  </span>
                  {item.originalPrice && (
                    <span className="font-mono text-sm text-muted-foreground line-through">
                      {formatPrice(item.originalPrice)}
                    </span>
                  )}
                </div>

                <button
                  disabled={!item.inStock}
                  className={`flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2 font-medium transition-smooth ${
                    item.inStock
                      ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                      : 'cursor-not-allowed bg-muted text-muted-foreground'
                  }`}
                >
                  <Icon name="ShoppingCartIcon" size={16} />
                  <span>{item.inStock ? 'Add to Cart' : 'Out of Stock'}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default WishlistSection;
