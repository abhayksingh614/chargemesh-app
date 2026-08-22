import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue('mock-jwt-token'),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should register a new user and return token', async () => {
    const res = await service.register({
      phoneNumber: '+919999888877',
      name: 'Rohan Sharma',
      vehicle: {
        make: 'MG',
        model: 'ZS EV',
        connectorType: 'CCS2',
        batteryCapacity: 50.3,
      },
    });

    expect(res).toBeDefined();
    expect(res.user.phoneNumber).toBe('+919999888877');
    expect(res.token).toBe('mock-jwt-token');
  });

  it('should login an existing or new user with OTP', async () => {
    const res = await service.login({
      phoneNumber: '+919876543210',
      otp: '123456',
    });

    expect(res).toBeDefined();
    expect(res.user.phoneNumber).toBe('+919876543210');
    expect(res.token).toBe('mock-jwt-token');
  });
});
