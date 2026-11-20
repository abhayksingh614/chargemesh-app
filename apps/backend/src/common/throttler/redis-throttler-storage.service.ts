import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ThrottlerStorage } from '@nestjs/throttler';
import { ThrottlerStorageRecord } from '@nestjs/throttler/dist/throttler-storage-record.interface';
import Redis from 'ioredis';

interface MemoryRecord {
  totalHits: number;
  expiresAt: number;
}

@Injectable()
export class RedisThrottlerStorageService implements ThrottlerStorage, OnModuleDestroy {
  private readonly logger = new Logger(RedisThrottlerStorageService.name);
  private redis: Redis | null = null;
  private isRedisConnected = false;
  private readonly memoryStore = new Map<string, MemoryRecord>();
  private memoryCleanupTimer: NodeJS.Timeout | null = null;

  constructor(private readonly configService: ConfigService) {
    this.initRedis();
    this.startMemoryCleanup();
  }

  private initRedis() {
    const redisHost = this.configService.get<string>('app.redis.host') || process.env.REDIS_HOST || 'localhost';
    if (redisHost === 'disabled' || redisHost === 'disabled-for-memory-test') {
      return;
    }
    const redisPort = this.configService.get<number>('app.redis.port') || parseInt(process.env.REDIS_PORT || '6379', 10);
    const redisPassword = this.configService.get<string>('app.redis.password') || process.env.REDIS_PASSWORD || undefined;

    try {
      this.redis = new Redis({
        host: redisHost,
        port: redisPort,
        password: redisPassword,
        lazyConnect: true,
        connectTimeout: 2000,
        maxRetriesPerRequest: 1,
        enableOfflineQueue: false,
        retryStrategy: (times) => {
          if (process.env.NODE_ENV === 'test' || times > 1) {
            return null;
          }
          return Math.min(times * 200, 1000);
        },
      });

      this.redis.on('connect', () => {
        this.isRedisConnected = true;
        this.logger.log(`⚡ Connected to Redis for distributed rate limiting (${redisHost}:${redisPort})`);
      });

      this.redis.on('error', (err) => {
        if (this.isRedisConnected) {
          this.logger.warn(`Redis throttler connection degraded: ${err.message}. Falling back to in-memory store.`);
        }
        this.isRedisConnected = false;
      });

      // Attempt non-blocking connection
      this.redis.connect().catch((_err) => {
        this.logger.warn(
          `Redis not reachable at ${redisHost}:${redisPort}. RATE-001 active with local in-memory fallback.`,
        );
      });
    } catch (err: any) {
      this.logger.warn(`Failed to initialize Redis client: ${err.message}. Running in-memory throttler.`);
    }
  }

  async increment(key: string, ttl: number): Promise<ThrottlerStorageRecord> {
    if (this.isRedisConnected && this.redis) {
      try {
        const fullKey = `chargemesh:throttle:${key}`;
        // Atomic pipeline: INCR then PTTL
        const results = await this.redis
          .pipeline()
          .incr(fullKey)
          .pttl(fullKey)
          .exec();

        if (results && results[0] && results[1]) {
          const totalHits = results[0][1] as number;
          let timeToExpire = results[1][1] as number;

          // If key was just created (pttl is -1), set TTL
          if (timeToExpire < 0) {
            await this.redis.pexpire(fullKey, ttl);
            timeToExpire = ttl;
          }

          return {
            totalHits,
            timeToExpire: Math.max(0, Math.ceil(timeToExpire / 1000)),
          };
        }
      } catch (err: any) {
        this.logger.warn(`Redis increment failed (${err.message}). Using memory fallback.`);
      }
    }

    // In-memory fallback
    const now = Date.now();
    const existing = this.memoryStore.get(key);

    if (!existing || existing.expiresAt <= now) {
      const expiresAt = now + ttl;
      this.memoryStore.set(key, { totalHits: 1, expiresAt });
      return {
        totalHits: 1,
        timeToExpire: Math.ceil(ttl / 1000),
      };
    }

    existing.totalHits += 1;
    return {
      totalHits: existing.totalHits,
      timeToExpire: Math.max(0, Math.ceil((existing.expiresAt - now) / 1000)),
    };
  }

  private startMemoryCleanup() {
    this.memoryCleanupTimer = setInterval(() => {
      const now = Date.now();
      for (const [key, record] of this.memoryStore.entries()) {
        if (record.expiresAt <= now) {
          this.memoryStore.delete(key);
        }
      }
    }, 60000);
    // Unref timer so it doesn't block process exit
    if (this.memoryCleanupTimer.unref) {
      this.memoryCleanupTimer.unref();
    }
  }

  get isConnected(): boolean {
    return this.isRedisConnected;
  }

  async pingRedis(): Promise<boolean> {
    if (!this.redis) return false;
    try {
      const pong = await this.redis.ping();
      return pong === 'PONG';
    } catch {
      return false;
    }
  }

  async onModuleDestroy() {
    if (this.memoryCleanupTimer) {
      clearInterval(this.memoryCleanupTimer);
      this.memoryCleanupTimer = null;
    }
    if (this.redis) {
      try {
        this.redis.disconnect(false);
      } catch {}
      this.redis = null;
      this.isRedisConnected = false;
    }
  }
}
