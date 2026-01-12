'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Icon from '@/components/ui/AppIcon';
import Notification from '@/components/ui/Notification';
import { useCart } from '@/app/providers/CartProvider';
import { useAuth } from '@/app/providers/AuthProvider';
import { createOrder, getUserAddresses, addAddress, getPaymentMethods, getStoreSettings } from '@/app/actions';

// UI Components
import CheckoutProgressIndicator from './CheckoutProgressIndicator';
import ShippingAddressForm from './ShippingAddressForm';
import DeliveryMethodSelector from './DeliveryMethodSelector';
import PaymentMethodForm from './PaymentMethodForm';
import OrderSummaryPanel from './OrderSummaryPanel';
import OrderSlicingOverlay from './OrderSlicingOverlay';

// --- Types ---

interface Address {
  id: string;
  fullName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
  phone: string;
  isDefault: boolean;
}

interface DeliveryMethod {
  id: string;
  name: string;
  description: string;
  estimatedDays: string;
  cost: number;
  icon: string;
}

interface PaymentMethod {
  id: string;
  type: 'card' | 'paypal' | 'wallet';
  name: string;
  icon: string;
  description: string;
}

// --- Main Component ---

export default function CheckoutIntro() {
  const router = useRouter();
  const { state: { items: cartItems, appliedCoupon }, clear } = useCart();
  const { user } = useAuth();

  // State
  const [isHydrated, setIsHydrated] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [storeSettings, setStoreSettings] = useState({ taxEnabled: false, taxPercentage: 0, taxName: 'Tax' });
  
  // Data State
  const [savedAddresses, setSavedAddresses] = useState<Address[]>([]);
  const [availablePaymentMethods, setAvailablePaymentMethods] = useState<PaymentMethod[]>([]);
  
  // Selection State
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [selectedDeliveryMethod, setSelectedDeliveryMethod] = useState('standard');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('card');

  // UI State
  const [isSlicing, setIsSlicing] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' as 'success' | 'error' });

  // --- Constants & Memos ---

  const checkoutSteps = [
    { id: 'shipping', label: 'Shipping', icon: 'TruckIcon' },
    { id: 'delivery', label: 'Delivery', icon: 'ClockIcon' },
    { id: 'payment', label: 'Payment', icon: 'CreditCardIcon' },
  ];

  const deliveryMethods: DeliveryMethod[] = [
    { id: 'standard', name: 'Standard Shipping', description: 'Delivery within 5-7 business days', estimatedDays: '5-7 business days', cost: 0, icon: 'TruckIcon' },
    { id: 'express', name: 'Express Shipping', description: 'Faster delivery within 2-3 business days', estimatedDays: '2-3 business days', cost: 99, icon: 'BoltIcon' },
    { id: 'overnight', name: 'Overnight Shipping', description: 'Next business day delivery', estimatedDays: '1 business day', cost: 249, icon: 'RocketLaunchIcon' },
  ];

  // Memoized Calculations
  const { subtotal, discount, shipping, tax, total } = useMemo(() => {
    const sub = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    
    // Calculate Discount
    let disc = 0;
    if (appliedCoupon) {
      if (appliedCoupon.type === 'percentage') {
        disc = sub * (appliedCoupon.discount / 100);
      } else {
        disc = appliedCoupon.discount;
      }
    }

    const delivery = deliveryMethods.find((m) => m.id === selectedDeliveryMethod);
    let shipCost = delivery?.cost || 0;
    if (appliedCoupon?.code === 'FREESHIP' || sub > 500) {
      shipCost = 0;
    }
    
    // Calculate tax based on store settings
    const taxableAmount = Math.max(0, sub - disc);
    const taxCost = storeSettings.taxEnabled 
      ? (taxableAmount * storeSettings.taxPercentage / 100) 
      : (taxableAmount * 0.18);

    return {
      subtotal: sub,
      discount: disc,
      shipping: shipCost,
      tax: taxCost,
      total: taxableAmount + shipCost + taxCost
    };
  }, [cartItems, selectedDeliveryMethod, storeSettings, appliedCoupon]);

  // --- Effects ---

  useEffect(() => {
    setIsHydrated(true);
    
    // 0. Fetch Store Settings
    getStoreSettings().then(settings => {
      setStoreSettings(settings);
    });

    // 1. Fetch Payment Methods
    getPaymentMethods().then((methods: any) => {
      const activeMethods: PaymentMethod[] = methods
        .filter((m: any) => m.isActive)
        .map((m: any) => {
          let type: 'card' | 'paypal' | 'wallet' = 'paypal';
          if (m.identifier === 'card') type = 'card';
          else if (m.identifier === 'phonepay') type = 'wallet';
          
          return {
            id: m.identifier,
            type,
            name: m.name,
            icon: m.icon || 'CreditCardIcon',
            description: m.description || '',
          };
        });
      setAvailablePaymentMethods(activeMethods);
      if (activeMethods.length > 0 && !selectedPaymentMethod) {
        setSelectedPaymentMethod(activeMethods[0].id);
      }
    });

    // 2. Fetch Addresses (Only if logged in)
    if (user?.email) {
      getUserAddresses(user.email).then((addresses: any) => {
        // Ensure type safety when setting state
        const typedAddresses = addresses as Address[];
        setSavedAddresses(typedAddresses);
        
        const defaultAddr = typedAddresses.find((a) => a.isDefault);
        if (defaultAddr) setSelectedAddress(defaultAddr);
      });
    }
  }, [user?.email]);

  // --- Handlers ---

  const showNotify = (message: string, type: 'success' | 'error') => {
    setNotification({ show: true, message, type });
  };

  const handleNewAddress = async (addressData: Omit<Address, 'id' | 'isDefault'>) => {
    // Guest Handling
    if (!user?.email) {
      const guestAddress: Address = {
        ...addressData,
        id: `guest-${Date.now()}`,
        isDefault: true,
      };
      setSelectedAddress(guestAddress);
      showNotify('Guest address set', 'success');
      return;
    }

    // Authenticated Handling
    try {
      const newAddress = await addAddress(user.email, {
        ...addressData,
        isDefault: savedAddresses.length === 0,
      });

      // Type guard needed depending on your API return
      const typedAddress = newAddress as Address;

      if (typedAddress && !typedAddress.id.toString().startsWith('temp-')) {
        setSavedAddresses(prev => [...prev, typedAddress]);
      }

      setSelectedAddress(typedAddress);
      showNotify('Address added successfully', 'success');
    } catch (error) {
      console.error('Failed to add address:', error);
      showNotify('Failed to add address', 'error');
    }
  };

  const handleNavigation = (direction: 'next' | 'back') => {
    if (direction === 'next') {
      if (currentStep === 0 && !selectedAddress) {
        showNotify('Please select or add a shipping address', 'error');
        return;
      }
      if (currentStep < checkoutSteps.length - 1) {
        setCurrentStep(prev => prev + 1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } else if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      showNotify("Please select a shipping address", "error");
      return;
    }

    setIsProcessing(true);

    try {
      await createOrder({
        customerName: selectedAddress.fullName,
        customerEmail: user?.email || "guest@example.com",
        shippingAddress: `${selectedAddress.addressLine1}, ${selectedAddress.addressLine2 ? selectedAddress.addressLine2 + ', ' : ''}${selectedAddress.city}, ${selectedAddress.state} ${selectedAddress.zipCode}, ${selectedAddress.country}`,
        total: total,
        taxAmount: tax,
        shippingCost: shipping,
        discountAmount: discount,
        promoCode: appliedCoupon?.code,
        customerId: user?.id,
        items: cartItems.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image
        })),
        paymentMethod: selectedPaymentMethod,
        deliveryMethod: selectedDeliveryMethod,
      });

      clear(); // Clear cart logic
      setIsSlicing(true); // Start animation
    } catch (error) {
      console.error("Failed to place order:", error);
      showNotify("Failed to place order. Please try again.", "error");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSlicingComplete = () => {
    setIsSlicing(false);
    setShowCelebration(true);
    
    // Auto-redirect after 3 seconds
    setTimeout(() => {
      setShowCelebration(false);
      router.push("/product-catalog");
    }, 4000);
  };

  // --- Render Helpers ---

  if (!isHydrated) return <LoadingSkeleton />;
  if (cartItems.length === 0 && !isSlicing && !showCelebration) return <EmptyCartView router={router} />;

  return (
    <div className="min-h-screen bg-background pb-12 relative">
      <Notification
        message={notification.message}
        isVisible={notification.show}
        onClose={() => setNotification(prev => ({ ...prev, show: false }))}
        type={notification.type}
      />

      <div className="mx-auto max-w-[1440px] px-6 py-8">
        {/* Header */}
                <div className="mb-8">
          <h1 className="mb-2 font-heading text-2xl font-bold text-foreground md:text-4xl">Checkout</h1>
          <p className="text-sm text-muted-foreground md:text-base">Complete your order with secure payment processing.</p>
        </div>

        {/* Steps */}
        <div className="mb-8">
          <CheckoutProgressIndicator currentStep={currentStep} steps={checkoutSteps} />
        </div>

        {/* Main Layout */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          
          {/* Left Column: Forms */}
          <div className="lg:col-span-2">
            <div className="rounded-lg border-2 border-border bg-card p-6 shadow-warm-sm">
              
              {currentStep === 0 && (
                <ShippingAddressForm
                  savedAddresses={savedAddresses}
                  onAddressSelect={setSelectedAddress}
                  onNewAddress={handleNewAddress}
                />
              )}

              {currentStep === 1 && (
                <DeliveryMethodSelector
                  methods={deliveryMethods}
                  selectedMethodId={selectedDeliveryMethod}
                  onMethodSelect={setSelectedDeliveryMethod}
                />
              )}

              {currentStep === 2 && (
                <PaymentMethodForm
                  paymentMethods={availablePaymentMethods}
                  savedCards={[]} // Add logic for saved cards later
                  onPaymentMethodSelect={setSelectedPaymentMethod}
                  onCardSubmit={(data) => console.log('Card data:', data)}
                />
              )}

              {/* Navigation Actions */}
              <div className="mt-6 flex items-center justify-between gap-4 border-t border-border pt-6">
                {currentStep > 0 && (
                  <button
                    onClick={() => handleNavigation('back')}
                    className="flex items-center gap-2 rounded-lg border-2 border-border bg-background px-6 py-3 font-medium text-foreground transition-smooth hover:bg-muted"
                  >
                    <Icon name="ArrowLeftIcon" size={20} />
                    <span>Back</span>
                  </button>
                )}

                {currentStep < checkoutSteps.length - 1 ? (
                  <button
                    onClick={() => handleNavigation('next')}
                    className="ml-auto flex items-center gap-2 rounded-lg bg-primary px-6 py-3 font-medium text-primary-foreground transition-smooth hover:bg-primary/90"
                  >
                    <span>Continue</span>
                    <Icon name="ArrowRightIcon" size={20} />
                  </button>
                ) : (
                  <button
                    onClick={handlePlaceOrder}
                    disabled={isProcessing}
                    className="ml-auto flex items-center gap-2 rounded-lg bg-success px-6 py-3 font-medium text-success-foreground transition-smooth hover:bg-success/90 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isProcessing ? (
                      <>
                        <Icon name="ArrowPathIcon" size={20} className="animate-spin" />
                        <span>Processing...</span>
                      </>
                    ) : (
                      <>
                        <Icon name="CheckIcon" size={20} />
                        <span>Place Order</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 rounded-lg border-2 border-border bg-card p-6 shadow-warm-sm">
              <OrderSummaryPanel
                items={cartItems}
                subtotal={subtotal}
                shipping={shipping}
                tax={tax}
                taxName={storeSettings.taxName}
                discount={discount}
                total={total}
              />
            </div>
          </div>
        </div>
      </div>

      <OrderSlicingOverlay
        isVisible={isSlicing}
        totalItems={cartItems.reduce((acc, item) => acc + item.quantity, 0)}
        onComplete={handleSlicingComplete}
      />

      {showCelebration && <CelebrationOverlay />}
    </div>
  );
}

// --- Sub Components (Extracted for Readability) ---

function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-[1440px] px-6 py-8">
        <div className="h-12 w-48 animate-pulse rounded-lg bg-muted" />
        <div className="mt-8 h-96 animate-pulse rounded-lg bg-muted" />
      </div>
    </div>
  );
}

function EmptyCartView({ router }: Readonly<{ router: any }>) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center bg-background px-6 py-12 text-center">
      <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-muted">
        <Icon name="ShoppingCartIcon" size={48} className="text-muted-foreground" />
      </div>
      <h2 className="mb-2 font-heading text-3xl font-bold text-foreground">Your Cart is Empty</h2>
      <p className="mb-8 max-w-md text-muted-foreground">
        You need items in your cart to proceed with checkout.
      </p>
      <button
        onClick={() => router.push('/product-catalog')}
        className="flex items-center gap-2 rounded-lg bg-primary px-8 py-4 font-bold text-primary-foreground shadow-lg transition-smooth hover:scale-105"
      >
        <Icon name="ShoppingBagIcon" size={20} />
        <span>Start Shopping</span>
      </button>
    </div>
  );
}

function CelebrationOverlay() {
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      {/* Confetti Background Layer */}
      <div className="absolute inset-0 z-[201] pointer-events-none overflow-hidden h-full w-full">
         <img 
            src="https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExM3pjdW13enR3Z3p3Z3p3Z3p3Z3p3Z3p3Z3p3Z3p3Z3p3ZyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/26tOZ42Mg6pbMubM4/giphy.gif" 
            className="w-full h-full object-cover opacity-60 mix-blend-screen" 
            alt="Confetti Background"
         />
      </div>

      <div className="absolute inset-0 bg-black/80 backdrop-blur-md animate-in fade-in duration-500" />
      
      <div className="relative z-[210] flex flex-col items-center justify-center rounded-[3rem] bg-card p-12 text-center shadow-[0_30px_100px_rgba(0,0,0,0.6)] border-8 border-primary animate-in zoom-in-90 duration-500 max-w-xl w-full">
        <div className="mb-8 flex h-40 w-40 items-center justify-center rounded-full bg-primary/20 text-primary animate-bounce shadow-inner">
          <Icon name="CheckCircleIcon" size={100} />
        </div>
        
        <h2 className="mb-4 font-heading text-5xl font-black text-foreground uppercase tracking-tighter">
          Congrats!
        </h2>
        <p className="mb-4 text-3xl font-extrabold text-primary">
          Your order is placed
        </p>
        <p className="text-xl text-muted-foreground font-medium">
          Thank you for shopping with us!
        </p>

        <div className="mt-12 h-3 w-full overflow-hidden rounded-full bg-muted">
          <div className="h-full bg-primary animate-progress-fast shadow-[0_0_15px_rgba(var(--color-primary),0.5)]" />
        </div>
        <p className="mt-6 text-sm font-bold text-primary animate-pulse tracking-widest uppercase">
          Redirecting to Shop...
        </p>
      </div>
    </div>
  );
}
