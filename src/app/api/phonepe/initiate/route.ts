import { NextRequest, NextResponse } from 'next/server';
import { initiatePhonePePayment } from '@/app/actions-phonepe';

/**
 * PhonePe Payment Initiation
 * POST /api/phonepe/initiate
 * 
 * Request body:
 * {
 *   orderId: string,
 *   customerId: string,
 *   phone: string,
 *   amount: number,
 *   redirectUrl: string
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId, customerId, phone, amount, redirectUrl } = body;

    // Validate required fields
    if (!orderId || !customerId || !phone || !amount) {
      return NextResponse.json(
        {
          success: false,
          message: 'Missing required fields: orderId, customerId, phone, amount',
        },
        { status: 400 }
      );
    }

    const result = await initiatePhonePePayment(
      orderId,
      customerId,
      phone,
      amount,
      redirectUrl || `${process.env.NEXT_PUBLIC_BASE_URL}/checkout`
    );

    return NextResponse.json(result, {
      status: result.success ? 200 : 400,
    });
  } catch (error) {
    console.error('PhonePe Initiation API Error:', error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Payment initiation failed',
      },
      { status: 500 }
    );
  }
}
