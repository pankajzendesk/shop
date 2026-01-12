import React from 'react';
import type { Metadata, Viewport } from 'next';
import '../styles/index.css';
import { CartProvider } from './providers/CartProvider';
import { AuthProvider } from './providers/AuthProvider';
import { WishlistProvider } from './providers/WishlistProvider';
import TrafficTracker from '@/components/common/TrafficTracker';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

const shopName = process.env.NEXT_PUBLIC_SHOP_NAME || 'GiftShop';
const enableDevTools = process.env.NEXT_PUBLIC_ENABLE_DEV_TOOLS === "true";

export const metadata: Metadata = {
  title: `${shopName} | Premium Toys & Gadgets`,
  description: 'Discover the best collection of toys, robots, and educational kits for all ages.',
  icons: {
    icon: [
      {
        url: 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🧸</text></svg>',
        type: 'image/svg+xml',
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <AuthProvider>
          <WishlistProvider>
            <CartProvider>
              <TrafficTracker />
              {children}
            </CartProvider>
          </WishlistProvider>
        </AuthProvider>

        {/* External Dev Tool Scripts */}
        {enableDevTools ? (
          <>
            <script
              type="module"
              async
              src="https://static.rocket.new/rocket-web.js?_cfg=https%3A%2F%2Fgadgettoys1928back.builtwithrocket.new&_be=https%3A%2F%2Fapplication.rocket.new&_v=0.1.12"
            />
            <script type="module" defer src="https://static.rocket.new/rocket-shot.js?v=0.0.2" />
          </>
        ) : (
          <style
            dangerouslySetInnerHTML={{
              __html: `
                #nextjs-portal,
                [data-nextjs-portal],
                .nextjs-portal,
                #__next-prerender-indicator,
                [data-nextjs-toast],
                [data-nextjs-dialog-overlay],
                [class*="rocket-"],
                [id*="rocket-"],
                [class*="dhiwise-"],
                [id*="dhiwise-"] { 
                  display: none !important; 
                  visibility: hidden !important;
                  pointer-events: none !important;
                }
              `,
            }}
          />
        )}
      </body>
    </html>
  );
}
