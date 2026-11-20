import { ConfigService } from '@nestjs/config';
import { RedisThrottlerStorageService } from './redis-throttler-storage.service';

describe('RedisThrottlerStorageService (RATE-001 Distributed Rate Limiting)', () => {
  let service: RedisThrottlerStorageService;
  let configService: ConfigService;

  beforeEach(() => {
    configService = {
      get: jest.fn().mockImplementation((key: string) => {
        if (key === 'app.redis.host') return 'disabled-for-memory-test';
        if (key === 'app.redis.port') return 6379;
        return undefined;
      }),
    } as any;

    service = new RedisThrottlerStorageService(configService);
  });

  afterEach(async () => {
    await service.onModuleDestroy();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should increment hits for a new key in memory fallback', async () => {
    const record = await service.increment('test-client-ip', 60000);
    expect(record.totalHits).toBe(1);
    expect(record.timeToExpire).toBeGreaterThan(0);
  });

  it('should increment hits sequentially for subsequent requests in memory fallback', async () => {
    await service.increment('seq-client-ip', 60000);
    const second = await service.increment('seq-client-ip', 60000);
    const third = await service.increment('seq-client-ip', 60000);

    expect(second.totalHits).toBe(2);
    expect(third.totalHits).toBe(3);
  });

  it('should reset hits after TTL expiration in memory fallback', async () => {
    const key = 'expiring-key';
    await service.increment(key, 50); // 50ms TTL

    await new Promise((resolve) => setTimeout(resolve, 80));

    const freshRecord = await service.increment(key, 60000);
    expect(freshRecord.totalHits).toBe(1);
  });
});
