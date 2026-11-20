import { Injectable, Logger, BadRequestException, Optional } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

export interface RazorpayOrderResult {
  orderId: string;
  amountPaise: number;
  amountRupees: number;
  currency: string;
  keyId: string;
  receipt: string;
  status: string;
}

@Injectable()
export class RazorpayService {
  private readonly logger = new Logger(RazorpayService.name);
  private readonly keyId: string | undefined;
  private readonly keySecret: string | undefined;
  private readonly webhookSecret: string | undefined;

  constructor(@Optional() private readonly configService?: ConfigService) {
    this.keyId =
      this.configService?.get<string>('app.razorpay.keyId') ||
      process.env.RAZORPAY_KEY_ID ||
      undefined;
    this.keySecret =
      this.configService?.get<string>('app.razorpay.keySecret') ||
      process.env.RAZORPAY_KEY_SECRET ||
      undefined;
    this.webhookSecret =
      this.configService?.get<string>('app.razorpay.webhookSecret') ||
      process.env.RAZORPAY_WEBHOOK_SECRET ||
      undefined;
  }

  isConfigured(): boolean {
    return !!(this.keyId && this.keySecret);
  }

  getKeyId(): string {
    return this.keyId || 'rzp_test_chargemesh_sandbox';
  }

  async createOrder(userId: string, amountRupees: number): Promise<RazorpayOrderResult> {
    if (!amountRupees || amountRupees <= 0) {
      throw new BadRequestException('Top-up amount must be greater than zero');
    }
    if (amountRupees > 50000) {
      throw new BadRequestException('Single top-up cannot exceed ₹50,000.00');
    }

    const amountPaise = Math.round(amountRupees * 100);
    const receipt = `rcpt_${Date.now()}_${userId.slice(-6)}`;

    if (this.isConfigured()) {
      try {
        const authHeader = Buffer.from(`${this.keyId}:${this.keySecret}`).toString('base64');
        const res = await fetch('https://api.razorpay.com/v1/orders', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Basic ${authHeader}`,
          },
          body: JSON.stringify({
            amount: amountPaise,
            currency: 'INR',
            receipt,
            notes: { userId, platform: 'ChargeMesh' },
          }),
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          this.logger.error(`Razorpay API order error: ${JSON.stringify(errData)}`);
          throw new BadRequestException('Payment gateway was unable to initiate order');
        }

        const data: any = await res.json();
        return {
          orderId: data.id,
          amountPaise: data.amount,
          amountRupees: data.amount / 100,
          currency: data.currency || 'INR',
          keyId: this.keyId!,
          receipt: data.receipt,
          status: data.status,
        };
      } catch (err: any) {
        if (err instanceof BadRequestException) throw err;
        this.logger.error(`Razorpay connection failure: ${err.message}`);
        throw new BadRequestException('Failed to reach payment gateway');
      }
    }

    // Sandbox / Test fallback when credentials are not configured in local environment
    const sandboxOrderId = `order_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    this.logger.log(`[RAZORPAY TEST MODE] Created sandbox order ${sandboxOrderId} for ₹${amountRupees}`);

    return {
      orderId: sandboxOrderId,
      amountPaise,
      amountRupees,
      currency: 'INR',
      keyId: this.getKeyId(),
      receipt,
      status: 'created',
    };
  }

  verifyPaymentSignature(orderId: string, paymentId: string, signature: string): boolean {
    if (!orderId || !paymentId || !signature) {
      return false;
    }

    const secret = this.keySecret || 'test_secret_for_local_verification';
    const payload = `${orderId}|${paymentId}`;
    const generated = crypto.createHmac('sha256', secret).update(payload).digest('hex');

    try {
      const generatedBuf = Buffer.from(generated, 'utf-8');
      const signatureBuf = Buffer.from(signature, 'utf-8');
      if (generatedBuf.length !== signatureBuf.length) {
        return false;
      }
      return crypto.timingSafeEqual(generatedBuf, signatureBuf);
    } catch {
      return false;
    }
  }

  verifyWebhookSignature(rawBody: string, webhookSignature: string): boolean {
    if (!rawBody || !webhookSignature) {
      return false;
    }

    const secret = this.webhookSecret || this.keySecret || 'test_webhook_secret';
    const generated = crypto.createHmac('sha256', secret).update(rawBody).digest('hex');

    try {
      const generatedBuf = Buffer.from(generated, 'utf-8');
      const signatureBuf = Buffer.from(webhookSignature, 'utf-8');
      if (generatedBuf.length !== signatureBuf.length) {
        return false;
      }
      return crypto.timingSafeEqual(generatedBuf, signatureBuf);
    } catch {
      return false;
    }
  }
}
