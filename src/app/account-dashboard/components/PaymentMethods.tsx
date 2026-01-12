'use client';

import { useState, useEffect } from 'react';
import Icon from '@/components/ui/AppIcon';

interface PaymentMethod {
  id: string;
  type: 'visa' | 'mastercard' | 'amex' | 'discover';
  lastFour: string;
  expiryMonth: string;
  expiryYear: string;
  cardholderName: string;
  isDefault: boolean;
}

interface PaymentMethodsProps {
  methods?: PaymentMethod[];
}

const PaymentMethods = ({ methods = [] }: PaymentMethodsProps) => {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const getCardIcon = (type: PaymentMethod['type']) => {
    return 'CreditCardIcon';
  };

  const getCardColor = (type: PaymentMethod['type']) => {
    const colors = {
      visa: 'from-blue-500 to-blue-600',
      mastercard: 'from-orange-500 to-red-600',
      amex: 'from-green-500 to-teal-600',
      discover: 'from-orange-400 to-orange-500',
    };
    return colors[type];
  };

  if (!isHydrated) {
    const skeletons = Array.from({ length: 2 }, (_, i) => `payment-skeleton-${i}`);
    return (
      <div className="rounded-lg bg-card p-6 shadow-warm-md">
        <div className="mb-4 h-6 w-48 rounded bg-muted" />
        <div className="grid gap-4 md:grid-cols-2">
          {skeletons.map((id) => (
            <div key={id} className="h-40 rounded-lg bg-muted" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg bg-card p-6 shadow-warm-md">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="font-heading text-2xl font-semibold text-card-foreground">
          Payment Methods
        </h2>
        <button className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 font-medium text-primary-foreground transition-smooth hover:bg-primary/90">
          <Icon name="PlusIcon" size={16} />
          <span>Add Card</span>
        </button>
      </div>

      <div className="mb-4 flex items-center gap-2 rounded-lg bg-success/10 p-4">
        <Icon name="ShieldCheckIcon" size={20} className="text-success" />
        <p className="text-sm text-success">Your payment information is encrypted and secure</p>
      </div>

      {methods.length === 0 ? (
        <div className="py-12 text-center">
          <Icon name="CreditCardIcon" size={48} className="mx-auto mb-4 text-muted-foreground" />
          <p className="text-lg font-medium text-card-foreground">No payment methods saved</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Add a payment method for faster checkout
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {methods.map((method) => (
            <div
              key={method.id}
              className={`relative overflow-hidden rounded-lg bg-gradient-to-br ${getCardColor(
                method.type
              )} p-6 text-white shadow-warm-md`}
            >
              {method.isDefault && (
                <span className="absolute right-4 top-4 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold backdrop-blur-sm">
                  Default
                </span>
              )}

              <div className="mb-8 flex items-center justify-between">
                <Icon name={getCardIcon(method.type) as any} size={32} />
                <span className="text-sm font-semibold uppercase">{method.type}</span>
              </div>

              <div className="mb-6">
                <p className="font-mono text-xl tracking-wider">•••• •••• •••• {method.lastFour}</p>
              </div>

              <div className="flex items-end justify-between">
                <div>
                  <p className="text-xs opacity-80">Cardholder</p>
                  <p className="font-medium">{method.cardholderName}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs opacity-80">Expires</p>
                  <p className="font-medium">
                    {method.expiryMonth}/{method.expiryYear}
                  </p>
                </div>
              </div>

              <div className="mt-4 flex gap-2">
                <button className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-white/20 px-3 py-2 text-sm font-medium backdrop-blur-sm transition-smooth hover:bg-white/30">
                  <Icon name="PencilIcon" size={14} />
                  <span>Edit</span>
                </button>
                <button className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-white/20 px-3 py-2 text-sm font-medium backdrop-blur-sm transition-smooth hover:bg-white/30">
                  <Icon name="TrashIcon" size={14} />
                  <span>Remove</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PaymentMethods;
