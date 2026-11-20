import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';
import { ThrottlerStorageModule } from '../../common/throttler/throttler-storage.module';

@Module({
  imports: [ThrottlerStorageModule],
  controllers: [HealthController],
})
export class HealthModule {}
