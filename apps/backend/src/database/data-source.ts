import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import * as path from 'path';
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

dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5434', 10),
  username: process.env.DB_USERNAME || 'chargemesh',
  password: process.env.DB_PASSWORD || 'chargemesh_dev_password',
  database: process.env.DB_DATABASE || 'chargemesh_dev',
  synchronize: false,
  logging: process.env.NODE_ENV !== 'production',
  entities: [
    UserEntity,
    AdminUserEntity,
    CpoEntity,
    ChargingStationEntity,
    ConnectorEntity,
    ChargingSessionEntity,
    MeterValueEntity,
    FinanceLedgerEntity,
    AuditLogEntity,
  ],
  migrations: [path.join(__dirname, 'migrations/*{.ts,.js}')],
});
