import type { Metadata } from 'next';
import HeaderWithCart from '@/components/common/HeaderWithCart';
import ShoppingCartInteractive from './components/ShoppingCartInteractive';

const shopName = process.env.NEXT_PUBLIC_SHOP_NAME || 'GiftShop';

export const metadata: Metadata = {
  title: `Shopping Cart - ${shopName}`,
  description:
    'Review and manage your selected items before checkout. Adjust quantities, apply coupons, and proceed to secure payment processing.',
};

export default function ShoppingCartPage() {
  return (
    <main className="min-h-screen bg-background">
      <HeaderWithCart />
      <ShoppingCartInteractive />
    </main>
  );
}
