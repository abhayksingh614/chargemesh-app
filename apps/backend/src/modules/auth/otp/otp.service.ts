import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  Logger,
  Optional,
  Inject,
  OnModuleDestroy,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import { IOtpProvider, IOtpStorage, StoredOtpRecord } from './otp.interface';
import { MockOtpProvider } from './mock-otp.provider';
import { ProductionSmsProviderStub } from './production-sms.provider';
import { RedisOtpStorageService } from './redis-otp-storage.service';

@Injectable()
export class OtpService implements OnModuleDestroy {
  private readonly logger = new Logger(OtpService.name);
  private readonly provider: IOtpProvider;
  private readonly storage: IOtpStorage;
  private readonly OTP_TTL_MS = 5 * 60 * 1000; // 5 minutes
  private readonly COOLDOWN_MS = 60 * 1000; // 60 seconds
  private readonly MAX_ATTEMPTS = 3;

  constructor(
    @Optional() private readonly configService?: ConfigService,
    @Optional() @Inject(RedisOtpStorageService) storageService?: IOtpStorage,
    @Optional() customProvider?: IOtpProvider,
  ) {
    this.storage = storageService || new RedisOtpStorageService(configService);

    if (customProvider) {
      this.provider = customProvider;
    } else {
      const isProduction =
        this.configService?.get<boolean>('app.isProduction') ??
        process.env.NODE_ENV === 'production';

      if (isProduction) {
        this.provider = new ProductionSmsProviderStub(configService);
      } else {
        this.provider = new MockOtpProvider();
      }
    }
  }

  private hashOtp(code: string, salt: string): string {
    return crypto.createHash('sha256').update(`${salt}:${code}`).digest('hex');
  }

  async sendOtp(
    phoneNumber: string,
    purpose = 'auth',
  ): Promise<{ success: boolean; cooldownSeconds: number; debugCode?: string }> {
    const normalizedPhone = phoneNumber.trim().replace(/\D/g, '');
    if (normalizedPhone.length < 10) {
      throw new BadRequestException('Invalid phone number format');
    }

    const now = Date.now();
    const existing = await this.storage.get(normalizedPhone, purpose);

    if (existing && now - existing.lastSentAt < this.COOLDOWN_MS) {
      const remainingCooldown = Math.ceil(
        (this.COOLDOWN_MS - (now - existing.lastSentAt)) / 1000,
      );
      throw new BadRequestException(
        `Please wait ${remainingCooldown} seconds before requesting a new OTP`,
      );
    }

    // Generate cryptographically random 6-digit numeric OTP
    const rawNumber = crypto.randomInt(100000, 999999).toString();
    const codeHash = this.hashOtp(rawNumber, normalizedPhone);

    const record: StoredOtpRecord = {
      codeHash,
      attempts: 0,
      maxAttempts: this.MAX_ATTEMPTS,
      expiresAt: now + this.OTP_TTL_MS,
      lastSentAt: now,
      purpose,
    };

    await this.storage.set(normalizedPhone, record, this.OTP_TTL_MS);

    const result = await this.provider.sendOtp(normalizedPhone, rawNumber);
    return {
      success: true,
      cooldownSeconds: 60,
      debugCode: result.debugCode,
    };
  }

  async verifyOtp(
    phoneNumber: string,
    submittedCode: string,
    purpose = 'auth',
  ): Promise<boolean> {
    const isProduction =
      this.configService?.get<boolean>('app.isProduction') ??
      process.env.NODE_ENV === 'production';
    const normalizedPhone = phoneNumber.trim().replace(/\D/g, '');

    if (!submittedCode || submittedCode.trim().length !== 6) {
      throw new UnauthorizedException('OTP must be exactly 6 digits');
    }

    const record = await this.storage.get(normalizedPhone, purpose);
    const now = Date.now();

    // Development fallback (only if not in production and no active OTP was requested)
    if (!record && !isProduction && submittedCode === '123456') {
      this.logger.warn(
        `Development OTP bypass used for phone ${normalizedPhone}. Disabled in production.`,
      );
      return true;
    }

    if (!record) {
      throw new UnauthorizedException(
        'No OTP request found for this phone number. Please request a new OTP.',
      );
    }

    if (now > record.expiresAt) {
      await this.storage.delete(normalizedPhone, purpose);
      throw new UnauthorizedException('OTP has expired. Please request a new code.');
    }

    if (record.attempts >= record.maxAttempts) {
      await this.storage.delete(normalizedPhone, purpose);
      throw new UnauthorizedException(
        'Too many invalid attempts. This OTP has been invalidated.',
      );
    }

    const submittedHash = this.hashOtp(submittedCode, normalizedPhone);
    const isMatch = crypto.timingSafeEqual(
      Buffer.from(submittedHash, 'utf8'),
      Buffer.from(record.codeHash, 'utf8'),
    );

    if (!isMatch) {
      const attempts = await this.storage.incrementAttempts(normalizedPhone, purpose);
      const remaining = record.maxAttempts - attempts;
      if (remaining <= 0) {
        await this.storage.delete(normalizedPhone, purpose);
        throw new UnauthorizedException(
          'Incorrect OTP. Maximum attempts exceeded. Please request a new OTP.',
        );
      }
      throw new UnauthorizedException(`Incorrect OTP. ${remaining} attempts remaining.`);
    }

    // Single-use: delete on success
    await this.storage.delete(normalizedPhone, purpose);
    return true;
  }

  getProviderStatus(): {
    providerName: string;
    isAvailable: boolean;
    storageConnected: boolean;
  } {
    return {
      providerName: this.provider.providerName,
      isAvailable: this.provider.isAvailable(),
      storageConnected: this.storage.isConnected,
    };
  }

  async onModuleDestroy() {
    if (this.storage && typeof (this.storage as any).onModuleDestroy === 'function') {
      await (this.storage as any).onModuleDestroy();
    }
  }
}
