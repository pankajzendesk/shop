import Link from 'next/link';
import Icon from '@/components/ui/AppIcon';

const EmptyCart = () => {
  return (
    <div className="flex min-h-[500px] flex-col items-center justify-center rounded-lg border border-border bg-card p-8 text-center">
      <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-muted">
        <Icon name="ShoppingCartIcon" size={48} className="text-muted-foreground" />
      </div>

      <h2 className="mb-2 font-heading text-2xl font-semibold text-card-foreground">
        Your Cart is Empty
      </h2>

      <p className="mb-8 max-w-md text-muted-foreground">
        Looks like you haven&apos;t added any items to your cart yet. Start shopping to find amazing
        gadgets and toys!
      </p>

      <Link
        href="/product-catalog"
        className="flex items-center gap-2 rounded-lg bg-primary px-6 py-3 font-medium text-primary-foreground transition-smooth hover:bg-primary/90"
      >
        <Icon name="ShoppingBagIcon" size={20} />
        <span>Start Shopping</span>
      </Link>
    </div>
  );
};

export default EmptyCart;
