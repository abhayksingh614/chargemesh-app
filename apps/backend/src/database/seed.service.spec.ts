import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { SeedService } from './seed.service';
import {
  UserEntity,
  AdminUserEntity,
  CpoEntity,
  ChargingStationEntity,
  ConnectorEntity,
  ChargingSessionEntity,
  FinanceLedgerEntity,
  AuditLogEntity,
} from './entities';

describe('SeedService (Idempotent Database Seeding)', () => {
  let service: SeedService;
  let module: TestingModule;

  const mockRepo = {
    count: jest.fn().mockResolvedValue(0),
    save: jest.fn().mockImplementation((val) => Promise.resolve(val)),
    find: jest.fn().mockResolvedValue([]),
  };

  beforeEach(async () => {
    module = await Test.createTestingModule({
      providers: [
        SeedService,
        { provide: getRepositoryToken(UserEntity), useValue: mockRepo },
        { provide: getRepositoryToken(AdminUserEntity), useValue: mockRepo },
        { provide: getRepositoryToken(CpoEntity), useValue: mockRepo },
        { provide: getRepositoryToken(ChargingStationEntity), useValue: mockRepo },
        { provide: getRepositoryToken(ConnectorEntity), useValue: mockRepo },
        { provide: getRepositoryToken(ChargingSessionEntity), useValue: mockRepo },
        { provide: getRepositoryToken(FinanceLedgerEntity), useValue: mockRepo },
        { provide: getRepositoryToken(AuditLogEntity), useValue: mockRepo },
      ],
    }).compile();

    service = module.get<SeedService>(SeedService);
  });

  afterAll(async () => {
    await module.close();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should execute seedAll idempotently when tables are empty', async () => {
    await expect(service.seedAll()).resolves.not.toThrow();
    expect(mockRepo.save).toHaveBeenCalled();
  });

  it('should skip seeding when tables already contain data', async () => {
    const populatedRepo = {
      count: jest.fn().mockResolvedValue(10),
      save: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SeedService,
        { provide: getRepositoryToken(UserEntity), useValue: populatedRepo },
        { provide: getRepositoryToken(AdminUserEntity), useValue: populatedRepo },
        { provide: getRepositoryToken(CpoEntity), useValue: populatedRepo },
        { provide: getRepositoryToken(ChargingStationEntity), useValue: populatedRepo },
        { provide: getRepositoryToken(ConnectorEntity), useValue: populatedRepo },
        { provide: getRepositoryToken(ChargingSessionEntity), useValue: populatedRepo },
        { provide: getRepositoryToken(FinanceLedgerEntity), useValue: populatedRepo },
        { provide: getRepositoryToken(AuditLogEntity), useValue: populatedRepo },
      ],
    }).compile();

    const populatedService = module.get<SeedService>(SeedService);
    await populatedService.seedAll();
    expect(populatedRepo.save).not.toHaveBeenCalled();
  });
});
