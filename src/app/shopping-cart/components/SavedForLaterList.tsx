'use client';

import Icon from '@/components/ui/AppIcon';
import AppImage from '@/components/ui/AppImage';

interface SavedItem {
  id: string;
  name: string;
  price: number;
  image: string;
  alt: string;
  inStock: boolean;
}

interface SavedForLaterProps {
  items: SavedItem[];
  onMoveToCart: (id: string) => void;
  onRemove: (id: string) => void;
}

const SavedForLater = ({ items, onMoveToCart, onRemove }: SavedForLaterProps) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  if (items.length === 0) return null;

  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <h2 className="mb-6 font-heading text-xl font-semibold text-card-foreground">
        Saved for Later ({items.length})
      </h2>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <div
            key={item.id}
            className="group rounded-lg border border-border bg-background p-4 transition-smooth hover:shadow-warm-md"
          >
            <div className="relative mb-3 h-40 overflow-hidden rounded-lg bg-muted">
              <AppImage
                src={item.image}
                alt={item.alt}
                fill
                className="object-cover transition-smooth group-hover:scale-105"
              />
              {!item.inStock && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                  <span className="rounded-md bg-error px-3 py-1 text-xs font-semibold text-error-foreground">
                    Out of Stock
                  </span>
                </div>
              )}
            </div>

            <h3 className="mb-2 font-medium text-card-foreground line-clamp-2">{item.name}</h3>

            <p className="mb-4 font-mono font-bold text-primary">{formatPrice(item.price)}</p>

            <div className="flex gap-2">
              <button
                onClick={() => onMoveToCart(item.id)}
                disabled={!item.inStock}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-smooth hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Icon name="ShoppingCartIcon" size={16} />
                <span>Move to Cart</span>
              </button>
              <button
                onClick={() => onRemove(item.id)}
                className="flex h-10 w-10 items-center justify-center rounded-lg border border-border text-muted-foreground transition-smooth hover:bg-error/10 hover:text-error"
                aria-label={`Remove ${item.name} from saved items`}
              >
                <Icon name="TrashIcon" size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SavedForLater;
