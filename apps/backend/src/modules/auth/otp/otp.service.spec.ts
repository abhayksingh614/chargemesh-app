import {
  BadRequestException,
  UnauthorizedException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { OtpService } from './otp.service';
import { MockOtpProvider } from './mock-otp.provider';
import { ProductionSmsProviderStub } from './production-sms.provider';
import { RedisOtpStorageService } from './redis-otp-storage.service';

describe('OtpService (SEC-005, SEC-006, SEC-007 Security Controls)', () => {
  let service: OtpService;
  let storage: RedisOtpStorageService;

  beforeAll(() => {
    storage = new RedisOtpStorageService();
  });

  afterAll(async () => {
    await storage.onModuleDestroy();
  });

  beforeEach(async () => {
    await storage.delete('+919876543210');
    await storage.delete('+919999999999');
    service = new OtpService(undefined, storage, new MockOtpProvider());
  });

  it('should send OTP and return cooldown', async () => {
    const res = await service.sendOtp('+919876543210');
    expect(res.success).toBe(true);
    expect(res.cooldownSeconds).toBe(60);
    expect(res.debugCode).toBeDefined();
  });

  it('should enforce 60-second cooldown on consecutive OTP requests', async () => {
    await service.sendOtp('+919876543210');
    await expect(service.sendOtp('+919876543210')).rejects.toThrow(
      BadRequestException,
    );
  });

  it('should verify correct OTP successfully and invalidate upon use (single-use guarantee)', async () => {
    const { debugCode } = await service.sendOtp('+919876543210');
    expect(debugCode).toBeDefined();

    const verified = await service.verifyOtp('+919876543210', debugCode!);
    expect(verified).toBe(true);

    // Replay attack must fail (single-use guarantee)
    await expect(
      service.verifyOtp('+919876543210', debugCode!),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('should decrement remaining attempts on wrong OTP and lock out after 3 failures', async () => {
    await service.sendOtp('+919876543210');

    // Attempt 1: wrong
    await expect(service.verifyOtp('+919876543210', '000000')).rejects.toThrow(
      /2 attempts remaining/,
    );

    // Attempt 2: wrong
    await expect(service.verifyOtp('+919876543210', '000000')).rejects.toThrow(
      /1 attempts remaining/,
    );

    // Attempt 3: wrong (lockout)
    await expect(service.verifyOtp('+919876543210', '000000')).rejects.toThrow(
      /Maximum attempts exceeded/,
    );

    // Subsequent attempt should report no OTP found / invalidated
    await expect(service.verifyOtp('+919876543210', '000000')).rejects.toThrow(
      /No OTP request found/,
    );
  });

  it('should reject arbitrary 6-digit OTP when no OTP was requested', async () => {
    await expect(
      service.verifyOtp('+919999999999', '654321'),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('SEC-006: ProductionSmsProviderStub should fail-closed when credentials absent', async () => {
    const prodProvider = new ProductionSmsProviderStub();
    expect(prodProvider.isAvailable()).toBe(false);

    const prodService = new OtpService(undefined, storage, prodProvider);
    await expect(prodService.sendOtp('+919876543210')).rejects.toThrow(
      ServiceUnavailableException,
    );
  });

  it('SEC-006: getProviderStatus returns health information without crashing', () => {
    const status = service.getProviderStatus();
    expect(status.providerName).toBe('mock-development-otp');
    expect(status.isAvailable).toBe(true);
  });
});
