'use client';

import { useState } from 'react';
import Icon from '@/components/ui/AppIcon';

interface PhonePePaymentProps {
  orderId: string;
  customerId: string;
  phone: string;
  amount: number;
  onPaymentSuccess: (paymentDetails: any) => void;
  onPaymentError: (error: string) => void;
  isLoading?: boolean;
}

export default function PhonePePaymentComponent({
  orderId,
  customerId,
  phone,
  amount,
  onPaymentSuccess,
  onPaymentError,
  isLoading = false,
}: PhonePePaymentProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentInitiated, setPaymentInitiated] = useState(false);
  const [merchantTransactionId, setMerchantTransactionId] = useState<string | null>(null);

  const handleInitiatePhonePePayment = async () => {
    try {
      setIsProcessing(true);

      // Call the initiate payment API
      const response = await fetch('/api/phonepe/initiate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId,
          customerId,
          phone,
          amount,
          redirectUrl: `${window.location.origin}/checkout?paymentVerifying=true`,
        }),
      });

      const result = await response.json();

      if (!result.success) {
        onPaymentError(result.message || 'Failed to initiate PhonePe payment');
        setIsProcessing(false);
        return;
      }

      // Store transaction ID for later verification
      setMerchantTransactionId(result.merchantTransactionId);
      setPaymentInitiated(true);

      // Redirect to PhonePe payment gateway
      if (result.redirectUrl) {
        window.location.href = result.redirectUrl;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to initiate payment';
      onPaymentError(errorMessage);
      setIsProcessing(false);
    }
  };

  const handleVerifyPayment = async () => {
    if (!merchantTransactionId) {
      onPaymentError('Transaction ID not found');
      return;
    }

    try {
      setIsProcessing(true);

      // Call the verify payment API
      const response = await fetch(
        `/api/phonepe/callback?merchantTransactionId=${merchantTransactionId}`
      );

      const result = await response.json();

      if (result.success && result.paymentStatus === 'SUCCESS') {
        onPaymentSuccess({
          merchantTransactionId,
          orderId,
          paymentMethod: 'PhonePe UPI',
          amount,
        });
      } else {
        onPaymentError(result.message || 'Payment verification failed');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to verify payment';
      onPaymentError(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  if (paymentInitiated) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
            <Icon name="ExclamationCircle" className="h-6 w-6 text-blue-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-800">Payment Processing</h3>
            <p className="text-sm text-gray-600">
              Your PhonePe payment is being processed. Click below to verify once payment is complete.
            </p>
          </div>
        </div>

        <button
          onClick={handleVerifyPayment}
          disabled={isProcessing}
          className="mt-4 w-full rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
        >
          {isProcessing ? 'Verifying...' : 'Verify Payment'}
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6">
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-50">
          <svg className="h-6 w-6 text-blue-600" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
            <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-800">PhonePe UPI Payment</h3>
          <p className="text-sm text-gray-600">Secure payment via PhonePe UPI</p>
        </div>
      </div>

      <div className="mt-4 rounded-lg bg-blue-50 p-4">
        <p className="text-sm text-gray-700">
          <strong>Amount:</strong> ₹{amount.toFixed(2)}
        </p>
        <p className="text-sm text-gray-700">
          <strong>Phone:</strong> {phone}
        </p>
      </div>

      <button
        onClick={handleInitiatePhonePePayment}
        disabled={isProcessing || isLoading}
        className="mt-6 w-full rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
      >
        {isProcessing || isLoading ? 'Processing...' : 'Pay with PhonePe UPI'}
      </button>

      <p className="mt-3 text-center text-xs text-gray-500">
        You will be redirected to PhonePe to complete the payment securely
      </p>
    </div>
  );
}
