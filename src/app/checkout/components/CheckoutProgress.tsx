'use client';

import Icon from '@/components/ui/AppIcon';

interface CheckoutStep {
  id: string;
  label: string;
  icon: string;
}

interface CheckoutProgressIndicatorProps {
  currentStep: number;
  steps: CheckoutStep[];
}

const CheckoutProgressIndicator = ({ currentStep, steps }: CheckoutProgressIndicatorProps) => {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isCompleted = index < currentStep;
          const isCurrent = index === currentStep;

          const getCircleClass = () => {
            if (isCompleted) return 'bg-success text-success-foreground';
            if (isCurrent) return 'bg-primary text-primary-foreground';
            return 'bg-muted text-muted-foreground';
          };

          const getLabelClass = () => {
            if (isCurrent) return 'text-primary';
            if (isCompleted) return 'text-success';
            return 'text-muted-foreground';
          };

          return (
            <div key={step.id} className="flex flex-1 items-center">
              <div className="flex flex-col items-center">
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-full transition-smooth ${getCircleClass()}`}
                >
                  {isCompleted ? (
                    <Icon name="CheckIcon" size={24} />
                  ) : (
                    <Icon name={step.icon as any} size={24} />
                  )}
                </div>
                <span className={`mt-2 text-sm font-medium ${getLabelClass()}`}>
                  {step.label}
                </span>
              </div>

              {index < steps.length - 1 && (
                <div className="mx-2 flex-1">
                  <div
                    className={`h-1 rounded-full transition-smooth ${
                      isCompleted ? 'bg-success' : 'bg-muted'
                    }`}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CheckoutProgressIndicator;
