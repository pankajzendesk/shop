import Link from 'next/link';
import Icon from '@/components/ui/AppIcon';
import AppImage from '@/components/ui/AppImage';

interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  alt: string;
  rating: number;
  reviews: number;
}

interface RecommendedProductsProps {
  products: Product[];
}

const RecommendedProducts = ({ products }: RecommendedProductsProps) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="font-heading text-xl font-semibold text-card-foreground">
          You May Also Like
        </h2>
        <Link
          href="/product-catalog"
          className="flex items-center gap-1 text-sm font-medium text-primary transition-smooth hover:text-primary/80"
        >
          <span>View All</span>
          <Icon name="ArrowRightIcon" size={16} />
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {products.map((product) => (
          <Link
            key={product.id}
            href={`/product-catalog/${product.id}`}
            className="group rounded-lg border border-border bg-background p-4 transition-smooth hover:shadow-warm-md"
          >
            <div className="relative mb-3 h-40 overflow-hidden rounded-lg bg-muted">
              <AppImage
                src={product.image}
                alt={product.alt}
                fill
                className="object-cover transition-smooth group-hover:scale-105"
              />
            </div>

            <h3 className="mb-2 font-medium text-card-foreground line-clamp-2 group-hover:text-primary">
              {product.name}
            </h3>

            <div className="mb-2 flex items-center gap-1">
              {['s1', 's2', 's3', 's4', 's5'].map((starId, i) => (
                <Icon
                  key={`${product.id}-${starId}`}
                  name="StarIcon"
                  size={14}
                  variant={i < Math.floor(product.rating) ? 'solid' : 'outline'}
                  className={
                    i < Math.floor(product.rating) ? 'text-warning' : 'text-muted-foreground'
                  }
                />
              ))}
              <span className="ml-1 text-xs text-muted-foreground">({product.reviews})</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-primary">{formatPrice(product.price)}</span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="font-mono text-sm text-muted-foreground line-through">
                  {formatPrice(product.originalPrice)}
                </span>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default RecommendedProducts;
