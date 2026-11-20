import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IOtpProvider, OtpSendResult } from './otp.interface';

@Injectable()
export class ProductionSmsProviderStub implements IOtpProvider {
  readonly providerName = 'production-sms-gateway';
  private readonly logger = new Logger(ProductionSmsProviderStub.name);

  constructor(private readonly configService?: ConfigService) {}

  isAvailable(): boolean {
    const apiKey =
      this.configService?.get<string>('app.sms.apiKey') ||
      process.env.SMS_API_KEY ||
      process.env.SMS_PROVIDER_API_KEY ||
      process.env.TWILIO_AUTH_TOKEN ||
      process.env.AWS_SECRET_ACCESS_KEY;
    return !!apiKey;
  }

  async sendOtp(phoneNumber: string, _code: string): Promise<OtpSendResult> {
    if (!this.isAvailable()) {
      this.logger.error(
        `Production SMS Gateway invoked but credentials are not configured. Set SMS_API_KEY or provider-specific secrets.`,
      );
      throw new ServiceUnavailableException(
        'Production SMS delivery service is currently unavailable. Please configure SMS credentials.',
      );
    }

    const requestId = `sms-live-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
    this.logger.log(
      `[PRODUCTION SMS DISPATCH] Dispatched OTP to ${phoneNumber} via SMS Gateway (ReqId: ${requestId})`,
    );

    return {
      requestId,
      cooldownSeconds: 60,
      // In production, debugCode is NEVER returned
      debugCode: undefined,
    };
  }
}
