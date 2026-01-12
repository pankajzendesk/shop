'use client';

import { useState, useEffect } from 'react';
import Icon from '@/components/ui/AppIcon';

interface OrderSlicingOverlayProps {
  isVisible: boolean;
  totalItems: number;
  onComplete: () => void;
}

export default function OrderSlicingOverlay({ isVisible, totalItems, onComplete }: Readonly<OrderSlicingOverlayProps>) {
  const [sliceCount, setSliceCount] = useState(0);
  const [status, setStatus] = useState('initializing'); // initializing, slicing, complete

  // Calculate slices: if many items, slice them into groups of up to 5, max 10 slices
  const numSlices = Math.min(Math.max(3, Math.ceil(totalItems / 2)), 10);

  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        setStatus('slicing');
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isVisible]);

  useEffect(() => {
    if (status === 'slicing' && sliceCount < numSlices) {
      const nextSlice = setTimeout(() => {
        setSliceCount(prev => prev + 1);
      }, 300);
      return () => clearTimeout(nextSlice);
    } else if (status === 'slicing' && sliceCount === numSlices) {
      const finalTimer = setTimeout(() => {
        setStatus('complete');
        onComplete();
      }, 1000);
      return () => clearTimeout(finalTimer);
    }
  }, [status, sliceCount, numSlices, onComplete]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-background/90 backdrop-blur-xl">
      <div className="w-full max-w-2xl px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-heading font-bold text-foreground mb-2">
            {status === 'complete' ? 'Order Sliced & Ready!' : 'Slicing Your Order...'}
          </h2>
          <p className="text-muted-foreground">
            Breaking down your {totalItems} items into optimized delivery batches
          </p>
        </div>

        {/* The Slicing Visualization */}
        <div className="relative h-64 flex items-center justify-center gap-4">
          {/* Original Order Block (disappears as it slices) */}
          {status === 'initializing' && (
            <div className="w-48 h-48 bg-primary rounded-2xl shadow-warm-xl flex items-center justify-center text-white text-5xl animate-pulse">
               <Icon name="ShoppingBagIcon" size={64} />
            </div>
          )}

          {/* Slices appearing */}
          <div className="flex flex-wrap justify-center gap-3">
            {Array.from({ length: numSlices }).map((_, i) => (
              <div
                key={`slice-batch-${i + 1}`}
                className={`
                  w-16 h-24 rounded-lg border-2 flex flex-col items-center justify-center transition-all duration-500
                  ${i < sliceCount 
                    ? 'scale-100 opacity-100 bg-success/10 border-success text-success' 
                    : 'scale-75 opacity-0 bg-muted border-border text-muted-foreground'}
                `}
                style={{
                  transitionDelay: `${i * 100}ms`
                }}
              >
                <div className="text-xs font-bold mb-1">SLICE #{i + 1}</div>
                {i < sliceCount ? (
                  <Icon name="CheckCircleIcon" size={24} className="animate-bounce-subtle" />
                ) : (
                  <Icon name="ClockIcon" size={20} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-12 bg-muted h-3 rounded-full overflow-hidden shadow-inner">
          <div 
            className="h-full bg-primary transition-all duration-500 ease-out"
            style={{ width: `${(sliceCount / numSlices) * 100}%` }}
          />
        </div>

        <div className="mt-6 flex justify-between items-center px-2">
          <span className="text-sm font-medium text-muted-foreground">
            Processing {sliceCount} of {numSlices} batches
          </span>
          <span className="text-sm font-bold text-primary animate-pulse">
            {Math.round((sliceCount / numSlices) * 100)}% Complete
          </span>
        </div>
      </div>

      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent"></div>
      <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent"></div>
    </div>
  );
}
