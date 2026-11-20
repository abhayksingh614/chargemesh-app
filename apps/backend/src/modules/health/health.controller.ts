import { Controller, Get, HttpException, HttpStatus } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { RedisThrottlerStorageService } from '../../common/throttler/redis-throttler-storage.service';

@Controller()
export class HealthController {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
    private readonly redisStorage: RedisThrottlerStorageService,
  ) {}

  @Get(['health', 'api/v1/health'])
  getHealth() {
    return {
      status: 'ok',
      service: 'chargemesh-backend',
      version: '1.0.0',
      uptimeSeconds: Math.floor(process.uptime()),
      timestamp: new Date().toISOString(),
    };
  }

  @Get(['health/live', 'api/v1/health/live'])
  getLiveness() {
    return {
      status: 'ok',
      uptimeSeconds: Math.floor(process.uptime()),
      timestamp: new Date().toISOString(),
    };
  }

  @Get(['health/ready', 'api/v1/health/ready'])
  async getReadiness() {
    const checks: {
      database: 'connected' | 'disconnected';
      redis: 'connected' | 'in-memory-fallback';
    } = {
      database: 'disconnected',
      redis: 'in-memory-fallback',
    };

    // 1. Verify PostgreSQL Database connectivity
    try {
      if (this.dataSource.isInitialized) {
        await this.dataSource.query('SELECT 1');
        checks.database = 'connected';
      }
    } catch {
      checks.database = 'disconnected';
    }

    // 2. Verify Redis connectivity
    const redisPong = await this.redisStorage.pingRedis();
    if (redisPong || this.redisStorage.isConnected) {
      checks.redis = 'connected';
    } else {
      checks.redis = 'in-memory-fallback';
    }

    // Fail closed if database is unavailable
    if (checks.database !== 'connected') {
      throw new HttpException(
        {
          status: 'degraded',
          message: 'PostgreSQL database connection is unavailable',
          checks,
          timestamp: new Date().toISOString(),
        },
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }

    return {
      status: 'ok',
      service: 'chargemesh-backend',
      checks,
      timestamp: new Date().toISOString(),
    };
  }
}
