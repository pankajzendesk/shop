'use client';

import { useState } from 'react';
import Icon from '@/components/ui/AppIcon';

interface FilterOption {
  id: string;
  label: string;
  count: number;
}

interface FilterPanelProps {
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

const FilterPanel = ({
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
}: FilterPanelProps) => {
  const [expandedSections, setExpandedSections] = useState<string[]>([
    'sort',
    'categories',
    'price',
  ]);

  const sortOptions = [
    { value: 'relevance', label: 'Relevance', icon: 'SparklesIcon' },
    { value: 'price-low', label: 'Price: Low to High', icon: 'ArrowUpIcon' },
    { value: 'price-high', label: 'Price: High to Low', icon: 'ArrowDownIcon' },
    { value: 'rating', label: 'Customer Rating', icon: 'StarIcon' },
    { value: 'newest', label: 'Newest Arrivals', icon: 'ClockIcon' },
  ];

  const toggleSection = (section: string) => {
    setExpandedSections((prev) =>
      prev.includes(section) ? prev.filter((s) => s !== section) : [...prev, section]
    );
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const activeFiltersCount =
    selectedCategories.length +
    selectedBrands.length +
    selectedAgeGroups.length +
    (showInStockOnly ? 1 : 0) +
    (priceRange[0] > 0 || priceRange[1] < maxPrice ? 1 : 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-lg font-semibold text-foreground">Filters</h2>
        {activeFiltersCount > 0 && (
          <button
            onClick={onClearAll}
            className="flex items-center gap-1 text-sm font-medium text-primary transition-smooth hover:text-primary/80"
          >
            <Icon name="XMarkIcon" size={16} />
            <span>Clear All ({activeFiltersCount})</span>
          </button>
        )}
      </div>

      <div className="space-y-3">
        <div className="rounded-lg border border-border bg-card">
          <button
            onClick={() => toggleSection('sort')}
            className="flex w-full items-center justify-between p-4 text-left transition-smooth hover:bg-muted"
          >
            <span className="font-medium text-card-foreground">Sort By</span>
            <Icon
              name="ChevronDownIcon"
              size={20}
              className={`text-muted-foreground transition-smooth ${
                expandedSections.includes('sort') ? 'rotate-180' : ''
              }`}
            />
          </button>
          {expandedSections.includes('sort') && (
            <div className="space-y-1 border-t border-border p-2">
              {sortOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => onSortChange(option.value)}
                  className={`flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-smooth ${
                    sortBy === option.value
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >
                  <Icon name={option.icon as any} size={16} />
                  <span>{option.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-lg border border-border bg-card">
          <button
            onClick={() => toggleSection('categories')}
            className="flex w-full items-center justify-between p-4 text-left transition-smooth hover:bg-muted"
          >
            <span className="font-medium text-card-foreground">Categories</span>
            <Icon
              name="ChevronDownIcon"
              size={20}
              className={`text-muted-foreground transition-smooth ${
                expandedSections.includes('categories') ? 'rotate-180' : ''
              }`}
            />
          </button>
          {expandedSections.includes('categories') && (
            <div className="space-y-2 border-t border-border p-4">
              {categories.map((category) => (
                <label
                  key={category.id}
                  className="flex cursor-pointer items-center justify-between transition-smooth hover:text-primary"
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={selectedCategories.includes(category.id)}
                      onChange={() => onCategoryChange(category.id)}
                      className="h-4 w-4 rounded border-border text-primary focus:ring-2 focus:ring-primary focus:ring-offset-2"
                    />
                    <span className="text-sm text-card-foreground">{category.label}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">({category.count})</span>
                </label>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-lg border border-border bg-card">
          <button
            onClick={() => toggleSection('price')}
            className="flex w-full items-center justify-between p-4 text-left transition-smooth hover:bg-muted"
          >
            <span className="font-medium text-card-foreground">Price Range</span>
            <Icon
              name="ChevronDownIcon"
              size={20}
              className={`text-muted-foreground transition-smooth ${
                expandedSections.includes('price') ? 'rotate-180' : ''
              }`}
            />
          </button>
          {expandedSections.includes('price') && (
            <div className="space-y-4 border-t border-border p-4">
              <div className="flex items-center justify-between">
                <span className="font-mono text-sm font-semibold text-primary">
                  {formatPrice(priceRange[0])}
                </span>
                <span className="text-xs text-muted-foreground">to</span>
                <span className="font-mono text-sm font-semibold text-primary">
                  {formatPrice(priceRange[1])}
                </span>
              </div>
              <input
                type="range"
                min="0"
                max={maxPrice}
                value={priceRange[1]}
                onChange={(e) => onPriceRangeChange([priceRange[0], Number(e.target.value)])}
                className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-muted accent-primary"
              />
            </div>
          )}
        </div>

        <div className="rounded-lg border border-border bg-card">
          <button
            onClick={() => toggleSection('brands')}
            className="flex w-full items-center justify-between p-4 text-left transition-smooth hover:bg-muted"
          >
            <span className="font-medium text-card-foreground">Brands</span>
            <Icon
              name="ChevronDownIcon"
              size={20}
              className={`text-muted-foreground transition-smooth ${
                expandedSections.includes('brands') ? 'rotate-180' : ''
              }`}
            />
          </button>
          {expandedSections.includes('brands') && (
            <div className="space-y-2 border-t border-border p-4">
              {brands.map((brand) => (
                <label
                  key={brand.id}
                  className="flex cursor-pointer items-center justify-between transition-smooth hover:text-primary"
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={selectedBrands.includes(brand.id)}
                      onChange={() => onBrandChange(brand.id)}
                      className="h-4 w-4 rounded border-border text-primary focus:ring-2 focus:ring-primary focus:ring-offset-2"
                    />
                    <span className="text-sm text-card-foreground">{brand.label}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">({brand.count})</span>
                </label>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-lg border border-border bg-card">
          <button
            onClick={() => toggleSection('age')}
            className="flex w-full items-center justify-between p-4 text-left transition-smooth hover:bg-muted"
          >
            <span className="font-medium text-card-foreground">Age Group</span>
            <Icon
              name="ChevronDownIcon"
              size={20}
              className={`text-muted-foreground transition-smooth ${
                expandedSections.includes('age') ? 'rotate-180' : ''
              }`}
            />
          </button>
          {expandedSections.includes('age') && (
            <div className="space-y-2 border-t border-border p-4">
              {ageGroups.map((age) => (
                <label
                  key={age.id}
                  className="flex cursor-pointer items-center justify-between transition-smooth hover:text-primary"
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={selectedAgeGroups.includes(age.id)}
                      onChange={() => onAgeGroupChange(age.id)}
                      className="h-4 w-4 rounded border-border text-primary focus:ring-2 focus:ring-primary focus:ring-offset-2"
                    />
                    <span className="text-sm text-card-foreground">{age.label}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">({age.count})</span>
                </label>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-lg border border-border bg-card p-4">
          <label className="flex cursor-pointer items-center justify-between">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={showInStockOnly}
                onChange={onStockToggle}
                className="h-4 w-4 rounded border-border text-primary focus:ring-2 focus:ring-primary focus:ring-offset-2"
              />
              <span className="text-sm font-medium text-card-foreground">In Stock Only</span>
            </div>
            <Icon name="CheckCircleIcon" size={20} className="text-success" />
          </label>
        </div>
      </div>
    </div>
  );
};

export default FilterPanel;
