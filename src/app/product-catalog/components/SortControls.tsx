'use client';

import Icon from '@/components/ui/AppIcon';

interface SortControlsProps {
  sortBy: string;
  onSortChange: (sortBy: string) => void;
  resultCount: number;
}

const SortControls = ({ sortBy, onSortChange, resultCount }: SortControlsProps) => {
  const sortOptions = [
    { value: 'relevance', label: 'Relevance', icon: 'SparklesIcon' },
    { value: 'price-low', label: 'Price: Low to High', icon: 'ArrowUpIcon' },
    { value: 'price-high', label: 'Price: High to Low', icon: 'ArrowDownIcon' },
    { value: 'rating', label: 'Customer Rating', icon: 'StarIcon' },
    { value: 'newest', label: 'Newest Arrivals', icon: 'ClockIcon' },
  ];

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-2">
        <Icon name="FunnelIcon" size={20} className="text-muted-foreground" />
        <span className="text-sm text-muted-foreground">
          Showing <span className="font-semibold text-foreground">{resultCount}</span> results
        </span>
      </div>

      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-foreground">Sort by:</span>
        <div className="flex flex-wrap gap-2">
          {sortOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => onSortChange(option.value)}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-smooth ${
                sortBy === option.value
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground'
              }`}
            >
              <Icon name={option.icon as any} size={16} />
              <span>{option.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SortControls;
