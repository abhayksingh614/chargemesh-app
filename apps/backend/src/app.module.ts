import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import configuration from './config/configuration';
import { AuthModule } from './modules/auth/auth.module';
import { StationsModule } from './modules/stations/stations.module';
import { SessionsModule } from './modules/sessions/sessions.module';
import { TelemetryModule } from './modules/telemetry/telemetry.module';
import { OcppModule } from './modules/ocpp/ocpp.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    AuthModule,
    StationsModule,
    SessionsModule,
    TelemetryModule,
    OcppModule,
  ],
})
export class AppModule {}
