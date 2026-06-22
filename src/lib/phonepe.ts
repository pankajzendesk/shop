import crypto from 'crypto';

export interface PhonePePaymentRequest {
  merchantTransactionId: string;
  amount: number;
  customerId: string;
  phone: string;
  redirectUrl: string;
  callbackUrl: string;
}

export interface PhonePePaymentResponse {
  success: boolean;
  code: string;
  message: string;
  data?: {
    instrumentResponseCode: string;
    transactionId: string;
    redirectUrl?: string;
  };
}

export class PhonePeGateway {
  private merchantId: string;
  private apiKey: string;
  private saltIndex: number = 1;
  private baseUrl: string;

  constructor(merchantId: string, apiKey: string, isProduction: boolean = false) {
    this.merchantId = merchantId;
    this.apiKey = apiKey;
    this.baseUrl = isProduction
      ? 'https://api.phonepe.com/apis/hermes'
      : 'https://api-sandbox.phonepe.com/apis/hermes';
  }

  /**
   * Generate SHA256 checksum for request
   */
  private generateChecksum(requestBody: string | object): string {
    const payload = typeof requestBody === 'string' ? requestBody : JSON.stringify(requestBody);
    const message = payload + this.apiKey;
    return crypto.createHash('sha256').update(message).digest('hex');
  }

  /**
   * Generate X-Verify header for PhonePe API
   */
  private generateVerifyHeader(checksum: string): string {
    return `${checksum}###${this.saltIndex}`;
  }

  /**
   * Initiate UPI payment request
   */
  async initiatePayment(paymentData: PhonePePaymentRequest): Promise<PhonePePaymentResponse> {
    try {
      const requestPayload = {
        merchantId: this.merchantId,
        merchantTransactionId: paymentData.merchantTransactionId,
        merchantUserId: paymentData.customerId,
        amount: paymentData.amount * 100, // Convert to paise
        redirectUrl: paymentData.redirectUrl,
        redirectMode: 'REDIRECT',
        callbackUrl: paymentData.callbackUrl,
        mobileNumber: paymentData.phone,
        paymentInstrument: {
          type: 'UPI',
          targetApp: 'PHONEPE',
        },
        deviceContext: {
          deviceOS: 'WEB',
        },
      };

      // Encode payload in base64
      const base64Payload = Buffer.from(JSON.stringify(requestPayload)).toString('base64');

      // Generate checksum
      const checksum = this.generateChecksum(base64Payload);
      const xVerify = this.generateVerifyHeader(checksum);

      // Make API request
      const response = await fetch(`${this.baseUrl}/pg/v1/pay`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-VERIFY': xVerify,
          'X-MERCHANT-ID': this.merchantId,
        },
        body: JSON.stringify({
          request: base64Payload,
        }),
      });

      const result = await response.json();
      return result as PhonePePaymentResponse;
    } catch (error) {
      console.error('PhonePe Payment Initiation Error:', error);
      throw new Error(`Failed to initiate PhonePe payment: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Verify payment status
   */
  async verifyPayment(merchantTransactionId: string): Promise<PhonePePaymentResponse> {
    try {
      const requestString = `/pg/v1/status/${this.merchantId}/${merchantTransactionId}`;
      const checksum = this.generateChecksum(requestString);
      const xVerify = this.generateVerifyHeader(checksum);

      const response = await fetch(
        `${this.baseUrl}${requestString}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'X-VERIFY': xVerify,
            'X-MERCHANT-ID': this.merchantId,
          },
        }
      );

      const result = await response.json();
      return result as PhonePePaymentResponse;
    } catch (error) {
      console.error('PhonePe Payment Verification Error:', error);
      throw new Error(`Failed to verify PhonePe payment: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Validate webhook request signature
   */
  validateWebhookSignature(requestBody: string, xVerify: string): boolean {
    try {
      const [receivedChecksum, receivedSalt] = xVerify.split('###');
      const message = requestBody + this.apiKey;
      const calculatedChecksum = crypto.createHash('sha256').update(message).digest('hex');

      return receivedChecksum === calculatedChecksum;
    } catch (error) {
      console.error('Webhook validation error:', error);
      return false;
    }
  }
}

/**
 * Initialize PhonePe Gateway with environment variables
 */
export function initializePhonePe(): PhonePeGateway {
  const merchantId = process.env.PHONEPE_MERCHANT_ID;
  const apiKey = process.env.PHONEPE_API_KEY;
  const isProduction = process.env.PHONEPE_ENV === 'production';

  if (!merchantId || !apiKey) {
    throw new Error('PhonePe credentials not configured. Please set PHONEPE_MERCHANT_ID and PHONEPE_API_KEY environment variables.');
  }

  return new PhonePeGateway(merchantId, apiKey, isProduction);
}
