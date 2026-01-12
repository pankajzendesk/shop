export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number | null;
  rating: number;
  reviewCount: number;
  image: string;
  alt: string | null;
  category: string;
  brand: string;
  ageGroup: string;
  inStock: boolean;
  isNew?: boolean;
  discount?: number | null;
  description?: string | null;
  features?: string[];
  quantity: number;
}

export const MOCK_PRODUCTS: Product[] = [];
