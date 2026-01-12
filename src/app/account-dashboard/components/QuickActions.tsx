'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Icon from '@/components/ui/AppIcon';

interface QuickAction {
  id: string;
  label: string;
  icon: string;
  href: string;
  description: string;
}

const QuickActions = () => {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const actions: QuickAction[] = [
    {
      id: 'browse',
      label: 'Browse Products',
      icon: 'ShoppingBagIcon',
      href: '/product-catalog',
      description: 'Explore our catalog',
    },
    {
      id: 'orders',
      label: 'Track Orders',
      icon: 'TruckIcon',
      href: '/account-dashboard',
      description: 'View order status',
    },
    {
      id: 'wishlist',
      label: 'My Wishlist',
      icon: 'HeartIcon',
      href: '/account-dashboard',
      description: 'Saved items',
    },
    {
      id: 'support',
      label: 'Get Support',
      icon: 'ChatBubbleLeftRightIcon',
      href: '/account-dashboard',
      description: 'Contact us',
    },
  ];

  if (!isHydrated) {
    const skeletons = Array.from({ length: 4 }, (_, i) => `action-skeleton-${i}`);
    return (
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {skeletons.map((id) => (
          <div key={id} className="h-32 rounded-lg bg-muted" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      {actions.map((action) => (
        <Link
          key={action.id}
          href={action.href}
          className="group flex flex-col items-center justify-center gap-3 rounded-lg bg-card p-6 shadow-warm-sm transition-smooth hover:shadow-warm-md"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary transition-smooth group-hover:bg-primary group-hover:text-primary-foreground">
            <Icon name={action.icon as any} size={24} />
          </div>
          <div className="text-center">
            <p className="font-medium text-card-foreground">{action.label}</p>
            <p className="text-xs text-muted-foreground">{action.description}</p>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default QuickActions;
