import Icon from '@/components/ui/AppIcon';
import AppImage from '@/components/ui/AppImage';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  alt?: string | null;
}

interface OrderSummaryPanelProps {
  items: CartItem[];
  subtotal: number;
  shipping: number;
  tax: number;
  taxName?: string;
  discount: number;
  total: number;
  promoCode?: string;
  onPromoCodeApply?: (code: string) => void;
}

const OrderSummaryPanel = ({
  items,
  subtotal,
  shipping,
  tax,
  taxName = 'Tax',
  discount,
  total,
  promoCode = '',
  onPromoCodeApply,
}: OrderSummaryPanelProps) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="space-y-6">
      <h3 className="font-heading text-lg font-semibold text-foreground">Order Summary</h3>

      <div className="space-y-4">
        {items.map((item) => (
          <div key={item.id} className="flex items-center gap-3">
            <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-muted">
              <AppImage
                src={item.image || ''}
                alt={item.alt || item.name}
                fill
                className="object-cover"
              />
              <div className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                {item.quantity}
              </div>
            </div>
            <div className="flex-1">
              <p className="font-medium text-foreground line-clamp-1">{item.name}</p>
              <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
            </div>
            <p className="font-mono font-semibold text-foreground">
              {formatPrice(item.price * item.quantity)}
            </p>
          </div>
        ))}
      </div>

      <div className="space-y-3 border-t border-border pt-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Subtotal</span>
          <span className="font-mono text-sm font-medium text-foreground">
            {formatPrice(subtotal)}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Shipping</span>
          <span className="font-mono text-sm font-medium text-foreground">
            {shipping === 0 ? 'FREE' : formatPrice(shipping)}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">{taxName}</span>
          <span className="font-mono text-sm font-medium text-foreground">{formatPrice(tax)}</span>
        </div>

        {discount > 0 && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-success">Discount</span>
            <span className="font-mono text-sm font-medium text-success">
              -{formatPrice(discount)}
            </span>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between border-t border-border pt-4">
        <span className="text-lg font-semibold text-foreground">Total</span>
        <span className="font-mono text-2xl font-bold text-primary">{formatPrice(total)}</span>
      </div>

      <div className="rounded-lg bg-success/10 p-4">
        <div className="flex items-start gap-3">
          <Icon name="ShieldCheckIcon" size={24} className="flex-shrink-0 text-success" />
          <div>
            <p className="font-medium text-success">Secure Checkout</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Your payment information is protected with SSL encryption
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderSummaryPanel;
