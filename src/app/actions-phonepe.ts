'use server';

import { initializePhonePe } from '@/lib/phonepe';
import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

/**
 * Verify PhonePe payment and update order status
 */
export async function verifyPhonePePayment(merchantTransactionId: string) {
  try {
    const phonePe = initializePhonePe();
    const paymentStatus = await phonePe.verifyPayment(merchantTransactionId);

    if (!paymentStatus.success) {
      return {
        success: false,
        message: 'Payment verification failed',
        paymentStatus: 'FAILED',
      };
    }

    // Check if payment is successful
    const isPaymentSuccess =
      paymentStatus.data?.instrumentResponseCode === 'SUCCESS' ||
      paymentStatus.code === 'PAYMENT_SUCCESS';

    // Find transaction by merchantTransactionId
    const transaction = await prisma.transaction.findFirst({
      where: {
        transactionId: merchantTransactionId,
      },
      include: {
        order: true,
      },
    });

    if (!transaction) {
      return {
        success: false,
        message: 'Transaction not found',
        paymentStatus: 'NOTFOUND',
      };
    }

    if (isPaymentSuccess) {
      // Update transaction status to Success
      await prisma.transaction.update({
        where: { id: transaction.id },
        data: {
          status: 'Success',
          updatedAt: new Date(),
        },
      });

      // Update order status to "Order Ordered"
      const updatedOrder = await prisma.order.update({
        where: { id: transaction.orderId },
        data: {
          status: 'Order Ordered',
          updatedAt: new Date(),
        },
      });

      // Add to order history
      await prisma.orderHistory.create({
        data: {
          orderId: transaction.orderId,
          status: 'Order Ordered',
          note: 'Payment confirmed via PhonePe UPI',
        },
      });

      revalidatePath('/admin/orders');
      revalidatePath('/order-history');

      return {
        success: true,
        message: 'Payment verified and order status updated to Order Ordered',
        paymentStatus: 'SUCCESS',
        orderId: transaction.orderId,
      };
    } else {
      // Payment failed - update transaction and order
      await prisma.transaction.update({
        where: { id: transaction.id },
        data: {
          status: 'Failed',
          updatedAt: new Date(),
        },
      });

      await prisma.order.update({
        where: { id: transaction.orderId },
        data: {
          status: 'Payment Failed',
          updatedAt: new Date(),
        },
      });

      await prisma.orderHistory.create({
        data: {
          orderId: transaction.orderId,
          status: 'Payment Failed',
          note: 'PhonePe payment verification failed',
        },
      });

      return {
        success: false,
        message: 'Payment verification failed',
        paymentStatus: 'FAILED',
        orderId: transaction.orderId,
      };
    }
  } catch (error) {
    console.error('PhonePe Payment Verification Error:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Payment verification failed',
      paymentStatus: 'ERROR',
    };
  }
}

/**
 * Initiate PhonePe UPI payment
 */
export async function initiatePhonePePayment(
  orderId: string,
  customerId: string,
  phone: string,
  amount: number,
  redirectUrl: string
) {
  try {
    const merchantTransactionId = `PHONEPE_${orderId}_${Date.now()}`;
    const callbackUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:4028'}/api/phonepe/callback`;

    const phonePe = initializePhonePe();
    const paymentResponse = await phonePe.initiatePayment({
      merchantTransactionId,
      amount,
      customerId,
      phone,
      redirectUrl,
      callbackUrl,
    });

    if (!paymentResponse.success) {
      return {
        success: false,
        message: 'Failed to initiate PhonePe payment',
        error: paymentResponse.message,
      };
    }

    // Store the merchant transaction ID with the order for later verification
    await prisma.order.update({
      where: { id: orderId },
      data: {
        paymentDetails: {
          merchantTransactionId,
          initiatedAt: new Date().toISOString(),
        },
      },
    });

    return {
      success: true,
      message: 'PhonePe payment initiated successfully',
      redirectUrl: paymentResponse.data?.redirectUrl,
      merchantTransactionId,
    };
  } catch (error) {
    console.error('PhonePe Payment Initiation Error:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to initiate payment',
    };
  }
}

/**
 * Handle PhonePe webhook callback
 */
export async function handlePhonePeCallback(requestBody: any, xVerify: string) {
  try {
    const phonePe = initializePhonePe();

    // Validate webhook signature
    const isValid = phonePe.validateWebhookSignature(JSON.stringify(requestBody), xVerify);

    if (!isValid) {
      console.warn('Invalid PhonePe webhook signature');
      return {
        success: false,
        message: 'Invalid webhook signature',
      };
    }

    const merchantTransactionId = requestBody.data?.merchantTransactionId;
    if (!merchantTransactionId) {
      return {
        success: false,
        message: 'Missing merchantTransactionId',
      };
    }

    // Verify payment status
    return await verifyPhonePePayment(merchantTransactionId);
  } catch (error) {
    console.error('PhonePe Callback Error:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Callback processing failed',
    };
  }
}
