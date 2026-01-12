'use client';

import { useState } from 'react';
import Link from 'next/link';
import Icon from '@/components/ui/AppIcon';
import AppImage from '@/components/ui/AppImage';
import { useWishlist } from '@/app/providers/WishlistProvider';

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  originalPrice?: number | null;
  rating: number;
  reviewCount: number;
  image: string;
  alt: string | null;
  category: string;
  brand?: string;
  inStock: boolean;
  isNew?: boolean;
  discount?: number | null;
  onAddToCart: (productId: string) => void;
}

const ProductCard = ({
  id,
  name,
  price,
  originalPrice,
  rating,
  reviewCount,
  image,
  alt,
  category,
  brand,
  inStock,
  isNew,
  discount,
  onAddToCart,
}: ProductCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsAdding(true);
    onAddToCart(id);
    setTimeout(() => setIsAdding(false), 1000);
  };

  const toggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isInWishlist(id)) {
      removeFromWishlist(id);
    } else {
      addToWishlist({
        id,
        name,
        price,
        image,
        category,
        inStock,
      });
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <Link
      href={`/product-catalog/${id}`}
      className="group relative flex flex-col overflow-hidden rounded-lg bg-card shadow-warm-sm transition-smooth hover:shadow-warm-md"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative aspect-square overflow-hidden bg-muted">
        <AppImage
          src={image}
          alt={alt}
          fill
          className="object-cover transition-smooth group-hover:scale-105"
        />

        {!inStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80">
            <span className="rounded-lg bg-error px-4 py-2 font-semibold text-error-foreground">
              Out of Stock
            </span>
          </div>
        )}

        {isNew && inStock && (
          <div className="absolute left-3 top-3 rounded-md bg-success px-3 py-1 text-xs font-semibold text-success-foreground">
            NEW
          </div>
        )}

        {discount && discount > 0 && inStock && (
          <div className="absolute right-3 top-3 rounded-md bg-accent px-3 py-1 text-xs font-semibold text-accent-foreground">
            -{discount}%
          </div>
        )}

        <div className="absolute bottom-3 right-3">
          <button
            onClick={handleAddToCart}
            disabled={!inStock || isAdding}
            className={`flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-warm-md transition-smooth hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50 ${
              isHovered ? 'scale-100 opacity-100' : 'scale-0 opacity-0'
            }`}
            aria-label={`Add ${name} to cart`}
          >
            {isAdding ? (
              <Icon name="CheckIcon" size={20} />
            ) : (
              <Icon name="ShoppingCartIcon" size={20} />
            )}
          </button>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-xs font-medium text-muted-foreground">{category}</span>
          {brand && <span className="text-[10px] font-bold text-primary uppercase tracking-tighter italic">{brand}</span>}
        </div>

        <h3 className="mb-2 line-clamp-2 font-heading text-base font-semibold text-card-foreground group-hover:text-primary">
          {name}
        </h3>

        <div className="mb-3 flex items-center gap-1.5">
          <div className="flex items-center gap-0.5">
            <span className="text-xs font-bold text-foreground mr-0.5">{rating?.toFixed(1) || "0.0"}</span>
            {['r1', 'r2', 'r3', 'r4', 'r5'].map((starId, index) => (
              <Icon
                key={starId}
                name="StarIcon"
                size={12}
                variant={index < Math.floor(rating || 0) ? 'solid' : 'outline'}
                className={index < Math.floor(rating || 0) ? 'text-warning' : 'text-muted-foreground'}
              />
            ))}
          </div>
          <span className="text-[10px] text-muted-foreground font-medium">({reviewCount || 0})</span>
        </div>

        <div className="mt-auto flex items-center justify-between">
          <div className="flex flex-col">
            <span className="font-mono text-lg font-bold text-primary">{formatPrice(price)}</span>
            {originalPrice && originalPrice > price && (
              <span className="text-xs text-muted-foreground line-through">
                {formatPrice(originalPrice)}
              </span>
            )}
          </div>

          {inStock && (
            <div className="flex items-center gap-1 text-xs text-success">
              <Icon name="CheckCircleIcon" size={16} />
              <span>In Stock</span>
            </div>
          )}
        </div>

        <button
          onClick={toggleWishlist}
          className={`mt-4 flex items-center justify-center gap-2 rounded-lg border py-2 text-sm font-medium transition-smooth ${
            isInWishlist(id)
              ? 'border-error/20 bg-error/5 text-error hover:bg-error/10'
              : 'border-border bg-card text-muted-foreground hover:border-primary/30 hover:text-primary'
          }`}
        >
          <Icon 
            name="HeartIcon" 
            size={18} 
            variant={isInWishlist(id) ? 'solid' : 'outline'} 
            className={isInWishlist(id) ? 'text-error' : ''}
          />
          <span>{isInWishlist(id) ? 'Wishlisted' : 'Add to Wishlist'}</span>
        </button>
      </div>
    </Link>
  );
};

export default ProductCard;
