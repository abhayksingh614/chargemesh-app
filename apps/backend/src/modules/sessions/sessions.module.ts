import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SessionsService } from './sessions.service';
import { SessionsController } from './sessions.controller';
import { StationsModule } from '../stations/stations.module';
import { OcppModule } from '../ocpp/ocpp.module';
import { TelemetryModule } from '../telemetry/telemetry.module';
import { WalletModule } from '../wallet/wallet.module';
import { ChargingSessionEntity, MeterValueEntity, UserEntity } from '../../database/entities';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ChargingSessionEntity,
      MeterValueEntity,
      UserEntity,
    ]),
    StationsModule,
    OcppModule,
    TelemetryModule,
    WalletModule,
  ],
  controllers: [SessionsController],
  providers: [SessionsService],
  exports: [SessionsService],
})
export class SessionsModule {}
