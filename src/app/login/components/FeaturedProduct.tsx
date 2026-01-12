'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AppImage from '@/components/ui/AppImage';
import Icon from '@/components/ui/AppIcon';

interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number | null;
  image: string;
  alt?: string | null;
  badge?: string;
  rating: number;
  reviewCount?: number;
}

interface FeaturedProductsPanelProps {
  initialProducts: Product[];
}

const FeaturedProductsPanel = ({ initialProducts }: FeaturedProductsPanelProps) => {
  const router = useRouter();
  const [isHydrated, setIsHydrated] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Use initialProducts if available, otherwise fall back to empty
  const featuredProducts = initialProducts.length > 0 ? initialProducts : [];

  useEffect(() => {
    if (!isHydrated || featuredProducts.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % featuredProducts.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isHydrated, featuredProducts.length]);

  const handleProductClick = (productId: string) => {
    router.push(`/product-catalog?id=${productId}`);
  };

  const handleNavigate = (direction: 'prev' | 'next') => {
    if (featuredProducts.length === 0) return;
    if (direction === 'prev') {
      setCurrentIndex((prev) => (prev - 1 + featuredProducts.length) % featuredProducts.length);
    } else {
      setCurrentIndex((prev) => (prev + 1) % featuredProducts.length);
    }
  };

  if (!isHydrated) {
    return (
      <div className="hidden w-full max-w-md rounded-2xl bg-card p-8 shadow-warm-lg md:block border border-border">
        <div className="mb-4 h-6 w-48 animate-pulse rounded bg-muted" />
        <div className="mb-4 h-64 w-full animate-pulse rounded-lg bg-muted" />
        <div className="space-y-2">
          <div className="h-4 w-full animate-pulse rounded bg-muted" />
          <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
        </div>
      </div>
    );
  }

  if (featuredProducts.length === 0) {
    return null; // Or some fallback
  }

  const currentProduct = featuredProducts[currentIndex];

  return (
    <div className="hidden w-full max-w-md rounded-2xl bg-card p-8 shadow-warm-lg md:block border border-border">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-heading text-xl font-bold text-foreground">Featured Products</h2>
        <div className="flex items-center gap-1">
          {featuredProducts.map((_, index) => (
            <button
              key={`dot-${featuredProducts[index].id}`}
              onClick={() => setCurrentIndex(index)}
              className={`h-2 rounded-full transition-smooth ${
                index === currentIndex ? 'w-6 bg-primary' : 'w-2 bg-muted'
              }`}
              aria-label={`Go to product ${index + 1}`}
            />
          ))}
        </div>
      </div>

      <div className="relative mb-4 overflow-hidden rounded-lg">
        {currentProduct.price < (currentProduct.originalPrice || 0) && (
          <div className="absolute left-3 top-3 z-10 rounded-full bg-accent px-3 py-1 text-xs font-semibold text-accent-foreground">
            Hot Deal
          </div>
        )}
        <button 
          className="relative h-64 w-full cursor-pointer border-none p-0 outline-none" 
          onClick={() => handleProductClick(currentProduct.id)}
          aria-label={`View details for ${currentProduct.name}`}
        >
          <AppImage
            src={currentProduct.image}
            alt={currentProduct.alt || currentProduct.name}
            fill
            className="object-cover"
          />
        </button>
        <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-black/60 to-transparent p-4">
          <button
            onClick={() => handleNavigate('prev')}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-gray-900 transition-smooth hover:bg-white"
            aria-label="Previous product"
          >
            <Icon name="ChevronLeftIcon" size={20} />
          </button>
          <button
            onClick={() => handleNavigate('next')}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-gray-900 transition-smooth hover:bg-white"
            aria-label="Next product"
          >
            <Icon name="ChevronRightIcon" size={20} />
          </button>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-start justify-between">
          <div>
            <button 
              className="text-left font-heading text-lg font-bold text-foreground hover:text-primary transition-smooth border-none bg-transparent p-0"
              onClick={() => handleProductClick(currentProduct.id)}
            >
              {currentProduct.name}
            </button>
            <div className="flex items-center gap-2 mt-1">
              <div className="flex items-center text-yellow-400">
                <Icon name="StarIcon" size={14} />
                <span className="ml-1 text-sm font-bold text-foreground">{currentProduct.rating}</span>
              </div>
              <span className="text-xs text-muted-foreground">({currentProduct.reviewCount || 0} reviews)</span>
            </div>
          </div>
          <div className="text-right">
            <p className="font-mono text-xl font-black text-primary">₹{currentProduct.price}</p>
            {currentProduct.originalPrice && (
              <p className="text-sm text-muted-foreground line-through">₹{currentProduct.originalPrice}</p>
            )}
          </div>
        </div>
        
        <button 
          onClick={() => handleProductClick(currentProduct.id)}
          className="w-full rounded-xl bg-primary py-3 text-sm font-bold text-primary-foreground transition-smooth hover:bg-primary/90 shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
        >
          <span>View Details</span>
          <Icon name="ArrowRightIcon" size={16} />
        </button>
      </div>

      <div className="mt-6 rounded-lg bg-muted p-4">
        <div className="mb-1 flex items-center gap-2">
          <Icon name="SparklesIcon" size={16} className="text-primary" />
          <span className="text-xs font-bold text-foreground uppercase tracking-wider">Flash Sale</span>
        </div>
        <p className="text-[11px] text-muted-foreground leading-relaxed">
          Limited time offers on these gadgets. Shop now for the best prices.
        </p>
      </div>
    </div>
  );
};

export default FeaturedProductsPanel;
