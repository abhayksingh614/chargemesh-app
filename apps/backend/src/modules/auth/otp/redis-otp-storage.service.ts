import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { IOtpStorage, StoredOtpRecord } from './otp.interface';

@Injectable()
export class RedisOtpStorageService implements IOtpStorage, OnModuleDestroy {
  private readonly logger = new Logger(RedisOtpStorageService.name);
  private redis: Redis | null = null;
  private isRedisConnected = false;
  private readonly memoryStore = new Map<string, StoredOtpRecord>();
  private memoryCleanupTimer: NodeJS.Timeout | null = null;

  constructor(private readonly configService?: ConfigService) {
    this.initRedis();
    this.startMemoryCleanup();
  }

  private initRedis() {
    const redisHost =
      this.configService?.get<string>('app.redis.host') ||
      process.env.REDIS_HOST ||
      'localhost';
    if (redisHost === 'disabled' || redisHost === 'disabled-for-memory-test') {
      return;
    }
    const redisPort =
      this.configService?.get<number>('app.redis.port') ||
      parseInt(process.env.REDIS_PORT || '6379', 10);
    const redisPassword =
      this.configService?.get<string>('app.redis.password') ||
      process.env.REDIS_PASSWORD ||
      undefined;

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
        this.logger.log(
          `⚡ Connected to Redis for distributed OTP storage (${redisHost}:${redisPort})`,
        );
      });

      this.redis.on('error', (err) => {
        if (this.isRedisConnected) {
          this.logger.warn(
            `Redis OTP connection degraded: ${err.message}. Falling back to in-memory store.`,
          );
        }
        this.isRedisConnected = false;
      });

      this.redis.connect().catch((_err) => {
        this.logger.warn(
          `Redis not reachable at ${redisHost}:${redisPort}. Running OTP store in-memory fallback.`,
        );
      });
    } catch (err: any) {
      this.logger.warn(
        `Failed to initialize Redis OTP client: ${err.message}. Using in-memory fallback.`,
      );
    }
  }

  private buildKey(phone: string, purpose = 'auth'): string {
    const normalized = phone.trim().replace(/\D/g, '');
    return `chargemesh:otp:${purpose}:${normalized}`;
  }

  async get(phone: string, purpose = 'auth'): Promise<StoredOtpRecord | null> {
    const key = this.buildKey(phone, purpose);
    if (this.isRedisConnected && this.redis) {
      try {
        const raw = await this.redis.get(key);
        if (raw) {
          return JSON.parse(raw) as StoredOtpRecord;
        }
        return null;
      } catch (err: any) {
        this.logger.warn(`Redis OTP get failed: ${err.message}. Using memory fallback.`);
      }
    }
    return this.memoryStore.get(key) || null;
  }

  async set(phone: string, record: StoredOtpRecord, ttlMs: number): Promise<void> {
    const key = this.buildKey(phone, record.purpose || 'auth');
    if (this.isRedisConnected && this.redis) {
      try {
        await this.redis.set(key, JSON.stringify(record), 'PX', ttlMs);
        await this.redis.set(`${key}:attempts`, record.attempts.toString(), 'PX', ttlMs);
        return;
      } catch (err: any) {
        this.logger.warn(`Redis OTP set failed: ${err.message}. Using memory fallback.`);
      }
    }
    this.memoryStore.set(key, record);
  }

  async incrementAttempts(phone: string, purpose = 'auth'): Promise<number> {
    const key = this.buildKey(phone, purpose);
    const attemptKey = `${key}:attempts`;
    if (this.isRedisConnected && this.redis) {
      try {
        // SEC-014: Native atomic Redis INCR to prevent concurrent race conditions
        const attempts = await this.redis.incr(attemptKey);
        const raw = await this.redis.get(key);
        if (raw) {
          const record = JSON.parse(raw) as StoredOtpRecord;
          record.attempts = attempts;
          const ttlMs = Math.max(0, record.expiresAt - Date.now());
          if (ttlMs > 0) {
            await this.redis.set(key, JSON.stringify(record), 'PX', ttlMs);
          } else {
            await this.redis.del(key, attemptKey);
          }
        }
        return attempts;
      } catch (err: any) {
        this.logger.warn(`Redis atomic OTP increment failed: ${err.message}. Using memory fallback.`);
      }
    }
    const mem = this.memoryStore.get(key);
    if (mem) {
      mem.attempts += 1;
      return mem.attempts;
    }
    return 1;
  }

  async delete(phone: string, purpose = 'auth'): Promise<void> {
    const key = this.buildKey(phone, purpose);
    if (this.isRedisConnected && this.redis) {
      try {
        await this.redis.del(key, `${key}:attempts`);
      } catch (err: any) {
        this.logger.warn(`Redis OTP delete failed: ${err.message}`);
      }
    }
    this.memoryStore.delete(key);
  }

  get isConnected(): boolean {
    return this.isRedisConnected;
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
    if (this.memoryCleanupTimer.unref) {
      this.memoryCleanupTimer.unref();
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
