import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { RedisThrottlerStorageService } from './redis-throttler-storage.service';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [RedisThrottlerStorageService],
  exports: [RedisThrottlerStorageService],
})
export class ThrottlerStorageModule {}
