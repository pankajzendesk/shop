'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import ProductCard from './ProductCard';
import FilterPanel from './FilterPanel';
import ProductGridSkeleton from './ProductGridSkeleton';
import MobileFilterDrawer from './MobileFilterDrawer';
import Icon from '@/components/ui/AppIcon';
import { useCart } from '@/app/providers/CartProvider';
import { MOCK_PRODUCTS, type Product } from '@/lib/constants';

interface FilterOption {
  id: string;
  label: string;
  count: number;
}

interface ProductCatalogProps {
  initialProducts?: Product[];
}

const ProductCatalogInteractive = ({ initialProducts: databaseProducts }: ProductCatalogProps) => {
  const searchParams = useSearchParams();
  const initialSearch = searchParams.get('search') || '';
  
  const [isHydrated, setIsHydrated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedAgeGroups, setSelectedAgeGroups] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 50000]);
  const [showInStockOnly, setShowInStockOnly] = useState(false);
  const [sortBy, setSortBy] = useState('relevance');
  const [activeProducts, setActiveProducts] = useState<Product[]>(databaseProducts || []);
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const { addToCart } = useCart();

  useEffect(() => {
    setSearchQuery(searchParams.get('search') || '');
  }, [searchParams]);

  useEffect(() => {
    setIsHydrated(true);

    if (databaseProducts && databaseProducts.length > 0) {
      setActiveProducts(databaseProducts);
      setIsLoading(false);
      return;
    }

    // Fallback to mock products if no DB products
    setActiveProducts(MOCK_PRODUCTS);
    setTimeout(() => setIsLoading(false), 1000);
  }, [databaseProducts]);

  const categories: FilterOption[] = useMemo(() => {
    const uniqueCats = Array.from(new Set(activeProducts.map(p => p.category)));
    return uniqueCats.map(cat => ({
      id: cat.toLowerCase(),
      label: cat,
      count: activeProducts.filter(p => p.category === cat).length
    })).sort((a, b) => a.label.localeCompare(b.label));
  }, [activeProducts]);

  const brands: FilterOption[] = useMemo(() => {
    const uniqueBrands = Array.from(new Set(activeProducts.map(p => p.brand).filter((b): b is string => !!b)));
    return uniqueBrands.map(brand => ({
      id: brand.toLowerCase(),
      label: brand,
      count: activeProducts.filter(p => p.brand === brand).length
    })).sort((a, b) => a.label.localeCompare(b.label));
  }, [activeProducts]);

  const ageGroups: FilterOption[] = useMemo(() => {
    const uniqueAges = Array.from(new Set(activeProducts.map(p => p.ageGroup).filter((a): a is string => !!a)));
    return uniqueAges.map(age => ({
      id: age.toLowerCase().replaceAll(' ', '-'),
      label: age,
      count: activeProducts.filter(p => p.ageGroup === age).length
    })).sort((a, b) => a.label.localeCompare(b.label));
  }, [activeProducts]);

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId) ? prev.filter((c) => c !== categoryId) : [...prev, categoryId]
    );
  };

  const handleBrandChange = (brandId: string) => {
    setSelectedBrands((prev) =>
      prev.includes(brandId) ? prev.filter((b) => b !== brandId) : [...prev, brandId]
    );
  };

  const handleAgeGroupChange = (ageGroupId: string) => {
    setSelectedAgeGroups((prev) =>
      prev.includes(ageGroupId) ? prev.filter((a) => a !== ageGroupId) : [...prev, ageGroupId]
    );
  };

  const handleClearAll = () => {
    setSelectedCategories([]);
    setSelectedBrands([]);
    setSelectedAgeGroups([]);
    setPriceRange([0, 50000]);
    setShowInStockOnly(false);
    setSearchQuery('');
  };

  const handleAddToCart = (productId: string) => {
    const product = activeProducts.find((p) => p.id === productId);
    if (!product) return;
    addToCart(
      {
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        alt: product.alt,
      },
      1
    );
  };

  const filteredProducts = activeProducts.filter((product) => {
    if (searchQuery && !product.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    if (
      selectedCategories.length > 0 &&
      !selectedCategories.includes(product.category.toLowerCase())
    ) {
      return false;
    }
    if (selectedBrands.length > 0 && !selectedBrands.includes(product.brand.toLowerCase())) {
      return false;
    }
    if (
      selectedAgeGroups.length > 0 &&
      !selectedAgeGroups.includes(product.ageGroup.toLowerCase().replaceAll(' ', '-'))
    ) {
      return false;
    }
    if (product.price < priceRange[0] || product.price > priceRange[1]) {
      return false;
    }
    if (showInStockOnly && !product.inStock) {
      return false;
    }
    return true;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return a.price - b.price;
      case 'price-high':
        return b.price - a.price;
      case 'rating':
        return b.rating - a.rating;
      case 'newest':
        return (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0);
      default:
        return 0;
    }
  });

  if (!isHydrated) {
    return (
      <div className="mx-auto max-w-[1440px] px-6 py-8">
        <div className="mb-8 h-12 w-64 animate-pulse rounded-lg bg-muted" />
        <div className="flex gap-8">
          <div className="hidden w-80 flex-shrink-0 lg:block">
            <div className="space-y-4">
              {['a', 'b', 'c', 'd'].map((id) => (
                <div
                  key={`filter-skeleton-${id}`}
                  className="h-48 animate-pulse rounded-lg bg-muted"
                />
              ))}
            </div>
          </div>
          <div className="flex-1">
            <div className="mb-6 h-16 animate-pulse rounded-lg bg-muted" />
            <ProductGridSkeleton />
          </div>
        </div>
      </div>
    );
  }

  const content = (() => {
    if (isLoading) return <ProductGridSkeleton />;

    if (sortedProducts.length > 0) {
      return (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {sortedProducts.map((product) => (
            <ProductCard key={product.id} {...product} onAddToCart={handleAddToCart} />
          ))}
        </div>
      );
    }

    return (
      <div className="flex flex-col items-center justify-center py-16">
        <Icon name="MagnifyingGlassIcon" size={64} className="mb-4 text-muted-foreground" />
        <h3 className="mb-2 font-heading text-2xl font-semibold text-foreground">
          No products found
        </h3>
        <p className="mb-6 text-center text-muted-foreground">
          Try adjusting your filters or search criteria
        </p>
        <button
          onClick={handleClearAll}
          className="flex items-center gap-2 rounded-lg bg-primary px-6 py-3 font-medium text-primary-foreground transition-smooth hover:bg-primary/90"
        >
          <Icon name="ArrowPathIcon" size={20} />
          <span>Clear All Filters</span>
        </button>
      </div>
    );
  })();

  return (
    <div className="mx-auto max-w-[1440px] px-4 py-6 md:px-6 md:py-8">
      <div className="mb-6 md:mb-8">
        <h1 className="mb-2 font-heading text-2xl font-bold text-foreground md:text-4xl">
          {searchQuery ? `Search Results for "${searchQuery}"` : 'Product Catalog'}
        </h1>
        <p className="text-sm text-muted-foreground md:text-base">
          {searchQuery 
            ? `Found ${sortedProducts.length} items matching your search` 
            : 'Discover our wide selection of gadgets and toys for all ages'}
        </p>
      </div>

      <div className="flex flex-col gap-6 lg:flex-row lg:gap-8">
        <aside className="hidden w-80 flex-shrink-0 lg:block">
          <div className="sticky top-24">
            <FilterPanel
              categories={categories}
              brands={brands}
              ageGroups={ageGroups}
              selectedCategories={selectedCategories}
              selectedBrands={selectedBrands}
              selectedAgeGroups={selectedAgeGroups}
              priceRange={priceRange}
              maxPrice={50000}
              showInStockOnly={showInStockOnly}
              sortBy={sortBy}
              onCategoryChange={handleCategoryChange}
              onBrandChange={handleBrandChange}
              onAgeGroupChange={handleAgeGroupChange}
              onPriceRangeChange={setPriceRange}
              onStockToggle={() => setShowInStockOnly(!showInStockOnly)}
              onSortChange={setSortBy}
              onClearAll={handleClearAll}
            />
          </div>
        </aside>

        <main className="flex-1">
          <div className="mb-6 flex items-center justify-between">
            <button
              onClick={() => setIsMobileFilterOpen(true)}
              className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 font-medium text-primary-foreground transition-smooth hover:bg-primary/90 lg:hidden"
            >
              <Icon name="AdjustmentsHorizontalIcon" size={20} />
              <span>Filters & Sort</span>
            </button>
            <div className="hidden lg:flex items-center gap-2 text-sm text-muted-foreground">
              <Icon name="FunnelIcon" size={18} />
              <span>Showing <span className="font-semibold text-foreground">{sortedProducts.length}</span> results</span>
            </div>
          </div>

          {content}
        </main>
      </div>

      <MobileFilterDrawer
        isOpen={isMobileFilterOpen}
        onClose={() => setIsMobileFilterOpen(false)}
        categories={categories}
        brands={brands}
        ageGroups={ageGroups}
        selectedCategories={selectedCategories}
        selectedBrands={selectedBrands}
        selectedAgeGroups={selectedAgeGroups}
        priceRange={priceRange}
        maxPrice={50000}
        showInStockOnly={showInStockOnly}
        sortBy={sortBy}
        onCategoryChange={handleCategoryChange}
        onBrandChange={handleBrandChange}
        onAgeGroupChange={handleAgeGroupChange}
        onPriceRangeChange={setPriceRange}
        onStockToggle={() => setShowInStockOnly(!showInStockOnly)}
        onSortChange={setSortBy}
        onClearAll={handleClearAll}
      />
    </div>
  );
};

export default ProductCatalogInteractive;
