'use client';

import Icon from '@/components/ui/AppIcon';

interface DeliveryMethod {
  id: string;
  name: string;
  description: string;
  estimatedDays: string;
  cost: number;
  icon: string;
}

interface DeliveryMethodSelectorProps {
  methods: DeliveryMethod[];
  selectedMethodId: string;
  onMethodSelect: (methodId: string) => void;
}

const DeliveryMethodSelector = ({
  methods,
  selectedMethodId,
  onMethodSelect,
}: DeliveryMethodSelectorProps) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="space-y-4">
      <h3 className="font-heading text-lg font-semibold text-foreground">Delivery Method</h3>

      <div className="space-y-3">
        {methods.map((method) => (
          <button
            key={method.id}
            onClick={() => onMethodSelect(method.id)}
            className={`w-full rounded-lg border-2 p-4 text-left transition-smooth ${
              selectedMethodId === method.id
                ? 'border-primary bg-primary/5'
                : 'border-border bg-card hover:border-primary/50'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div
                  className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg ${
                    selectedMethodId === method.id
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  <Icon name={method.icon as any} size={20} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-foreground">{method.name}</p>
                    {method.cost === 0 && (
                      <span className="rounded-full bg-success/10 px-2 py-0.5 text-xs font-medium text-success">
                        Free
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{method.description}</p>
                  <p className="mt-1 text-sm font-medium text-foreground">
                    Estimated delivery: {method.estimatedDays}
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <p className="font-mono text-lg font-semibold text-foreground">
                  {method.cost === 0 ? 'FREE' : formatPrice(method.cost)}
                </p>
                {selectedMethodId === method.id && (
                  <Icon name="CheckCircleIcon" size={24} className="text-primary" />
                )}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default DeliveryMethodSelector;
