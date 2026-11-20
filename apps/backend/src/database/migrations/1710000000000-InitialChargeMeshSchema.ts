import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialChargeMeshSchema1710000000000 implements MigrationInterface {
  name = 'InitialChargeMeshSchema1710000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Enable Required Extensions
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`);
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "postgis";`);

    // 2. Users (Drivers)
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "users" (
        "id" VARCHAR(64) NOT NULL,
        "phoneNumber" VARCHAR(20) NOT NULL UNIQUE,
        "name" VARCHAR(100) NOT NULL,
        "email" VARCHAR(150),
        "vehicle" JSONB,
        "walletBalancePaise" BIGINT NOT NULL DEFAULT 0,
        "totalKwhCharged" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
        "co2SavedKg" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
        "totalSessions" INTEGER NOT NULL DEFAULT 0,
        "status" VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_users_id" PRIMARY KEY ("id")
      );
    `);

    // 3. Admin Users
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "admin_users" (
        "id" VARCHAR(64) NOT NULL,
        "email" VARCHAR(150) NOT NULL UNIQUE,
        "name" VARCHAR(100) NOT NULL,
        "passwordHash" VARCHAR(255) NOT NULL,
        "role" VARCHAR(30) NOT NULL DEFAULT 'OPERATOR',
        "status" VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
        "department" VARCHAR(50),
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_admin_users_id" PRIMARY KEY ("id")
      );
    `);

    // 4. CPOs (Charge Point Operators)
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "cpos" (
        "id" VARCHAR(64) NOT NULL,
        "partyId" VARCHAR(10) NOT NULL,
        "countryCode" VARCHAR(5) NOT NULL,
        "name" VARCHAR(150) NOT NULL,
        "protocol" VARCHAR(20) NOT NULL,
        "integrationStatus" VARCHAR(20) NOT NULL DEFAULT 'PENDING',
        "supportPhone" VARCHAR(30),
        "supportEmail" VARCHAR(100),
        "website" VARCHAR(255),
        "revenueSharePercent" DOUBLE PRECISION NOT NULL DEFAULT 85.00,
        "uptimePercent30d" DOUBLE PRECISION NOT NULL DEFAULT 99.00,
        "syncFrequencySeconds" INTEGER NOT NULL DEFAULT 300,
        "totalStationCount" INTEGER NOT NULL DEFAULT 0,
        "totalOnlineChargers" INTEGER NOT NULL DEFAULT 0,
        "totalSessionsLifetime" INTEGER NOT NULL DEFAULT 0,
        "lastSyncAt" TIMESTAMP,
        "lastSyncResult" JSONB,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_cpos_id" PRIMARY KEY ("id")
      );
    `);

    // 5. Charging Stations
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "charging_stations" (
        "id" VARCHAR(64) NOT NULL,
        "chargePointId" VARCHAR(64) NOT NULL UNIQUE,
        "name" VARCHAR(128) NOT NULL,
        "operator" VARCHAR(128) NOT NULL,
        "cpoId" VARCHAR(64),
        "address" TEXT NOT NULL,
        "city" VARCHAR(64) NOT NULL,
        "latitude" DOUBLE PRECISION NOT NULL,
        "longitude" DOUBLE PRECISION NOT NULL,
        "rating" DOUBLE PRECISION NOT NULL DEFAULT 4.5,
        "totalReviews" INTEGER NOT NULL DEFAULT 0,
        "amenities" TEXT NOT NULL DEFAULT '',
        "status" VARCHAR(32) NOT NULL DEFAULT 'ACTIVE',
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_charging_stations_id" PRIMARY KEY ("id")
      );
    `);

    // 6. Connectors
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "connectors" (
        "id" VARCHAR(64) NOT NULL,
        "stationId" VARCHAR(64) NOT NULL,
        "connectorNumber" INTEGER NOT NULL,
        "type" VARCHAR(32) NOT NULL,
        "powerKw" DOUBLE PRECISION NOT NULL,
        "status" VARCHAR(32) NOT NULL DEFAULT 'Available',
        "pricePerKwh" DOUBLE PRECISION NOT NULL DEFAULT 16.50,
        "lastUpdated" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_connectors_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_connectors_station" FOREIGN KEY ("stationId") REFERENCES "charging_stations"("id") ON DELETE CASCADE
      );
    `);

    // 7. Charging Sessions
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "charging_sessions" (
        "id" VARCHAR(64) NOT NULL,
        "userId" VARCHAR(64) NOT NULL,
        "stationId" VARCHAR(64) NOT NULL,
        "stationName" VARCHAR(128) NOT NULL,
        "connectorId" VARCHAR(64) NOT NULL,
        "connectorType" VARCHAR(32) NOT NULL,
        "chargePointId" VARCHAR(64) NOT NULL,
        "transactionId" INTEGER,
        "status" VARCHAR(32) NOT NULL DEFAULT 'ACTIVE',
        "target" JSONB,
        "startTime" TIMESTAMP NOT NULL DEFAULT now(),
        "endTime" TIMESTAMP,
        "energyKwh" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
        "totalCostInr" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
        "pricePerKwh" DOUBLE PRECISION NOT NULL DEFAULT 16.50,
        "startSoC" DOUBLE PRECISION,
        "currentSoC" DOUBLE PRECISION,
        "powerKw" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_charging_sessions_id" PRIMARY KEY ("id")
      );
    `);

    // 8. Meter Values (Power Telemetry Time-Series)
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "meter_values" (
        "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
        "sessionId" VARCHAR(64) NOT NULL,
        "chargePointId" VARCHAR(64) NOT NULL,
        "connectorNumber" INTEGER NOT NULL,
        "timestamp" TIMESTAMP NOT NULL DEFAULT now(),
        "powerKw" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
        "energyKwh" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
        "socPercent" DOUBLE PRECISION,
        "voltage" DOUBLE PRECISION,
        "current" DOUBLE PRECISION,
        CONSTRAINT "PK_meter_values_id" PRIMARY KEY ("id")
      );
    `);

    // 9. Finance Ledger
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "finance_ledger" (
        "id" VARCHAR(64) NOT NULL,
        "referenceId" VARCHAR(64) NOT NULL,
        "userId" VARCHAR(64) NOT NULL,
        "userName" VARCHAR(100) NOT NULL,
        "type" VARCHAR(32) NOT NULL,
        "title" VARCHAR(150) NOT NULL,
        "amountRupees" DOUBLE PRECISION NOT NULL,
        "isCredit" BOOLEAN NOT NULL DEFAULT false,
        "status" VARCHAR(20) NOT NULL DEFAULT 'SUCCESS',
        "dateStr" VARCHAR(30) NOT NULL,
        "timeStr" VARCHAR(20) NOT NULL,
        "rawTimestamp" BIGINT NOT NULL,
        "paymentMethodName" VARCHAR(50) NOT NULL DEFAULT 'UPI / Razorpay',
        "balanceBeforeRupees" DOUBLE PRECISION NOT NULL,
        "balanceAfterRupees" DOUBLE PRECISION NOT NULL,
        "remarks" TEXT,
        "reconciled" BOOLEAN NOT NULL DEFAULT false,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_finance_ledger_id" PRIMARY KEY ("id")
      );
    `);

    // 10. Audit Logs
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "audit_logs" (
        "id" VARCHAR(64) NOT NULL,
        "actorId" VARCHAR(64) NOT NULL,
        "actorName" VARCHAR(100) NOT NULL,
        "actorRole" VARCHAR(30) NOT NULL,
        "action" VARCHAR(64) NOT NULL,
        "targetEntity" VARCHAR(64) NOT NULL,
        "targetId" VARCHAR(64),
        "previousValue" JSONB,
        "newValue" JSONB,
        "reason" TEXT,
        "ipAddress" VARCHAR(45),
        "timestamp" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_audit_logs_id" PRIMARY KEY ("id")
      );
    `);

    // 11. Performance Indexes
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_stations_city" ON "charging_stations" ("city");`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_stations_status" ON "charging_stations" ("status");`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_connectors_stationId" ON "connectors" ("stationId");`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_connectors_status" ON "connectors" ("status");`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_sessions_stationId" ON "charging_sessions" ("stationId");`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_sessions_userId" ON "charging_sessions" ("userId");`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_sessions_status" ON "charging_sessions" ("status");`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_meter_values_sessionId" ON "meter_values" ("sessionId");`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_meter_values_timestamp" ON "meter_values" ("timestamp" DESC);`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_finance_ledger_userId" ON "finance_ledger" ("userId");`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_audit_logs_timestamp" ON "audit_logs" ("timestamp" DESC);`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_audit_logs_actorId" ON "audit_logs" ("actorId");`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "audit_logs" CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS "finance_ledger" CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS "meter_values" CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS "charging_sessions" CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS "connectors" CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS "charging_stations" CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS "cpos" CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS "admin_users" CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS "users" CASCADE;`);
  }
}
