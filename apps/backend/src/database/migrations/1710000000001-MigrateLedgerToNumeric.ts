import { MigrationInterface, QueryRunner } from 'typeorm';

export class MigrateLedgerToNumeric1710000000001 implements MigrationInterface {
  name = 'MigrateLedgerToNumeric1710000000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "finance_ledger"
        ALTER COLUMN "amountRupees" TYPE NUMERIC(12, 2) USING "amountRupees"::numeric(12, 2),
        ALTER COLUMN "balanceBeforeRupees" TYPE NUMERIC(12, 2) USING "balanceBeforeRupees"::numeric(12, 2),
        ALTER COLUMN "balanceAfterRupees" TYPE NUMERIC(12, 2) USING "balanceAfterRupees"::numeric(12, 2);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "finance_ledger"
        ALTER COLUMN "amountRupees" TYPE DOUBLE PRECISION USING "amountRupees"::double precision,
        ALTER COLUMN "balanceBeforeRupees" TYPE DOUBLE PRECISION USING "balanceBeforeRupees"::double precision,
        ALTER COLUMN "balanceAfterRupees" TYPE DOUBLE PRECISION USING "balanceAfterRupees"::double precision;
    `);
  }
}
