import { MigrationInterface, QueryRunner } from 'typeorm';

export class Phase05SchemaHardening1710000000002 implements MigrationInterface {
  name = 'Phase05SchemaHardening1710000000002';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Add wallet pre-authorization hold column to users table
    await queryRunner.query(`
      ALTER TABLE "users"
        ADD COLUMN IF NOT EXISTS "walletHeldPaise" BIGINT NOT NULL DEFAULT 0;
    `);

    // 2. Add charge point basic auth credentials column to charging_stations
    await queryRunner.query(`
      ALTER TABLE "charging_stations"
        ADD COLUMN IF NOT EXISTS "chargePointPassword" VARCHAR(128);
    `);

    // 3. Create PostGIS functional GiST index for accelerated ST_DWithin and distance queries
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_stations_spatial_geog"
        ON "charging_stations"
        USING GIST ((ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)::geography));
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP INDEX IF EXISTS "IDX_stations_spatial_geog";
    `);
    await queryRunner.query(`
      ALTER TABLE "charging_stations"
        DROP COLUMN IF EXISTS "chargePointPassword";
    `);
    await queryRunner.query(`
      ALTER TABLE "users"
        DROP COLUMN IF EXISTS "walletHeldPaise";
    `);
  }
}
