import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { AdminFinanceService } from './admin-finance.service';
import { AdminAuditService } from './admin-audit.service';
import { AdminUsersService } from './admin-users.service';
import { FinanceLedgerEntity, UserEntity } from '../../database/entities';
import { AdminRole, AuditActionType } from '@chargemesh/shared-types';

describe('AdminFinanceService (Financial Integrity REM-A03 & AUDIT-005)', () => {
  let service: AdminFinanceService;
  let module: TestingModule;

  const mockDbUser: UserEntity = {
    id: 'usr-fin-001',
    phoneNumber: '+919876500002',
    name: 'Finance Test User',
    status: 'ACTIVE',
    walletBalancePaise: 100000, // ₹1,000.00
    walletHeldPaise: 0,
    totalKwhCharged: 50,
    co2SavedKg: 40,
    totalSessions: 3,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
  };

  const mockFinanceRepo = {
    find: jest.fn().mockResolvedValue([]),
    save: jest.fn().mockImplementation((val) => Promise.resolve(val)),
    create: jest.fn().mockImplementation((val) => val),
  };

  const mockUserRepo = {
    findOneBy: jest.fn().mockResolvedValue(mockDbUser),
    update: jest.fn().mockResolvedValue({ affected: 1 }),
  };

  const mockUsersService = {
    findById: jest.fn().mockResolvedValue({
      id: 'usr-fin-001',
      name: 'Finance Test User',
      walletBalancePaise: 100000,
    }),
  };

  const mockAuditService = {
    record: jest.fn().mockResolvedValue(true),
  };

  const mockEntityManager = {
    getRepository: jest.fn().mockImplementation((entity) => {
      if (entity === UserEntity) {
        return {
          createQueryBuilder: jest.fn().mockReturnValue({
            setLock: jest.fn().mockReturnThis(),
            where: jest.fn().mockReturnThis(),
            getOne: jest.fn().mockResolvedValue({ ...mockDbUser }),
          }),
          update: jest.fn().mockResolvedValue({ affected: 1 }),
        };
      }
      return mockFinanceRepo;
    }),
  };

  const mockDataSource = {
    isInitialized: true,
    transaction: jest.fn().mockImplementation((cb) => cb(mockEntityManager)),
  };

  beforeEach(async () => {
    module = await Test.createTestingModule({
      providers: [
        AdminFinanceService,
        { provide: getRepositoryToken(FinanceLedgerEntity), useValue: mockFinanceRepo },
        { provide: getRepositoryToken(UserEntity), useValue: mockUserRepo },
        { provide: DataSource, useValue: mockDataSource },
        { provide: AdminAuditService, useValue: mockAuditService },
        { provide: AdminUsersService, useValue: mockUsersService },
      ],
    }).compile();

    service = module.get<AdminFinanceService>(AdminFinanceService);
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await module.close();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should retrieve transactions with pagination', async () => {
    const result = await service.getTransactions({ page: 1, pageSize: 5 });
    expect(result.success).toBe(true);
    expect(result.data.length).toBeGreaterThan(0);
    expect(result.pagination.pageSize).toBe(5);
  });

  it('should reject adjustment with non-positive amount', async () => {
    const adminActor = { id: 'adm-001', name: 'Super Admin', role: AdminRole.SUPER_ADMIN };
    await expect(
      service.adjustWalletBalance('usr-fin-001', -50, true, 'Invalid negative', undefined, adminActor),
    ).rejects.toThrow(BadRequestException);

    await expect(
      service.adjustWalletBalance('usr-fin-001', 0, true, 'Zero amount', undefined, adminActor),
    ).rejects.toThrow(BadRequestException);
  });

  it('REM-A03: should atomically credit wallet and insert ledger record', async () => {
    const adminActor = { id: 'adm-001', name: 'Super Admin', role: AdminRole.SUPER_ADMIN };
    const res = await service.adjustWalletBalance(
      'usr-fin-001',
      500, // ₹500 credit
      true,
      'Compensation for charger disruption',
      'TICKET-101',
      adminActor,
    );

    expect(res.success).toBe(true);
    expect(res.updatedBalanceRupees).toBe(1500); // 1000 + 500
    expect(res.transaction.amountRupees).toBe(500);
    expect(res.transaction.balanceAfterRupees).toBe(1500);
    expect(mockDataSource.transaction).toHaveBeenCalled();
    expect(mockAuditService.record).toHaveBeenCalledWith(
      expect.objectContaining({
        action: AuditActionType.WALLET_ADJUSTMENT,
        targetId: 'usr-fin-001',
      }),
    );
  });

  it('REM-A03: should atomically debit wallet without negative balance overflow', async () => {
    const adminActor = { id: 'adm-001', name: 'Super Admin', role: AdminRole.SUPER_ADMIN };
    const res = await service.adjustWalletBalance(
      'usr-fin-001',
      300, // ₹300 debit
      false,
      'Adjustment correction',
      undefined,
      adminActor,
    );

    expect(res.success).toBe(true);
    expect(res.updatedBalanceRupees).toBe(700); // 1000 - 300
    expect(res.transaction.amountRupees).toBe(300);
    expect(res.transaction.isCredit).toBe(false);
  });

  it('should reject adjustment for non-existent driver', async () => {
    const adminActor = { id: 'adm-001', name: 'Super Admin', role: AdminRole.SUPER_ADMIN };
    mockUsersService.findById.mockResolvedValueOnce(null as any);
    mockEntityManager.getRepository.mockImplementationOnce(() => ({
      createQueryBuilder: jest.fn().mockReturnValue({
        setLock: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(null),
      }),
    }));

    await expect(
      service.adjustWalletBalance('usr-nonexistent', 100, true, 'Test', undefined, adminActor),
    ).rejects.toThrow(NotFoundException);
  });
});
