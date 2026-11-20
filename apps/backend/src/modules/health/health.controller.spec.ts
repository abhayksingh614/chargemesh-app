import { Test, TestingModule } from '@nestjs/testing';
import { HealthController } from './health.controller';
import { DataSource } from 'typeorm';
import { RedisThrottlerStorageService } from '../../common/throttler/redis-throttler-storage.service';
import { HttpException } from '@nestjs/common';

describe('HealthController (DevOps / SRE Health Probes)', () => {
  let controller: HealthController;
  let module: TestingModule;
  let mockDataSource: Partial<DataSource>;
  let mockRedisStorage: Partial<RedisThrottlerStorageService>;

  beforeEach(async () => {
    mockDataSource = {
      isInitialized: true,
      query: jest.fn().mockResolvedValue([{ '?column?': 1 }]),
    };

    mockRedisStorage = {
      isConnected: true,
      pingRedis: jest.fn().mockResolvedValue(true),
    };

    module = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        { provide: DataSource, useValue: mockDataSource },
        { provide: RedisThrottlerStorageService, useValue: mockRedisStorage },
      ],
    }).compile();

    controller = module.get<HealthController>(HealthController);
  });

  afterAll(async () => {
    await module.close();
  });

  it('should return 200 OK for /health overview', () => {
    const health = controller.getHealth();
    expect(health.status).toBe('ok');
    expect(health.service).toBe('chargemesh-backend');
    expect(health.uptimeSeconds).toBeGreaterThanOrEqual(0);
  });

  it('should return 200 OK for /health/live liveness probe', () => {
    const live = controller.getLiveness();
    expect(live.status).toBe('ok');
    expect(live.uptimeSeconds).toBeGreaterThanOrEqual(0);
  });

  it('should return 200 OK for /health/ready readiness probe when DB and Redis are connected', async () => {
    const ready = await controller.getReadiness();
    expect(ready.status).toBe('ok');
    expect(ready.checks.database).toBe('connected');
    expect(ready.checks.redis).toBe('connected');
  });

  it('should throw 503 SERVICE_UNAVAILABLE when database is disconnected', async () => {
    (mockDataSource.query as jest.Mock).mockRejectedValue(new Error('Connection refused'));

    await expect(controller.getReadiness()).rejects.toThrow(HttpException);
  });
});
