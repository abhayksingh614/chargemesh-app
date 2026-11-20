import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import {
  UserEntity,
  AdminUserEntity,
  CpoEntity,
  ChargingStationEntity,
  ConnectorEntity,
  ChargingSessionEntity,
  MeterValueEntity,
  FinanceLedgerEntity,
  AuditLogEntity,
} from './entities';
import { SeedService } from './seed.service';

export const ENTITIES = [
  UserEntity,
  AdminUserEntity,
  CpoEntity,
  ChargingStationEntity,
  ConnectorEntity,
  ChargingSessionEntity,
  MeterValueEntity,
  FinanceLedgerEntity,
  AuditLogEntity,
];

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const isProduction = configService.get<string>('app.nodeEnv') === 'production';
        return {
          type: 'postgres',
          host: configService.get<string>('app.database.host') || 'localhost',
          port: configService.get<number>('app.database.port') || 5434,
          username: configService.get<string>('app.database.user') || 'chargemesh',
          password: configService.get<string>('app.database.password') || 'chargemesh_dev_password',
          database: configService.get<string>('app.database.name') || 'chargemesh_dev',
          entities: ENTITIES,
          synchronize: !isProduction && configService.get<string>('DB_SYNCHRONIZE') === 'true',
          migrationsRun: isProduction || configService.get<string>('DB_MIGRATIONS_RUN') === 'true',
          autoLoadEntities: true,
          logging: false,
          ssl: configService.get<boolean>('app.database.ssl')
            ? { rejectUnauthorized: false }
            : false,
        };
      },
    }),
    TypeOrmModule.forFeature(ENTITIES),
  ],
  providers: [SeedService],
  exports: [TypeOrmModule, SeedService],
})
export class DatabaseModule {}
