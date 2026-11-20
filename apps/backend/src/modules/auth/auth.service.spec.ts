import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException, BadRequestException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { OtpService } from './otp/otp.service';
import { UserEntity } from '../../database/entities';

describe('AuthService (Driver Auth & SEC-005 OTP)', () => {
  let service: AuthService;
  let module: TestingModule;

  const users: UserEntity[] = [
    {
      id: 'usr-default-01',
      phoneNumber: '+919876543210',
      name: 'Rahul',
      email: 'rahul@gmail.com',
      vehicle: {
        make: 'Tata',
        model: 'Nexon EV Max',
        connectorType: 'CCS2',
        batteryCapacity: 40.5,
      },
      walletBalancePaise: 0,
      walletHeldPaise: 0,
      totalKwhCharged: 0,
      co2SavedKg: 0,
      totalSessions: 0,
      status: 'ACTIVE',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  const mockUserRepo = {
    findOneBy: jest.fn().mockImplementation(({ phoneNumber, id }) => {
      const user = users.find((u) => u.phoneNumber === phoneNumber || u.id === id);
      return Promise.resolve(user || null);
    }),
    save: jest.fn().mockImplementation((val) => {
      users.push(val);
      return Promise.resolve(val);
    }),
  };

  beforeEach(async () => {
    module = await Test.createTestingModule({
      providers: [
        AuthService,
        OtpService,
        { provide: getRepositoryToken(UserEntity), useValue: mockUserRepo },
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

  afterAll(async () => {
    await module.close();
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

  it('should reject login when OTP is missing', async () => {
    await expect(
      service.login({ phoneNumber: '+919876543210' }),
    ).rejects.toThrow(BadRequestException);
  });

  it('should login an existing user with valid OTP flow', async () => {
    // Request OTP first
    const otpRes = await service.requestOtp('+919876543210');
    expect(otpRes.success).toBe(true);
    expect(otpRes.debugCode).toBeDefined();

    const res = await service.login({
      phoneNumber: '+919876543210',
      otp: otpRes.debugCode!,
    });

    expect(res).toBeDefined();
    expect(res.user.phoneNumber).toBe('+919876543210');
    expect(res.token).toBe('mock-jwt-token');
  });

  it('should reject login with wrong OTP', async () => {
    await service.requestOtp('+919876543210');
    await expect(
      service.login({
        phoneNumber: '+919876543210',
        otp: '999999',
      }),
    ).rejects.toThrow(UnauthorizedException);
  });
});
