'use client';

import { useEffect } from 'react';
import Icon from '@/components/ui/AppIcon';
import FilterPanel from './FilterPanel';

interface FilterOption {
  id: string;
  label: string;
  count: number;
}

interface MobileFilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  categories: FilterOption[];
  brands: FilterOption[];
  ageGroups: FilterOption[];
  selectedCategories: string[];
  selectedBrands: string[];
  selectedAgeGroups: string[];
  priceRange: [number, number];
  maxPrice: number;
  showInStockOnly: boolean;
  sortBy: string;
  onCategoryChange: (categoryId: string) => void;
  onBrandChange: (brandId: string) => void;
  onAgeGroupChange: (ageGroupId: string) => void;
  onPriceRangeChange: (range: [number, number]) => void;
  onStockToggle: () => void;
  onSortChange: (sortBy: string) => void;
  onClearAll: () => void;
}

const MobileFilterDrawer = ({
  isOpen,
  onClose,
  categories,
  brands,
  ageGroups,
  selectedCategories,
  selectedBrands,
  selectedAgeGroups,
  priceRange,
  maxPrice,
  showInStockOnly,
  sortBy,
  onCategoryChange,
  onBrandChange,
  onAgeGroupChange,
  onPriceRangeChange,
  onStockToggle,
  onSortChange,
  onClearAll,
}: MobileFilterDrawerProps) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-1030 bg-background/80 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="fixed inset-y-0 right-0 z-1040 w-full max-w-sm bg-background shadow-warm-xl">
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b border-border p-4">
            <h2 className="font-heading text-xl font-semibold text-foreground">Filters</h2>
            <button
              onClick={onClose}
              className="flex h-10 w-10 items-center justify-center rounded-md text-foreground transition-smooth hover:bg-muted"
              aria-label="Close filters"
            >
              <Icon name="XMarkIcon" size={24} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            <FilterPanel
              categories={categories}
              brands={brands}
              ageGroups={ageGroups}
              selectedCategories={selectedCategories}
              selectedBrands={selectedBrands}
              selectedAgeGroups={selectedAgeGroups}
              priceRange={priceRange}
              maxPrice={maxPrice}
              showInStockOnly={showInStockOnly}
              sortBy={sortBy}
              onCategoryChange={onCategoryChange}
              onBrandChange={onBrandChange}
              onAgeGroupChange={onAgeGroupChange}
              onPriceRangeChange={onPriceRangeChange}
              onStockToggle={onStockToggle}
              onSortChange={onSortChange}
              onClearAll={onClearAll}
            />
          </div>

          <div className="border-t border-border p-4">
            <button
              onClick={onClose}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 font-medium text-primary-foreground transition-smooth hover:bg-primary/90"
            >
              <span>Apply Filters</span>
              <Icon name="CheckIcon" size={20} />
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default MobileFilterDrawer;
