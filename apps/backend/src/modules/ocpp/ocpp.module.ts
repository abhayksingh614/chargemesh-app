import { Module } from '@nestjs/common';
import { OcppService } from './ocpp.service';
import { OcppGateway } from './ocpp.gateway';
import { TelemetryModule } from '../telemetry/telemetry.module';

@Module({
  imports: [TelemetryModule],
  providers: [OcppService, OcppGateway],
  exports: [OcppService],
})
export class OcppModule {}
