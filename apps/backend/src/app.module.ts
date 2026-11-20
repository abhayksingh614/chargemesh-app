import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import configuration from './config/configuration';
import { validateEnvironment } from './config/env.validation';
import { RedisThrottlerStorageService } from './common/throttler/redis-throttler-storage.service';
import { ThrottlerStorageModule } from './common/throttler/throttler-storage.module';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './modules/auth/auth.module';
import { StationsModule } from './modules/stations/stations.module';
import { SessionsModule } from './modules/sessions/sessions.module';
import { TelemetryModule } from './modules/telemetry/telemetry.module';
import { OcppModule } from './modules/ocpp/ocpp.module';
import { AdminModule } from './modules/admin/admin.module';
import { HealthModule } from './modules/health/health.module';
import { WalletModule } from './modules/wallet/wallet.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validate: validateEnvironment,
    }),
    ThrottlerStorageModule,
    DatabaseModule,
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule, ThrottlerStorageModule],
      inject: [ConfigService, RedisThrottlerStorageService],
      useFactory: (configService: ConfigService, storage: RedisThrottlerStorageService) => {
        const rateLimit = configService.get('app.rateLimit') || { ttl: 60000, limit: 100 };
        return {
          throttlers: [
            {
              name: 'default',
              ttl: rateLimit.ttl,
              limit: rateLimit.limit,
            },
          ],
          storage,
        };
      },
    }),
    AuthModule,
    StationsModule,
    SessionsModule,
    TelemetryModule,
    OcppModule,
    AdminModule,
    HealthModule,
    WalletModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
