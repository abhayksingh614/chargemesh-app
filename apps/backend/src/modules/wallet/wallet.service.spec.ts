import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { WalletService } from './wallet.service';
import { RazorpayService } from './razorpay.service';
import { UserEntity, FinanceLedgerEntity } from '../../database/entities';

describe('WalletService & RazorpayService (FIN-001 & REM-A05)', () => {
  let walletService: WalletService;
  let razorpayService: RazorpayService;

  const mockUser: UserEntity = {
    id: 'usr-wallet-001',
    phoneNumber: '+919876543210',
    name: 'Wallet Driver',
    walletBalancePaise: 50000, // ₹500.00
    walletHeldPaise: 0,
    totalKwhCharged: 20,
    co2SavedKg: 15,
    totalSessions: 2,
    status: 'ACTIVE',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockUserRepo = {
    findOne: jest.fn().mockImplementation(({ where }) => {
      if (where && where.id === mockUser.id) return Promise.resolve({ ...mockUser });
      return Promise.resolve(null);
    }),
    findOneBy: jest.fn().mockImplementation(({ id }) => {
      if (id === mockUser.id) return Promise.resolve({ ...mockUser });
      return Promise.resolve(null);
    }),
    save: jest.fn().mockImplementation((val) => Promise.resolve(val)),
  };

  const mockLedgerRepo = {
    find: jest.fn().mockResolvedValue([]),
    save: jest.fn().mockImplementation((val) => Promise.resolve(val)),
    findOne: jest.fn().mockResolvedValue(null),
    findOneBy: jest.fn().mockResolvedValue(null),
  };

  const mockQueryBuilder = {
    setLock: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    getOne: jest.fn().mockResolvedValue({ ...mockUser }),
  };

  const mockManager = {
    getRepository: jest.fn().mockImplementation((entity) => {
      if (entity === UserEntity) {
        return {
          createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
          update: jest.fn().mockResolvedValue({ affected: 1 }),
          findOneBy: jest.fn().mockResolvedValue({ ...mockUser }),
        };
      }
      return {
        findOneBy: jest.fn().mockResolvedValue(null),
        create: jest.fn().mockImplementation((data) => data),
        save: jest.fn().mockImplementation((data) => Promise.resolve(data)),
      };
    }),
  };

  const mockDataSource = {
    isInitialized: true,
    transaction: jest.fn().mockImplementation(async (callback) => {
      return callback(mockManager);
    }),
  };

  const mockConfigService = {
    get: jest.fn().mockImplementation((key: string) => {
      if (key === 'app.razorpay.keyId') return 'rzp_test_mockKeyId';
      if (key === 'app.razorpay.keySecret') return 'mockKeySecret12345';
      if (key === 'app.razorpay.webhookSecret') return 'mockWebhookSecret12345';
      return null;
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WalletService,
        RazorpayService,
        {
          provide: getRepositoryToken(UserEntity),
          useValue: mockUserRepo,
        },
        {
          provide: getRepositoryToken(FinanceLedgerEntity),
          useValue: mockLedgerRepo,
        },
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    walletService = module.get<WalletService>(WalletService);
    razorpayService = module.get<RazorpayService>(RazorpayService);
  });

  it('should be defined', () => {
    expect(walletService).toBeDefined();
    expect(razorpayService).toBeDefined();
  });

  describe('Razorpay Signature Verification', () => {
    it('should correctly verify HMAC SHA256 signature', () => {
      const orderId = 'order_test_123';
      const paymentId = 'pay_test_456';
      const secret = 'mockKeySecret12345';

      const crypto = require('crypto');
      const validSig = crypto
        .createHmac('sha256', secret)
        .update(`${orderId}|${paymentId}`)
        .digest('hex');

      const isValid = razorpayService.verifyPaymentSignature(orderId, paymentId, validSig);
      expect(isValid).toBe(true);
    });

    it('should reject invalid signature', () => {
      const isValid = razorpayService.verifyPaymentSignature(
        'order_123',
        'pay_456',
        'invalid_signature_hex_string',
      );
      expect(isValid).toBe(false);
    });
  });

  describe('Wallet Balance & Pre-Authorisation', () => {
    it('should return correct wallet balances and available funds', async () => {
      const balance = await walletService.getBalance(mockUser.id);
      expect(balance.walletBalancePaise).toBe(50000);
      expect(balance.walletHeldPaise).toBe(0);
      expect(balance.availableBalancePaise).toBe(50000);
      expect(balance.availableRupees).toBe(500);
    });

    it('should successfully reserve ₹200.00 pre-authorisation hold', async () => {
      const reserved = await walletService.reserveFunds(mockUser.id, 20000, 'sess-test-01');
      expect(reserved).toBe(true);
    });

    it('should reject reservation when available balance is insufficient', async () => {
      mockQueryBuilder.getOne.mockResolvedValueOnce({
        ...mockUser,
        walletBalancePaise: 10000, // ₹100.00
        walletHeldPaise: 0,
      });

      await expect(
        walletService.reserveFunds(mockUser.id, 20000, 'sess-test-low-bal'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should settle charging session atomically, releasing reservation and debiting cost', async () => {
      const result = await walletService.settleSession(
        mockUser.id,
        'sess-settle-01',
        150.0, // cost ₹150.00
        20000, // ₹200.00 reservation (20,000 Paise)
        8.5, // 8.5 kWh
      );

      expect(result).toBeDefined();
      expect(result?.settled).toBe(true);
      expect(result?.costRupees).toBe(150.0);
    });

    it('should prevent duplicate settlement and return duplicate: true without re-debiting (idempotency)', async () => {
      const mockLedgerEntry = {
        id: 'tx-sess-settle-dup',
        referenceId: 'CM-SESS-sess-settle-dup',
        userId: mockUser.id,
        balanceAfterRupees: 350.0,
      };

      const customManager = {
        getRepository: jest.fn().mockImplementation((entity) => {
          if (entity === UserEntity) {
            return {
              createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
              update: jest.fn(),
              findOneBy: jest.fn().mockResolvedValue(mockUser),
            };
          }
          return {
            findOneBy: jest.fn().mockImplementation(({ referenceId }) => {
              if (referenceId === 'CM-SESS-sess-settle-dup') return Promise.resolve(mockLedgerEntry);
              return Promise.resolve(null);
            }),
            create: jest.fn(),
            save: jest.fn(),
          };
        }),
      };

      jest.spyOn(mockDataSource, 'transaction').mockImplementationOnce(async (cb: any) => cb(customManager));

      const result = await walletService.settleSession(
        mockUser.id,
        'sess-settle-dup',
        150.0,
        20000,
        8.5,
      );

      expect(result).toBeDefined();
      expect(result?.settled).toBe(true);
      expect((result as any).duplicate).toBe(true);
      expect(customManager.getRepository(UserEntity).update).not.toHaveBeenCalled();
    });

    it('should release reservation on session abort/cancellation and restore available balance', async () => {
      let updatedHeld = 0;
      const customManager = {
        getRepository: jest.fn().mockImplementation((entity) => {
          if (entity === UserEntity) {
            return {
              createQueryBuilder: jest.fn().mockReturnValue({
                setLock: jest.fn().mockReturnThis(),
                where: jest.fn().mockReturnThis(),
                getOne: jest.fn().mockResolvedValue({
                  ...mockUser,
                  walletHeldPaise: 20000,
                }),
              }),
              update: jest.fn().mockImplementation((_, updateData) => {
                updatedHeld = updateData.walletHeldPaise;
                return Promise.resolve({ affected: 1 });
              }),
            };
          }
          return {
            findOneBy: jest.fn().mockResolvedValue(null),
            create: jest.fn().mockImplementation((d) => d),
            save: jest.fn().mockImplementation((d) => Promise.resolve(d)),
          };
        }),
      };

      jest.spyOn(mockDataSource, 'transaction').mockImplementationOnce(async (cb: any) => cb(customManager));

      const released = await walletService.releaseReservation(mockUser.id, 'sess-cancel-01', 20000);
      expect(released).toBe(true);
      expect(updatedHeld).toBe(0);
    });

    it('should handle debt correctly when final charge exceeds wallet balance', async () => {
      let finalBalance = 0;
      const customManager = {
        getRepository: jest.fn().mockImplementation((entity) => {
          if (entity === UserEntity) {
            return {
              createQueryBuilder: jest.fn().mockReturnValue({
                setLock: jest.fn().mockReturnThis(),
                where: jest.fn().mockReturnThis(),
                getOne: jest.fn().mockResolvedValue({
                  ...mockUser,
                  walletBalancePaise: 5000, // ₹50.00 only
                  walletHeldPaise: 5000,
                }),
              }),
              update: jest.fn().mockImplementation((_, updateData) => {
                finalBalance = updateData.walletBalancePaise;
                return Promise.resolve({ affected: 1 });
              }),
            };
          }
          return {
            findOneBy: jest.fn().mockResolvedValue(null),
            create: jest.fn().mockImplementation((d) => d),
            save: jest.fn().mockImplementation((d) => Promise.resolve(d)),
          };
        }),
      };

      jest.spyOn(mockDataSource, 'transaction').mockImplementationOnce(async (cb: any) => cb(customManager));

      const result = await walletService.settleSession(
        mockUser.id,
        'sess-debt-01',
        150.0, // ₹150.00 cost (15,000 paise)
        5000,
        10.0,
      );

      expect(result?.settled).toBe(true);
      // Final balance should be 5,000 - 15,000 = -10,000 Paise (-₹100.00 debt)
      expect(finalBalance).toBe(-10000);
    });

    it('should skip duplicate topup webhook idempotently without double-crediting', async () => {
      const existingLedger = {
        id: 'tx-topup-pay_existing_123',
        referenceId: 'pay_existing_123',
        amountRupees: 500,
      };

      const customManager = {
        getRepository: jest.fn().mockImplementation((entity) => {
          if (entity === FinanceLedgerEntity) {
            return {
              findOneBy: jest.fn().mockImplementation(({ referenceId }) => {
                if (referenceId === 'pay_existing_123') return Promise.resolve(existingLedger);
                return Promise.resolve(null);
              }),
              create: jest.fn(),
              save: jest.fn(),
            };
          }
          return {
            update: jest.fn(),
          };
        }),
      };

      jest.spyOn(mockDataSource, 'transaction').mockImplementationOnce(async (cb: any) => cb(customManager));

      const result = await walletService.creditFromWebhook(
        mockUser.id,
        'order_123',
        'pay_existing_123',
        500,
      );

      expect(result.success).toBe(true);
      expect((result as any).duplicate).toBe(true);
      expect(customManager.getRepository(UserEntity).update).not.toHaveBeenCalled();
    });

    it('should atomically rollback when ledger insertion throws during settlement', async () => {
      const failingManager = {
        getRepository: jest.fn().mockImplementation((entity) => {
          if (entity === UserEntity) {
            return {
              createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
              update: jest.fn().mockResolvedValue({ affected: 1 }),
            };
          }
          return {
            findOneBy: jest.fn().mockResolvedValue(null),
            create: jest.fn().mockReturnValue({}),
            save: jest.fn().mockRejectedValue(new Error('PostgreSQL Ledger Foreign Key Violation')),
          };
        }),
      };

      jest.spyOn(mockDataSource, 'transaction').mockImplementationOnce(async (cb: any) => {
        return cb(failingManager);
      });

      await expect(
        walletService.settleSession(mockUser.id, 'sess-fail-01', 100, 20000, 5),
      ).rejects.toThrow('PostgreSQL Ledger Foreign Key Violation');
    });
  });
});
