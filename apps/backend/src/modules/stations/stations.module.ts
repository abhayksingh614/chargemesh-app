import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StationsService } from './stations.service';
import { StationsController } from './stations.controller';
import { OcppModule } from '../ocpp/ocpp.module';
import { ChargingStationEntity, ConnectorEntity } from '../../database/entities';

@Module({
  imports: [
    TypeOrmModule.forFeature([ChargingStationEntity, ConnectorEntity]),
    OcppModule,
  ],
  controllers: [StationsController],
  providers: [StationsService],
  exports: [StationsService],
})
export class StationsModule {}
