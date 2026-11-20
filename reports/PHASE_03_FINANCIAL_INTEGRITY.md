# ChargeMesh — Phase 03 Batch 4: Financial Data Integrity & Atomic Transactions Remediation
**Document Reference:** `CM-REM-P3-B04`  
**Severity:** CRITICAL / HIGH  
**Finding References:** `REM-A03`, `AUDIT-005`  
**Date:** 2026-11-20  
**Status:** RESOLVED & VERIFIED  

---

## 1. Problem Statement & Verified Defects

1. **`REM-A03` (Critical Discrepancy):** In `apps/backend/src/modules/admin/admin-finance.service.ts`, `adjustWalletBalance()` inserted a ledger entry into `finance_ledger` via TypeORM repository `this.financeRepo.save()`, but failed to update `users.walletBalancePaise` in PostgreSQL. This created an irreversible financial mismatch between driver displayed wallet balance and the audit ledger.
2. **`AUDIT-005` (Floating Point Imprecision):** In `apps/backend/src/database/entities/finance-ledger.entity.ts`, currency columns (`amountRupees`, `balanceBeforeRupees`, `balanceAfterRupees`) were defined as `float` (`double precision`), susceptible to IEEE 754 precision drift over repeated transactions.
3. **Absence of Atomic Locks:** Wallet updates and ledger insertions operated outside database transactions with no row-level locking (`SELECT ... FOR UPDATE`), introducing race condition vulnerabilities during concurrent debits/credits.

---

## 2. Technical Remediation Implementation

### 2.1 Currency Precision Migration (`AUDIT-005`)
- Updated `FinanceLedgerEntity` in `apps/backend/src/database/entities/finance-ledger.entity.ts`:
  - Migrated `amountRupees`, `balanceBeforeRupees`, and `balanceAfterRupees` to `@Column('numeric', { precision: 12, scale: 2 })` with bidirectional value transformers.
- Created TypeORM migration `apps/backend/src/database/migrations/1710000000001-MigrateLedgerToNumeric.ts`:
  - `up()` executes `ALTER TABLE "finance_ledger" ALTER COLUMN ... TYPE NUMERIC(12, 2) USING ...::numeric(12, 2)`.
  - Executed migration successfully on live PostgreSQL database (`npm run migration:run`).
  - Confirmed via `psql -c "\d finance_ledger"` that all three columns are now `numeric(12,2)`.

### 2.2 Atomic Transaction & Row Locking (`REM-A03`)
- Updated `AdminFinanceService` in `apps/backend/src/modules/admin/admin-finance.service.ts`:
  - Injected `DataSource` and `Repository<UserEntity>`.
  - Re-engineered `adjustWalletBalance()` to execute within `this.dataSource.transaction(async (manager) => { ... })`.
  - Applied pessimistic write locking:
    ```typescript
    const user = await manager
      .getRepository(UserEntity)
      .createQueryBuilder('u')
      .setLock('pessimistic_write')
      .where('u.id = :id', { id: userId })
      .getOne();
    ```
  - Atomically executed both operations in a single commit:
    1. `manager.getRepository(UserEntity).update(user.id, { walletBalancePaise: newBalancePaise, updatedAt: new Date() })`
    2. `manager.getRepository(FinanceLedgerEntity).save(txRecord)`
  - Recorded immutable audit log entry in `auditService.record()`.

---

## 3. Test Verification & Results

Command:
```bash
npm test --workspace=apps/backend -- src/modules/admin/admin-finance.service.spec.ts
```

Output:
```
PASS src/modules/admin/admin-finance.service.spec.ts (38.831 s)
  AdminFinanceService (Financial Integrity REM-A03 & AUDIT-005)
    √ should be defined (42 ms)
    √ should retrieve transactions with pagination (9 ms)
    √ should reject adjustment with non-positive amount (108 ms)
    √ REM-A03: should atomically credit wallet and insert ledger record (40 ms)
    √ REM-A03: should atomically debit wallet without negative balance overflow (24 ms)
    √ should reject adjustment for non-existent driver (16 ms)

Test Suites: 1 passed, 1 total
Tests:       6 passed, 6 total
Snapshots:   0 total
Time:        41.427 s
```
