import { NextRequest, NextResponse } from 'next/server';
import { handlePhonePeCallback } from '@/app/actions-phonepe';

/**
 * PhonePe Payment Webhook Callback
 * POST /api/phonepe/callback
 */
export async function POST(request: NextRequest) {
  try {
    const xVerify = request.headers.get('x-verify');
    const body = await request.json();

    if (!xVerify) {
      return NextResponse.json(
        { success: false, message: 'Missing X-Verify header' },
        { status: 400 }
      );
    }

    // Handle callback
    const result = await handlePhonePeCallback(body, xVerify);

    return NextResponse.json(result, {
      status: result.success ? 200 : 400,
    });
  } catch (error) {
    console.error('PhonePe Callback API Error:', error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Webhook processing failed',
      },
      { status: 500 }
    );
  }
}

/**
 * PhonePe Payment Status Check
 * GET /api/phonepe/callback?merchantTransactionId=...
 */
export async function GET(request: NextRequest) {
  try {
    const merchantTransactionId = request.nextUrl.searchParams.get(
      'merchantTransactionId'
    );

    if (!merchantTransactionId) {
      return NextResponse.json(
        { success: false, message: 'Missing merchantTransactionId parameter' },
        { status: 400 }
      );
    }

    const { verifyPhonePePayment } = await import('@/app/actions-phonepe');
    const result = await verifyPhonePePayment(merchantTransactionId);

    return NextResponse.json(result, {
      status: result.success ? 200 : 400,
    });
  } catch (error) {
    console.error('PhonePe Status Check Error:', error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Status check failed',
      },
      { status: 500 }
    );
  }
}
