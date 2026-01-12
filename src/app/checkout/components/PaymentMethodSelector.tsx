'use client';

import { useState } from 'react';
import Icon from '@/components/ui/AppIcon';

interface PaymentMethod {
  id: string;
  type: 'card' | 'paypal' | 'wallet';
  name: string;
  icon: string;
  description: string;
}

interface SavedCard {
  id: string;
  last4: string;
  brand: string;
  expiryMonth: string;
  expiryYear: string;
  isDefault: boolean;
}

interface PaymentMethodFormProps {
  paymentMethods: PaymentMethod[];
  savedCards: SavedCard[];
  onPaymentMethodSelect: (methodId: string) => void;
  onCardSubmit: (cardData: any) => void;
}

const PaymentMethodForm = ({
  paymentMethods,
  savedCards,
  onPaymentMethodSelect,
  onCardSubmit,
}: PaymentMethodFormProps) => {
  const [selectedMethod, setSelectedMethod] = useState<string>('card');
  const [selectedCardId, setSelectedCardId] = useState<string>(
    savedCards.find((card) => card.isDefault)?.id || ''
  );
  const [showNewCardForm, setShowNewCardForm] = useState(savedCards.length === 0);
  const [cardData, setCardData] = useState({
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: '',
    saveCard: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleMethodSelect = (methodId: string) => {
    setSelectedMethod(methodId);
    onPaymentMethodSelect(methodId);
  };

  const validateCardForm = () => {
    const newErrors: Record<string, string> = {};

    if (!cardData.cardNumber.trim()) {
      newErrors.cardNumber = 'Card number is required';
    } else if (!/^\d{16}$/.test(cardData.cardNumber.replaceAll(/\s/g, ''))) {
      newErrors.cardNumber = 'Invalid card number';
    }

    if (!cardData.cardName.trim()) newErrors.cardName = 'Cardholder name is required';

    if (!cardData.expiryDate.trim()) {
      newErrors.expiryDate = 'Expiry date is required';
    } else if (!/^\d{2}\/\d{2}$/.test(cardData.expiryDate)) {
      newErrors.expiryDate = 'Invalid format (MM/YY)';
    }

    if (!cardData.cvv.trim()) {
      newErrors.cvv = 'CVV is required';
    } else if (!/^\d{3,4}$/.test(cardData.cvv)) {
      newErrors.cvv = 'Invalid CVV';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCardSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateCardForm()) {
      onCardSubmit(cardData);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setCardData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const formatCardNumber = (value: string) => {
    const cleaned = value.replaceAll(/\s/g, '');
    const chunks = cleaned.match(/.{1,4}/g);
    return chunks ? chunks.join(' ') : cleaned;
  };

  return (
    <div className="space-y-6">
      <h3 className="font-heading text-lg font-semibold text-foreground">Payment Method</h3>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        {paymentMethods.map((method) => (
          <button
            key={method.id}
            onClick={() => handleMethodSelect(method.id)}
            className={`rounded-lg border-2 p-4 transition-smooth ${
              selectedMethod === method.id
                ? 'border-primary bg-primary/5'
                : 'border-border bg-card hover:border-primary/50'
            }`}
          >
            <div className="flex flex-col items-center gap-2">
              <Icon
                name={method.icon as any}
                size={32}
                className={selectedMethod === method.id ? 'text-primary' : 'text-muted-foreground'}
              />
              <p className="font-medium text-foreground">{method.name}</p>
              <p className="text-xs text-muted-foreground">{method.description}</p>
            </div>
          </button>
        ))}
      </div>

      {selectedMethod === 'card' && (
        <div className="space-y-4">
          {savedCards.length > 0 && !showNewCardForm && (
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-foreground">Saved Cards</h4>
              {savedCards.map((card) => (
                <button
                  key={card.id}
                  onClick={() => setSelectedCardId(card.id)}
                  className={`w-full rounded-lg border-2 p-4 text-left transition-smooth ${
                    selectedCardId === card.id
                      ? 'border-primary bg-primary/5'
                      : 'border-border bg-card hover:border-primary/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-14 items-center justify-center rounded bg-muted">
                        <Icon name="CreditCardIcon" size={24} className="text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">
                          {card.brand} •••• {card.last4}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Expires {card.expiryMonth}/{card.expiryYear}
                        </p>
                      </div>
                    </div>
                    {selectedCardId === card.id && (
                      <Icon name="CheckCircleIcon" size={24} className="text-primary" />
                    )}
                  </div>
                </button>
              ))}

              <button
                onClick={() => setShowNewCardForm(true)}
                className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border bg-muted/50 px-4 py-3 font-medium text-foreground transition-smooth hover:border-primary hover:bg-primary/5"
              >
                <Icon name="PlusIcon" size={20} />
                <span>Add New Card</span>
              </button>
            </div>
          )}

          {showNewCardForm && (
            <form onSubmit={handleCardSubmit} className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium text-foreground">
                  {savedCards.length > 0 ? 'Add New Card' : 'Card Details'}
                </h4>
                {savedCards.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setShowNewCardForm(false)}
                    className="text-sm font-medium text-primary transition-smooth hover:text-primary/80"
                  >
                    Cancel
                  </button>
                )}
              </div>

              <div>
                <label
                  htmlFor="cardNumber"
                  className="mb-1 block text-sm font-medium text-foreground"
                >
                  Card Number *
                </label>
                <input
                  type="text"
                  id="cardNumber"
                  value={cardData.cardNumber}
                  onChange={(e) =>
                    handleInputChange('cardNumber', formatCardNumber(e.target.value))
                  }
                  maxLength={19}
                  className={`w-full rounded-lg border-2 bg-background px-4 py-3 font-mono text-foreground transition-smooth focus:outline-none focus:ring-2 focus:ring-primary ${
                    errors.cardNumber ? 'border-error' : 'border-input'
                  }`}
                  placeholder="1234 5678 9012 3456"
                />
                {errors.cardNumber && (
                  <p className="mt-1 text-sm text-error">{errors.cardNumber}</p>
                )}
              </div>

              <div>
                <label
                  htmlFor="cardName"
                  className="mb-1 block text-sm font-medium text-foreground"
                >
                  Cardholder Name *
                </label>
                <input
                  type="text"
                  id="cardName"
                  value={cardData.cardName}
                  onChange={(e) => handleInputChange('cardName', e.target.value)}
                  className={`w-full rounded-lg border-2 bg-background px-4 py-3 text-foreground transition-smooth focus:outline-none focus:ring-2 focus:ring-primary ${
                    errors.cardName ? 'border-error' : 'border-input'
                  }`}
                  placeholder="Name as on card"
                />
                {errors.cardName && <p className="mt-1 text-sm text-error">{errors.cardName}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="expiryDate"
                    className="mb-1 block text-sm font-medium text-foreground"
                  >
                    Expiry Date *
                  </label>
                  <input
                    type="text"
                    id="expiryDate"
                    value={cardData.expiryDate}
                    onChange={(e) => handleInputChange('expiryDate', e.target.value)}
                    maxLength={5}
                    className={`w-full rounded-lg border-2 bg-background px-4 py-3 font-mono text-foreground transition-smooth focus:outline-none focus:ring-2 focus:ring-primary ${
                      errors.expiryDate ? 'border-error' : 'border-input'
                    }`}
                    placeholder="MM/YY"
                  />
                  {errors.expiryDate && (
                    <p className="mt-1 text-sm text-error">{errors.expiryDate}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="cvv" className="mb-1 block text-sm font-medium text-foreground">
                    CVV *
                  </label>
                  <input
                    type="text"
                    id="cvv"
                    value={cardData.cvv}
                    onChange={(e) => handleInputChange('cvv', e.target.value)}
                    maxLength={4}
                    className={`w-full rounded-lg border-2 bg-background px-4 py-3 font-mono text-foreground transition-smooth focus:outline-none focus:ring-2 focus:ring-primary ${
                      errors.cvv ? 'border-error' : 'border-input'
                    }`}
                    placeholder="123"
                  />
                  {errors.cvv && <p className="mt-1 text-sm text-error">{errors.cvv}</p>}
                </div>
              </div>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={cardData.saveCard}
                  onChange={(e) => setCardData((prev) => ({ ...prev, saveCard: e.target.checked }))}
                  className="h-4 w-4 rounded border-input text-primary focus:ring-2 focus:ring-primary"
                />
                <span className="text-sm text-foreground">Save card for future purchases</span>
              </label>
            </form>
          )}
        </div>
      )}

      {selectedMethod === 'paypal' && (
        <div className="rounded-lg border-2 border-border bg-card p-6 text-center">
          <Icon name="CreditCardIcon" size={48} className="mx-auto mb-3 text-muted-foreground" />
          <p className="font-medium text-foreground">PayPal Payment</p>
          <p className="mt-1 text-sm text-muted-foreground">
            You will be redirected to PayPal to complete your purchase
          </p>
        </div>
      )}

      {selectedMethod === 'wallet' && (
        <div className="rounded-lg border-2 border-border bg-card p-6 text-center">
          <Icon name="WalletIcon" size={48} className="mx-auto mb-3 text-muted-foreground" />
          <p className="font-medium text-foreground">Digital Wallet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Apple Pay, Google Pay, or other digital wallets
          </p>
        </div>
      )}

      <div className="flex items-center gap-2 rounded-lg bg-muted/50 p-4">
        <Icon name="LockClosedIcon" size={20} className="text-success" />
        <p className="text-sm text-muted-foreground">
          Your payment information is encrypted and secure
        </p>
      </div>
    </div>
  );
};

export default PaymentMethodForm;
