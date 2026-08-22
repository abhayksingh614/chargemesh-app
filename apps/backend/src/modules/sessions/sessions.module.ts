import { Module } from '@nestjs/common';
import { SessionsService } from './sessions.service';
import { SessionsController } from './sessions.controller';
import { StationsModule } from '../stations/stations.module';
import { OcppModule } from '../ocpp/ocpp.module';
import { TelemetryModule } from '../telemetry/telemetry.module';

@Module({
  imports: [StationsModule, OcppModule, TelemetryModule],
  controllers: [SessionsController],
  providers: [SessionsService],
  exports: [SessionsService],
})
export class SessionsModule {}
