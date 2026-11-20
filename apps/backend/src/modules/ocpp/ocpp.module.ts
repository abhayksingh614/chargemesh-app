import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { OcppService } from './ocpp.service';
import { OcppGateway } from './ocpp.gateway';
import { TelemetryModule } from '../telemetry/telemetry.module';
import {
  UserEntity,
  ChargingStationEntity,
  ChargingSessionEntity,
} from '../../database/entities';

@Module({
  imports: [
    TelemetryModule,
    ConfigModule,
    TypeOrmModule.forFeature([
      UserEntity,
      ChargingStationEntity,
      ChargingSessionEntity,
    ]),
  ],
  providers: [OcppService, OcppGateway],
  exports: [OcppService],
})
export class OcppModule {}
