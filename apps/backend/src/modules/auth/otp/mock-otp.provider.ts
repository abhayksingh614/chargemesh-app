import { Injectable, Logger } from '@nestjs/common';
import { IOtpProvider, OtpSendResult } from './otp.interface';

@Injectable()
export class MockOtpProvider implements IOtpProvider {
  readonly providerName = 'mock-development-otp';
  private readonly logger = new Logger(MockOtpProvider.name);

  isAvailable(): boolean {
    return process.env.NODE_ENV !== 'production';
  }

  async sendOtp(phoneNumber: string, code: string): Promise<OtpSendResult> {
    if (process.env.NODE_ENV === 'production') {
      throw new Error(
        'FATAL SEC-005: MockOtpProvider is strictly prohibited in production. Configure a production SMS provider.',
      );
    }

    const requestId = `mock-req-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
    this.logger.log(`[MOCK OTP DISPATCH] Phone: ${phoneNumber} | Code: ${code} | RequestId: ${requestId}`);

    return {
      requestId,
      cooldownSeconds: 60,
      debugCode: code,
    };
  }
}
