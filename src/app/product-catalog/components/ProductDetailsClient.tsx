'use client';

import { useState, useEffect } from 'react';
import ProductDetails, {
  type ProductDetailsModel,
} from '@/app/product-catalog/components/ProductDetails';
import { MOCK_PRODUCTS } from '@/lib/constants';

interface ProductDetailsClientProps {
  id: string;
  initialData?: any;
}

const ProductDetailsClient = ({ id, initialData }: ProductDetailsClientProps) => {
  const [product, setProduct] = useState<ProductDetailsModel | null>(initialData || null);

  useEffect(() => {
    if (initialData) {
      setProduct({
        ...initialData,
        originalPrice: initialData.originalPrice || initialData.price * 1.2,
        rating: initialData.rating || 4.5,
        reviewCount: initialData.reviewCount || 100,
        inStock: initialData.inStock ?? true,
        image: initialData.image,
        image2: initialData.image2,
        brand: initialData.brand,
        alt: initialData.name,
        description: initialData.description || 'A fun, high-quality gadget-toy bundle designed for curious minds. Durable materials, modern design, and lots of play value.',
        features: initialData.features || [
          'Premium build quality',
          'Kid-safe materials',
          'Great for gifting',
          'Fast shipping available',
        ],
      });
      return;
    }
    
    // Fallback for mock products if no DB product found/passed
    const found = MOCK_PRODUCTS.find(p => p.id === id);
    if (found) {
      setProduct({
        ...found,
        originalPrice: found.price * 1.2,
        rating: 4.5,
        reviewCount: 100,
        inStock: true,
        alt: found.name,
        description: 'Mock product details.',
        features: ['Mock feature 1', 'Mock feature 2'],
      } as any);
    }
  }, [id, initialData]);

  if (!product) {
    return (
      <div className="min-h-screen bg-background p-8 flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin mb-4"></div>
          <p className="text-muted-foreground">Loading product details...</p>
        </div>
      </div>
    );
  }

  return <ProductDetails product={product} />;
};

export default ProductDetailsClient;
