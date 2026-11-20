import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { AdminUsersService } from './admin-users.service';
import { AdminAuditService } from './admin-audit.service';
import { UserEntity } from '../../database/entities';
import { AdminRole, AuditActionType } from '@chargemesh/shared-types';

describe('AdminUsersService (Driver Data Persistence REM-A02)', () => {
  let service: AdminUsersService;
  let module: TestingModule;

  const mockDbUser: UserEntity = {
    id: 'usr-db-001',
    phoneNumber: '+919876500001',
    name: 'Persistent Driver',
    email: 'persistent@example.com',
    status: 'ACTIVE',
    walletBalancePaise: 50000,
    walletHeldPaise: 0,
    totalKwhCharged: 120.5,
    co2SavedKg: 98.4,
    totalSessions: 6,
    vehicle: {
      make: 'Tata',
      model: 'Nexon EV',
      connectorType: 'CCS2',
      batteryCapacity: 40.5,
    },
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-02'),
  };

  const mockQueryBuilder = {
    andWhere: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    getManyAndCount: jest.fn().mockResolvedValue([[mockDbUser], 1]),
  };

  const mockUserRepo = {
    findOneBy: jest.fn().mockImplementation(({ id }) => {
      if (id === 'usr-db-001') return Promise.resolve(mockDbUser);
      return Promise.resolve(null);
    }),
    createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
    update: jest.fn().mockResolvedValue({ affected: 1 }),
  };

  const mockAuditService = {
    record: jest.fn().mockResolvedValue(true),
  };

  beforeEach(async () => {
    module = await Test.createTestingModule({
      providers: [
        AdminUsersService,
        { provide: getRepositoryToken(UserEntity), useValue: mockUserRepo },
        { provide: AdminAuditService, useValue: mockAuditService },
      ],
    }).compile();

    service = module.get<AdminUsersService>(AdminUsersService);
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await module.close();
  });

  it('should find driver by ID from database repository', async () => {
    const user = await service.findById('usr-db-001');
    expect(user).toBeDefined();
    expect(user.id).toBe('usr-db-001');
    expect(user.name).toBe('Persistent Driver');
    expect(mockUserRepo.findOneBy).toHaveBeenCalledWith({ id: 'usr-db-001' });
  });

  it('should fallback to demo user in memory if not in database', async () => {
    const user = await service.findById('usr-abhay-01');
    expect(user).toBeDefined();
    expect(user.id).toBe('usr-abhay-01');
    expect(user.name).toBe('Abhay Singh');
  });

  it('should throw NotFoundException if driver is not found in database or memory', async () => {
    await expect(service.findById('usr-nonexistent')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('should retrieve drivers via createQueryBuilder and paginate correctly', async () => {
    const result = await service.findAll({ page: 1, pageSize: 10, search: 'Driver' });
    expect(result.success).toBe(true);
    expect(result.data).toHaveLength(1);
    expect(result.data[0].id).toBe('usr-db-001');
    expect(result.pagination.total).toBe(1);
    expect(mockUserRepo.createQueryBuilder).toHaveBeenCalledWith('u');
    expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
      '(LOWER(u.name) LIKE :s OR u.phoneNumber LIKE :s OR LOWER(u.email) LIKE :s)',
      { s: '%driver%' },
    );
  });

  it('should update driver status and persist to database while recording audit log', async () => {
    const adminActor = {
      id: 'adm-001',
      name: 'Super Admin',
      role: AdminRole.SUPER_ADMIN,
    };

    const updated = await service.updateStatus(
      'usr-db-001',
      'SUSPENDED',
      'Policy violation check',
      adminActor,
    );

    expect(updated.status).toBe('SUSPENDED');
    expect(mockUserRepo.update).toHaveBeenCalledWith('usr-db-001', {
      status: 'SUSPENDED',
      updatedAt: expect.any(Date),
    });
    expect(mockAuditService.record).toHaveBeenCalledWith(
      expect.objectContaining({
        actorId: 'adm-001',
        action: AuditActionType.USER_SUSPEND,
        targetEntity: 'USER',
        targetId: 'usr-db-001',
        newValue: { status: 'SUSPENDED' },
        reason: 'Policy violation check',
      }),
    );
  });
});
