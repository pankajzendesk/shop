import type { Metadata } from 'next';
import Link from 'next/link';
import HeaderWithCart from '@/components/common/HeaderWithCart';
import AccountDashboard from './components/AccountDashboard';

const shopName = process.env.NEXT_PUBLIC_SHOP_NAME || 'GiftShop';

export const metadata: Metadata = {
  title: `Account Dashboard - ${shopName}`,
  description:
    'Manage your profile, orders, addresses, payment methods, and preferences in one centralized dashboard for seamless shopping experience.',
};

export default function AccountDashboardPage() {
  return (
    <div className="min-h-screen bg-background">
      <HeaderWithCart />

      <main className="mx-auto max-w-[1440px] px-6 py-8">
        <AccountDashboard />
      </main>

      <footer className="border-t border-border bg-card py-8">
        <div className="mx-auto max-w-[1440px] px-6">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <p className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} {shopName}. All rights reserved.
            </p>
            <div className="flex gap-6">
              <Link
                href="/privacy"
                className="text-sm text-muted-foreground transition-smooth hover:text-primary"
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms"
                className="text-sm text-muted-foreground transition-smooth hover:text-primary"
              >
                Terms of Service
              </Link>
              <Link
                href="/support"
                className="text-sm text-muted-foreground transition-smooth hover:text-primary"
              >
                Contact Support
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
