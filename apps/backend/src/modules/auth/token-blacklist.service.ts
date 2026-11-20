import {
  Injectable,
  Logger,
  OnModuleDestroy,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class TokenBlacklistService implements OnModuleDestroy {
  private readonly logger = new Logger(TokenBlacklistService.name);
  private redis: Redis | null = null;
  private isRedisConnected = false;
  private readonly memoryBlacklist = new Map<string, number>();
  private cleanupTimer: NodeJS.Timeout | null = null;

  constructor(private readonly configService?: ConfigService) {
    this.initRedis();
    this.startCleanup();
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
        this.logger.log('Redis connected for Token Blacklist storage');
      });

      this.redis.on('error', () => {
        this.isRedisConnected = false;
      });

      this.redis.connect().catch(() => {
        this.isRedisConnected = false;
      });
    } catch {
      this.isRedisConnected = false;
    }
  }

  private startCleanup() {
    this.cleanupTimer = setInterval(() => {
      const now = Date.now();
      for (const [token, exp] of this.memoryBlacklist.entries()) {
        if (exp <= now) {
          this.memoryBlacklist.delete(token);
        }
      }
    }, 60000);
    if (this.cleanupTimer.unref) this.cleanupTimer.unref();
  }

  async blacklistToken(token: string, ttlSeconds = 86400): Promise<void> {
    if (this.isRedisConnected && this.redis) {
      try {
        await this.redis.set(`chargemesh:token:blacklist:${token}`, 'revoked', 'EX', ttlSeconds);
        return;
      } catch (e: any) {
        this.logger.warn(`Redis blacklistToken error: ${e.message}`);
        if (process.env.NODE_ENV === 'production') {
          throw new ServiceUnavailableException('Failed to record token revocation in authoritative storage');
        }
      }
    } else if (process.env.NODE_ENV === 'production') {
      throw new ServiceUnavailableException('Cannot revoke token: Authoritative storage is unreachable');
    }

    this.memoryBlacklist.set(token, Date.now() + ttlSeconds * 1000);
  }

  async isTokenBlacklisted(token: string): Promise<boolean> {
    if (this.isRedisConnected && this.redis) {
      try {
        const val = await this.redis.get(`chargemesh:token:blacklist:${token}`);
        if (val) return true;
        return false;
      } catch (err: any) {
        if (process.env.NODE_ENV === 'production') {
          this.logger.error(`Token blacklist Redis check failed in production: ${err.message}. Failing closed.`);
          throw new ServiceUnavailableException('Authentication verification authority is temporarily unavailable');
        }
      }
    } else if (process.env.NODE_ENV === 'production') {
      this.logger.error('Token blacklist Redis disconnected in production. Failing closed.');
      throw new ServiceUnavailableException('Authentication verification authority is temporarily unavailable');
    }

    const exp = this.memoryBlacklist.get(token);
    if (exp) {
      if (exp > Date.now()) {
        return true;
      }
      this.memoryBlacklist.delete(token);
    }
    return false;
  }

  onModuleDestroy() {
    if (this.cleanupTimer) clearInterval(this.cleanupTimer);
    if (this.redis) {
      try {
        this.redis.disconnect();
      } catch {}
    }
  }
}
