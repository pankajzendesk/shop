# PhonePe UPI Payment Gateway Integration

This guide explains how to integrate and configure the PhonePe UPI payment gateway for your shop application.

## Overview

The PhonePe payment integration allows customers to pay for orders using UPI through PhonePe. Once payment is successfully received, the order status is automatically updated to **"Order Ordered"**.

## Features

✅ **UPI Payment Support** - Accept payments via PhonePe UPI interface
✅ **Automatic Status Update** - Order status changes to "Order Ordered" upon successful payment
✅ **Payment Verification** - Real-time payment verification with PhonePe API
✅ **Webhook Support** - Secure webhook callbacks to verify payment status
✅ **Sandbox Testing** - Test in sandbox environment before going live

## Prerequisites

1. **PhonePe Account** - Create a business account on [PhonePe Business](https://onboarding.phonepe.com)
2. **Merchant Credentials** - Obtain your Merchant ID and API Key from PhonePe dashboard
3. **Node.js & npm** - Already installed in your project

## Setup Steps

### 1. Get PhonePe Credentials

1. Register/Login to [PhonePe Business Dashboard](https://merchant.phonepe.com)
2. Complete your business onboarding
3. Navigate to **Settings** → **API Keys**
4. Copy your:
   - **Merchant ID** (e.g., `MERCHANTUAT123`)
   - **API Key** (e.g., `d587c247-xxxx-xxxx-xxxx-xxxxxxxxxx`)

### 2. Configure Environment Variables

Create a `.env.local` file in your project root:

```env
# PhonePe Configuration
PHONEPE_MERCHANT_ID=your_merchant_id_here
PHONEPE_API_KEY=your_api_key_here
PHONEPE_ENV=sandbox  # Use 'sandbox' for testing, 'production' for live

# Base URL for callbacks (required)
NEXT_PUBLIC_BASE_URL=http://localhost:4028  # Update for production
```

### 3. Install Dependencies

The integration uses built-in Node.js modules, no additional packages needed.

### 4. Database Migration

Ensure your database has the required fields in the `Order` and `Transaction` models. The schema should include:

```prisma
model Order {
  // ... existing fields
  status              String    // Will be "Order Ordered" after payment
  paymentMethod       String?   // Will be "PhonePe" or "phonepay"
}

model Transaction {
  // ... existing fields
  status              String    // Will be "Success" after payment verification
  transactionId       String?   // PhonePe transaction ID
  paymentDetails      Json?     // Payment metadata
}
```

## How It Works

### Payment Flow

1. **Customer selects PhonePe** - At checkout, customer chooses PhonePe UPI as payment method
2. **Order Created** - Order is created with status `"Payment Pending"`
3. **Payment Initiated** - Customer is redirected to PhonePe payment gateway
4. **Payment Processing** - Customer completes UPI payment
5. **Verification** - Payment is verified via PhonePe API
6. **Status Update** - Order status changes to **"Order Ordered"** upon successful payment

### Order Status Rules

```
PhonePe Payment Flow:
├─ Payment Pending (Initial)
│  └─ [After successful payment]
│     └─ Order Ordered ✓
│     └─ (Order is now ready for processing)
│  └─ [After failed payment]
│     └─ Payment Failed ✗
│     └─ (Order is cancelled)
```

## API Endpoints

### 1. Initiate Payment

**POST** `/api/phonepe/initiate`

Request body:
```json
{
  "orderId": "order_123",
  "customerId": "customer_123",
  "phone": "9876543210",
  "amount": 1000,
  "redirectUrl": "http://localhost:4028/checkout"
}
```

Response:
```json
{
  "success": true,
  "message": "PhonePe payment initiated successfully",
  "redirectUrl": "https://phonepe.com/...",
  "merchantTransactionId": "PHONEPE_order_123_1234567890"
}
```

### 2. Verify Payment

**GET** `/api/phonepe/callback?merchantTransactionId=...`

Response:
```json
{
  "success": true,
  "message": "Payment verified and order status updated to Order Ordered",
  "paymentStatus": "SUCCESS",
  "orderId": "order_123"
}
```

### 3. Payment Callback (Webhook)

**POST** `/api/phonepe/callback`

PhonePe sends a webhook with payment status. The system automatically:
- Verifies the webhook signature
- Updates order status to "Order Ordered" if payment is successful
- Creates order history record with payment confirmation

## Usage in Checkout

The checkout component has been updated to support PhonePe. When a customer selects PhonePe as payment method:

```tsx
<PhonePePaymentComponent
  orderId={order.id}
  customerId={userId}
  phone={customerPhone}
  amount={totalAmount}
  onPaymentSuccess={(paymentDetails) => {
    // Handle successful payment
  }}
  onPaymentError={(error) => {
    // Handle payment error
  }}
/>
```

## Testing

### Sandbox Testing

1. Set `PHONEPE_ENV=sandbox` in `.env.local`
2. Use PhonePe sandbox test credentials (provided by PhonePe support)
3. Test payment flow without actual money transfer

### Test Phone Numbers

PhonePe sandbox provides test phone numbers for testing:
- Contact PhonePe support for test credentials
- Use test phone numbers to simulate payments

### Test UPI Handles

Use test UPI IDs (provided by PhonePe):
- `test123@okhdfcbank`
- `test456@okaxis`

## Troubleshooting

### Issue: "PhonePe credentials not configured"

**Solution:** Ensure environment variables are set:
```bash
echo "PHONEPE_MERCHANT_ID=$PHONEPE_MERCHANT_ID"
echo "PHONEPE_API_KEY=$PHONEPE_API_KEY"
```

### Issue: Payment Pending Status Not Changing

**Check:**
1. Verify callback URL in PhonePe dashboard matches: `https://yourdomain.com/api/phonepe/callback`
2. Ensure `NEXT_PUBLIC_BASE_URL` is correct
3. Check server logs for webhook errors
4. Verify webhook signature validation is passing

### Issue: Invalid Merchant ID Error

**Solution:** Double-check merchant credentials:
1. Copy directly from PhonePe dashboard (avoid typos)
2. For sandbox: use sandbox merchant ID
3. For production: use production merchant ID

### Issue: Webhook Signature Validation Failing

**Solution:** Ensure:
1. API key matches exactly (copy-paste from PhonePe dashboard)
2. Webhook signature calculation matches PhonePe documentation
3. Server time is synchronized (NTP sync)

## Going to Production

### Before Going Live

1. ✅ Test in sandbox environment thoroughly
2. ✅ Obtain production merchant credentials from PhonePe
3. ✅ Update environment variables:
   ```env
   PHONEPE_MERCHANT_ID=your_production_merchant_id
   PHONEPE_API_KEY=your_production_api_key
   PHONEPE_ENV=production
   NEXT_PUBLIC_BASE_URL=https://yourdomain.com
   ```
4. ✅ Configure webhook URL in PhonePe dashboard: `https://yourdomain.com/api/phonepe/callback`
5. ✅ Set up SSL certificate for HTTPS
6. ✅ Enable CORS for payment redirects
7. ✅ Test end-to-end payment flow
8. ✅ Set up monitoring for webhook failures

## Security Considerations

1. **API Key Protection** - Keep API key in `.env.local`, never commit to git
2. **HTTPS Only** - Always use HTTPS in production
3. **Webhook Signature** - Verify all webhook signatures
4. **Amount Validation** - Always verify final amount before processing
5. **User Verification** - Validate user owns the order before payment

## Files Created/Modified

### New Files
- `src/lib/phonepe.ts` - PhonePe gateway class
- `src/app/actions-phonepe.ts` - PhonePe server actions
- `src/app/api/phonepe/initiate/route.ts` - Payment initiation endpoint
- `src/app/api/phonepe/callback/route.ts` - Webhook callback handler
- `src/app/checkout/components/PhonePePaymentComponent.tsx` - UI component
- `.env.example` - Environment variables template

### Modified Files
- `src/app/actions.ts` - Updated createOrder to handle PhonePe payment status

## Support

For PhonePe API documentation and support:
- 📖 [PhonePe API Documentation](https://phonepe.gitbook.io/pg-api)
- 📧 support@phonepe.com
- 💬 PhonePe Business Dashboard - Support Chat

## Additional Resources

- [PhonePe Business](https://onboarding.phonepe.com)
- [PhonePe Dashboard](https://merchant.phonepe.com)
- [UPI Payment Guide](https://en.wikipedia.org/wiki/Unified_Payments_Interface)
