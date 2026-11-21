import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
  Request,
  Headers,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Throttle } from '@nestjs/throttler';
import { WalletService } from './wallet.service';
import { RazorpayService } from './razorpay.service';

@Controller('api/v1/wallet')
export class WalletController {
  constructor(
    private readonly walletService: WalletService,
    private readonly razorpayService: RazorpayService,
  ) {}

  @UseGuards(AuthGuard('jwt'))
  @Get('balance')
  async getBalance(@Request() req: any) {
    const userId = req.user.userId || req.user.id || req.user.sub;
    return this.walletService.getBalance(userId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('transactions')
  async getTransactions(
    @Request() req: any,
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
  ) {
    const userId = req.user.userId || req.user.id || req.user.sub;
    return this.walletService.getTransactions(userId, Number(page) || 1, Number(pageSize) || 20);
  }

  @UseGuards(AuthGuard('jwt'))
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @Post('order')
  @HttpCode(HttpStatus.OK)
  async createOrder(@Request() req: any, @Body() body: { amountRupees: number }) {
    const userId = req.user.userId || req.user.id || req.user.sub;
    return this.walletService.createTopupOrder(userId, Number(body.amountRupees));
  }

  @UseGuards(AuthGuard('jwt'))
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @Post('verify')
  @HttpCode(HttpStatus.OK)
  async verifyPayment(
    @Request() req: any,
    @Body()
    body: {
      orderId?: string;
      paymentId?: string;
      signature?: string;
      razorpayOrderId?: string;
      razorpayPaymentId?: string;
      razorpaySignature?: string;
      amountRupees?: number;
    },
  ) {
    const userId = req.user.userId || req.user.id || req.user.sub;
    const orderId = body.orderId || body.razorpayOrderId;
    const paymentId = body.paymentId || body.razorpayPaymentId;
    const signature = body.signature || body.razorpaySignature;

    if (!orderId || !paymentId || !signature) {
      throw new BadRequestException('Missing orderId, paymentId, or signature in payment verification callback');
    }

    return this.walletService.verifyAndCreditTopup(
      userId,
      orderId,
      paymentId,
      signature,
      body.amountRupees !== undefined ? Number(body.amountRupees) : undefined,
    );
  }

  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  async handleWebhook(
    @Request() req: any,
    @Headers('x-razorpay-signature') signature: string,
    @Body() payload: any,
  ) {
    if (!signature) {
      throw new BadRequestException('Missing Razorpay webhook signature');
    }

    // Critical Check 2: Webhook signature verification uses the original raw request body
    const rawBody = req.rawBody ? req.rawBody.toString('utf8') : JSON.stringify(payload);
    const isValid = this.razorpayService.verifyWebhookSignature(rawBody, signature);
    if (!isValid && (this.razorpayService.isConfigured() || process.env.NODE_ENV === 'production')) {
      throw new BadRequestException('Invalid webhook signature');
    }

    const event = payload?.event;
    // Failed payments never credit the wallet
    if (event === 'payment.captured') {
      const payment = payload?.payload?.payment?.entity;
      const orderId = payment?.order_id;
      const paymentId = payment?.id;
      const amountRupees = payment?.amount ? payment.amount / 100 : 0;
      const userId = payment?.notes?.userId;

      if (userId && paymentId && amountRupees > 0 && payment?.status === 'captured') {
        // Critical Check 2: Separate webhook handling from frontend verification
        await this.walletService.creditFromWebhook(
          userId,
          orderId,
          paymentId,
          amountRupees,
        );
      }
    }

    return { status: 'processed' };
  }
}
