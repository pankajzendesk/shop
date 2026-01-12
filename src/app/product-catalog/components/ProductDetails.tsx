'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import HeaderWithCart from '@/components/common/HeaderWithCart';
import Icon from '@/components/ui/AppIcon';
import AppImage from '@/components/ui/AppImage';
import { useCart } from '@/app/providers/CartProvider';
import { useWishlist } from '@/app/providers/WishlistProvider';

export type ProductDetailsModel = {
  id: string;
  name: string;
  category: string;
  brand?: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviewCount: number;
  inStock: boolean;
  image: string;
  images?: string[];
  image2?: string;
  alt: string;
  description: string;
  features: string[];
  returnPolicy?: string;
};

interface ProductDetailsProps {
  product: ProductDetailsModel;
}

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);

export default function ProductDetails({ product }: Readonly<ProductDetailsProps>) {
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const toggleWishlist = () => {
    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        category: product.category,
        inStock: product.inStock,
      });
    }
  };

  const images = product.images && product.images.length > 0
    ? product.images
    : [product.image, product.image2].filter(Boolean) as string[];

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, clientWidth } = scrollRef.current;
    const index = Math.round(scrollLeft / clientWidth);
    if (index !== activeIndex) {
      setActiveIndex(index);
    }
  };

  const scrollToImage = (index: number) => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollTo({
      left: index * scrollRef.current.clientWidth,
      behavior: 'smooth'
    });
    setActiveIndex(index);
  };

  const handleAddToCart = () => {
    addToCart(product, 1);
  };

  return (
    <div className="min-h-screen bg-background">
      <HeaderWithCart />

      <main className="mx-auto max-w-[1440px] px-6 py-8">
        <div className="mb-6 flex items-center gap-3 text-sm text-muted-foreground">
          <Link href="/product-catalog" className="transition-smooth hover:text-foreground">
            Shop
          </Link>
          <Icon name="ChevronRightIcon" size={16} />
          <span className="text-foreground">Product Details</span>
        </div>

        <div className="grid gap-10 lg:grid-cols-2">
          <div className="space-y-4">
            <div className="group relative overflow-hidden rounded-2xl bg-card shadow-warm-md border border-border">
              {/* Swipeable Container */}
              <div 
                ref={scrollRef}
                onScroll={handleScroll}
                className="flex aspect-square snap-x snap-mandatory overflow-x-auto scrollbar-hide"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {images.map((img, idx) => (
                  <div key={`${img}-${idx}`} className="relative h-full min-w-full snap-center bg-muted">
                    <AppImage 
                      src={img} 
                      alt={`${product.name} - View ${idx + 1}`} 
                      fill 
                      className="object-cover" 
                    />
                  </div>
                ))}

                {!product.inStock && (
                  <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/60 backdrop-blur-[2px]">
                    <span className="rounded-xl bg-error px-6 py-3 font-heading text-lg font-bold text-error-foreground shadow-xl">
                      Out of Stock
                    </span>
                  </div>
                )}
              </div>

              {/* Navigation Arrows (Desktop) */}
              {images.length > 1 && (
                <>
                  <button 
                    onClick={() => scrollToImage(activeIndex - 1)}
                    disabled={activeIndex === 0}
                    className="absolute left-4 top-1/2 -translate-y-1/2 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-background/80 text-foreground shadow-warm-md transition-smooth hover:bg-background disabled:opacity-0"
                  >
                    <Icon name="ChevronLeftIcon" size={24} />
                  </button>
                  <button 
                    onClick={() => scrollToImage(activeIndex + 1)}
                    disabled={activeIndex === images.length - 1}
                    className="absolute right-4 top-1/2 -translate-y-1/2 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-background/80 text-foreground shadow-warm-md transition-smooth hover:bg-background disabled:opacity-0"
                  >
                    <Icon name="ChevronRightIcon" size={24} />
                  </button>
                </>
              )}

              {/* Dot Indicators */}
              {images.length > 1 && (
                <div className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 gap-2">
                  {images.map((img, idx) => (
                    <button
                      key={`dot-${img}-${idx}`}
                      onClick={() => scrollToImage(idx)}
                      className={`h-2 rounded-full transition-all duration-300 ${activeIndex === idx ? 'w-6 bg-primary' : 'w-2 bg-foreground/30 hover:bg-foreground/50'}`}
                      aria-label={`Go to slide ${idx + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>
            
            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-4">
                {images.map((img, idx) => (
                  <button 
                    key={`thumb-${img}-${idx}`}
                    onClick={() => scrollToImage(idx)}
                    className={`relative h-24 w-24 overflow-hidden rounded-xl border-2 transition-smooth ${activeIndex === idx ? 'border-primary ring-2 ring-primary/20 scale-[1.02]' : 'border-border grayscale hover:border-primary/50 hover:grayscale-0'}`}
                  >
                    <AppImage src={img} alt={`Thumbnail ${idx + 1}`} fill className="object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <section className="rounded-lg bg-card p-6 shadow-warm-sm">
            <div className="mb-2 flex items-center justify-between">
              <div className="text-xs font-medium text-muted-foreground">{product.category}</div>
              {product.brand && <div className="text-xs font-bold text-primary uppercase tracking-wider italic">{product.brand}</div>}
            </div>
            <h1 className="font-heading text-3xl font-bold text-card-foreground">{product.name}</h1>

            <div className="mt-4 flex items-center gap-2">
              <div className="flex items-center gap-1">
                <span className="text-sm font-bold text-foreground mr-1">{product.rating?.toFixed(1) || "0.0"}</span>
                {[1, 2, 3, 4, 5].map((starNumber, index) => (
                  <Icon
                    key={`rating-star-${starNumber}`}
                    name="StarIcon"
                    size={16}
                    variant={index < Math.floor(product.rating || 0) ? 'solid' : 'outline'}
                    className={
                      index < Math.floor(product.rating || 0) ? 'text-warning' : 'text-muted-foreground'
                    }
                  />
                ))}
              </div>
              <span className="text-xs text-muted-foreground font-medium">({product.reviewCount || 0} reviews)</span>
            </div>

            <div className="mt-6 flex items-end justify-between gap-6">
              <div>
                <div className="font-mono text-3xl font-bold text-primary">
                  {formatCurrency(product.price)}
                </div>
                {product.originalPrice && product.originalPrice > product.price && (
                  <div className="text-sm text-muted-foreground line-through">
                    {formatCurrency(product.originalPrice)}
                  </div>
                )}
              </div>

              <div
                className={
                  product.inStock
                    ? 'inline-flex items-center gap-2 rounded-full bg-success/10 px-4 py-2 text-sm font-semibold text-success'
                    : 'inline-flex items-center gap-2 rounded-full bg-error/10 px-4 py-2 text-sm font-semibold text-error'
                }
              >
                <Icon name={product.inStock ? 'CheckCircleIcon' : 'XCircleIcon'} size={18} />
                <span>{product.inStock ? 'In Stock' : 'Out of Stock'}</span>
              </div>
            </div>

            <p className="mt-6 text-sm leading-6 text-muted-foreground">{product.description}</p>

            <div className="mt-6">
              <h2 className="font-heading text-lg font-semibold text-card-foreground">
                Key features
              </h2>
              <ul className="mt-3 space-y-2">
                {product.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm text-foreground">
                    <Icon name="CheckIcon" size={18} className="mt-0.5 text-success" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Return Policy Info */}
            <div className="mt-8 rounded-xl bg-success/5 border border-success/10 p-4">
               <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-success/10 text-success shadow-sm">
                     <Icon name="ShieldCheckIcon" size={20} />
                  </div>
                  <div>
                     <h3 className="text-sm font-bold text-foreground">Return & Replacement</h3>
                     <p className="text-xs text-muted-foreground font-medium">
                        {product.returnPolicy === 'NONE' && 'Policy: Non-returnable after successful delivery.'}
                        {product.returnPolicy === 'REPLACEMENT_7' && 'Policy: 7-Day easy replacement available.'}
                        {product.returnPolicy === 'RETURN_7' && 'Policy: 7-Day return and full refund guarantee.'}
                        {!product.returnPolicy && 'Policy: Standard return terms apply.'}
                     </p>
                  </div>
               </div>
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button
                disabled={!product.inStock}
                onClick={handleAddToCart}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 font-medium text-primary-foreground transition-smooth hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Icon name="ShoppingCartIcon" size={18} />
                <span>Add to Cart</span>
              </button>
              <Link
                href="/shopping-cart"
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-muted px-6 py-3 font-medium text-foreground transition-smooth hover:bg-muted/80"
              >
                <Icon name="CreditCardIcon" size={18} />
                <span>Go to Cart</span>
              </Link>
            </div>

            <button
               onClick={toggleWishlist}
               className={`mt-4 flex w-full items-center justify-center gap-2 rounded-xl border-2 py-4 text-sm font-bold transition-smooth ${
                 isInWishlist(product.id)
                   ? 'border-error/20 bg-error/5 text-error shadow-sm hover:bg-error/10'
                   : 'border-border bg-card text-muted-foreground hover:border-primary/30 hover:text-primary hover:bg-muted/30'
               }`}
            >
               <Icon 
                 name="HeartIcon" 
                 size={20} 
                 variant={isInWishlist(product.id) ? 'solid' : 'outline'} 
                 className={isInWishlist(product.id) ? 'text-error animate-bounce-subtle' : ''} 
               />
               <span>{isInWishlist(product.id) ? 'Saved to Wishlist' : 'Add to Wishlist'}</span>
            </button>
          </section>
        </div>
      </main>
    </div>
  );
}
