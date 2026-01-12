import Icon from '@/components/ui/AppIcon';

interface Benefit {
  id: string;
  icon: string;
  title: string;
  description: string;
}

const RegistrationBenefits = () => {
  const benefits: Benefit[] = [
    {
      id: 'fast-checkout',
      icon: 'BoltIcon',
      title: 'Fast Checkout',
      description: 'Save your shipping and payment info for lightning-fast purchases',
    },
    {
      id: 'order-tracking',
      icon: 'TruckIcon',
      title: 'Order Tracking',
      description: 'Track all your orders in real-time from purchase to delivery',
    },
    {
      id: 'exclusive-deals',
      icon: 'TagIcon',
      title: 'Exclusive Deals',
      description: 'Get early access to sales and member-only discounts',
    },
    {
      id: 'wishlist',
      icon: 'HeartIcon',
      title: 'Wishlist & Favorites',
      description: 'Save products you love and get notified when they go on sale',
    },
    {
      id: 'personalized',
      icon: 'SparklesIcon',
      title: 'Personalized Experience',
      description: 'Receive product recommendations tailored to your interests',
    },
    {
      id: 'rewards',
      icon: 'GiftIcon',
      title: 'Rewards Program',
      description: 'Earn points on every purchase and redeem for future discounts',
    },
  ];

  return (
    <div className="w-full max-w-2xl rounded-xl bg-gradient-to-br from-primary/10 to-secondary/10 p-8">
      <div className="mb-6 text-center">
        <h2 className="mb-2 font-heading text-2xl font-bold text-foreground">
          Why Create an Account?
        </h2>
        <p className="text-muted-foreground">
          Join thousands of happy customers enjoying these benefits
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {benefits.map((benefit) => (
          <div
            key={benefit.id}
            className="flex items-start gap-4 rounded-lg bg-card p-4 shadow-warm-sm transition-smooth hover:shadow-warm-md"
          >
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Icon name={benefit.icon as any} size={24} />
            </div>
            <div className="flex-1">
              <h3 className="mb-1 font-semibold text-foreground">{benefit.title}</h3>
              <p className="text-sm text-muted-foreground">{benefit.description}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-lg bg-card p-4">
        <div className="flex items-center gap-3">
          <Icon name="CheckBadgeIcon" size={24} className="flex-shrink-0 text-success" />
          <p className="text-sm text-foreground">
            <span className="font-semibold">100% Free Forever.</span> No hidden fees, no
            subscriptions. Just great shopping experiences.
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegistrationBenefits;
