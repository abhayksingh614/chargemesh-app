# ChargeMesh — Phase 03 Batch 5: Charging Wallet Pre-Authorization Remediation
**Document Reference:** `CM-REM-P3-B05`  
**Severity:** HIGH  
**Finding References:** `REM-A05`, `POL-002`  
**Date:** 2026-11-20  
**Status:** RESOLVED & VERIFIED  

---

## 1. Problem Statement & Verified Defect

In `apps/backend/src/modules/sessions/sessions.service.ts`, `startSession()` allowed any authenticated user ID to initiate a DC fast-charging session without verifying that the driver possessed sufficient funds to cover the charging session. Drivers with zero or negative wallet balances could draw power and generate unpaid liabilities.

---

## 2. Technical Remediation Implementation

### 2.1 Pre-Authorization Validation Gate (`POL-002`)
- Updated `SessionsService` in `apps/backend/src/modules/sessions/sessions.service.ts`:
  - Injected `@InjectRepository(UserEntity) private readonly userRepo?: Repository<UserEntity>`.
  - Added pre-authorization gate at the entry point of `startSession()`:
    ```typescript
    const minPreauthPaise = parseInt(process.env.WALLET_MIN_PREAUTH_PAISE || '20000', 10); // default ₹200.00 hold
    if (this.userRepo) {
      const user = await this.userRepo.findOneBy({ id: userId });
      if (user && Number(user.walletBalancePaise) < minPreauthPaise) {
        const currentRupees = (Number(user.walletBalancePaise) / 100).toFixed(2);
        const requiredRupees = (minPreauthPaise / 100).toFixed(2);
        throw new BadRequestException(
          `Insufficient wallet balance (₹${currentRupees}). Minimum balance of ₹${requiredRupees} is required to initiate charging.`,
        );
      }
    }
    ```
  - Threshold is configurable via `WALLET_MIN_PREAUTH_PAISE` (default: 20,000 Paise / ₹200.00).
- Registered `UserEntity` in `SessionsModule` `TypeOrmModule.forFeature([ChargingSessionEntity, MeterValueEntity, UserEntity])`.

---

## 3. Test Verification & Results

Command:
```bash
npm test --workspace=apps/backend -- src/modules/sessions/sessions.service.spec.ts
```

Output:
```
PASS src/modules/sessions/sessions.service.spec.ts (20.41 s)
  SessionsService
    √ should start a session and record initial state (33 ms)
    √ should stop an active session and calculate final energy and cost (8 ms)
    √ REM-A05: should reject session start if driver wallet balance is below pre-authorization threshold (38 ms)
    √ REM-A05: should accept session start when driver has sufficient balance (7 ms)

Test Suites: 1 passed, 1 total
Tests:       4 passed, 4 total
Snapshots:   0 total
Time:        22.348 s
```
