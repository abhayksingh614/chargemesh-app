# ChargeMesh — Phase 03 Remediation Baseline & Reconciliation
**Document Reference:** `CM-BASE-P3-002`  
**Execution Baseline Git Commit:** `b9b28481236cf6c7706955ba0de44a415ccaa1f7`  
**Branch:** `develop`  
**Date:** 2026-11-20  
**Status:** ACTIVE AUDIT BASELINE  

---

## 1. Executive Summary & Verification Context

This document establishes the verified, evidence-backed engineering baseline for Phase 03 Remediation across the ChargeMesh monorepo (`https://github.com/abhayksingh614/chargemesh-app`).

Every finding documented herein has been reproduced and reconciled against live source code, database entities, and runtime services. All remediation work proceeds in strictly controlled local batches with zero destructive actions against `chargemesh_dev`, zero unstaged git loss, zero commits, and zero remote git pushes.

---

## 2. Working Tree & Environment State

- **Target Branch:** `develop`
- **Head Commit:** `b9b28481236cf6c7706955ba0de44a415ccaa1f7` (Confirmed via `git rev-parse HEAD`)
- **Working Tree State:** All uncommitted workspace modifications preserved. Zero resets or destructive checkouts performed.
- **Active Docker Containers:**
  - `chargemesh_postgres`: PostgreSQL 16.3 + PostGIS 3.4 Alpine (`0.0.0.0:5434->5432/tcp`, status healthy).
  - `chargemesh_redis`: Redis 7 Alpine (`0.0.0.0:6379->6379/tcp`, status healthy).
- **Core Verification Baseline:**
  - `npm run typecheck`: 0 errors across 5 workspaces (`admin`, `backend`, `mobile`, `types`, `const`).
  - `npm run lint`: 0 errors.
  - `npm run test:backend`: 11 suites, 54 tests passing.
  - `npm run test:e2e --workspace=apps/backend`: 2 suites, 5 tests passing.
  - `npm run test:admin`: 1 suite, 5 tests passing.
  - `npm run test --workspace=apps/mobile`: 1 suite, 5 tests passing.
  - `npm run build:backend`: Clean build.
  - `npm run build:admin`: Next.js 14.2 App Router clean compilation.

---

## 3. Reconciled Findings & Remediation Register

| Issue ID | Severity | Component | File Path | Verified Defect Description | Remediation Plan |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **SEC-006** | **CRITICAL** | `OtpService` | `apps/backend/src/modules/auth/otp/otp.service.ts` | Instantiates `MockOtpProvider` directly, throwing runtime `FATAL SEC-005` in production when OTP is sent. | Extract pluggable `IOtpProvider` architecture; provide `MockOtpProvider` and `ProductionSmsProviderStub` with clean health readiness check. |
| **REM-A03** | **CRITICAL** | `AdminFinanceService` | `apps/backend/src/modules/admin/admin-finance.service.ts` | `adjustWalletBalance()` records in `finance_ledger` but fails to update `users.walletBalancePaise` in PostgreSQL. | Wrap in atomic database transaction with pessimistic row locking (`FOR UPDATE`); update both tables atomically. |
| **SEC-007 / REM-A06** | **HIGH** | `OtpService` | `apps/backend/src/modules/auth/otp/otp.service.ts` | In-memory `otpStore` Map cannot share state across multi-pod container deployments. | Implement `RedisOtpStorageService` utilizing Redis key `chargemesh:otp:<purpose>:<phone>` with 5-minute TTL and atomic attempt counters. |
| **REM-A01** | **HIGH** | `AdminAuthService` | `apps/backend/src/modules/admin/admin-auth.service.ts` | `changePassword()` and `resetPasswordBySuperAdmin()` mutate in-memory Map only; lost on process restart. | Call `this.adminRepo.update()` with new bcrypt hash and updated timestamp. |
| **REM-A02** | **HIGH** | `AdminUsersService` | `apps/backend/src/modules/admin/admin-users.service.ts` | `findById()` and `findAll()` query in-memory `users` Map; ignores database records. | Inject and query `userRepo` with pagination, status filtering, and search. |
| **AUDIT-005 / REM-A04** | **HIGH** | `FinanceLedgerEntity` | `apps/backend/src/database/entities/finance-ledger.entity.ts` | Monetary fields (`amountRupees`, `balanceBeforeRupees`, `balanceAfterRupees`) stored as `float` (`double precision`). | Migrate to `numeric(12, 2)` to prevent floating-point rounding errors. Add TypeORM migration. |
| **REM-A05** | **HIGH** | `SessionsService` | `apps/backend/src/modules/sessions/sessions.service.ts` | Allows drivers with ₹0 or negative balance to initiate charging sessions. | Introduce pre-authorization minimum balance check (configurable, default ₹200 / 20,000 Paise). |
| **REM-A07 / AUDIT-006** | **MEDIUM** | `StationsService` | `apps/backend/src/modules/stations/stations.service.ts` | `findAll()` performs spatial filtering in Node.js heap rather than database. | Refactor proximity search to execute PostGIS `ST_DWithin` spatial query. |
| **REM-A08 / AUDIT-009** | **LOW** | Test Infrastructure | `RedisThrottlerStorageService` & Jest Suites | Jest worker force-exit warning caused by unref-less timers and unclosed Redis client connections. | Add `unref()` to cleanup interval timers and explicit teardown hooks in test suites. |
| **REM-B01** | **ARCH** | SMS Gateway | `apps/backend/src/modules/auth/otp/` | External SMS Gateway integration stub. | Create production interface `IOtpProvider` with AWS SNS / Twilio adapter specifications. |
| **REM-B02** | **ARCH** | Payment Gateway | `apps/backend/src/modules/admin/admin-finance.service.ts` | External Payment Gateway integration stub. | Document Razorpay / Stripe webhook signature verification specifications. |

---

## 4. Preserved Business & Governance Items (Pending Owner Approval)

The following items are deliberately preserved without code modification pending maintainer decision:

1. **`LIC-001` (License Selection):** The repository maintains its proprietary notice (`LICENSE`, `UNLICENSED`). Dual-option MIT vs. Apache-2.0 migration is documented and ready to execute upon owner decision.
2. **`POL-001` (Offline Charger Policy):** Physical EVSE simulation vs. 503 Service Unavailable rejection policy is preserved pending hardware staging access.
3. **`POL-002` (Wallet Pre-Authorization Threshold):** Default pre-authorization threshold is set to ₹200 (20,000 Paise) with environmental override capability (`WALLET_MIN_PREAUTH_PAISE`).

---

## 5. Execution Roadmap

- **Batch 1:** OTP Security & Redis Distributed Storage (`SEC-006`, `SEC-007`, `REM-B01`)
- **Batch 2:** Admin Password Database Persistence (`REM-A01`)
- **Batch 3:** Driver Data Persistence in Admin Users Service (`REM-A02`)
- **Batch 4:** Financial Data Integrity & Atomic Transactions (`REM-A03`, `AUDIT-005`)
- **Batch 5:** Charging Wallet Pre-Authorization (`REM-A05`, `POL-002`)
- **Batch 6:** PostGIS Station Proximity Queries via `ST_DWithin` (`REM-A07`, `AUDIT-006`)
- **Batch 7:** Jest Resource Cleanup & Open Handles (`REM-A08`, `AUDIT-009`)
- **Batch 8:** External Provider Integrations Architecture (`REM-B01`, `REM-B02`)
- **Batch 9:** Admin, Mobile, and Backend Test Depth
- **Batch 10:** Final Regression, Verification, and Engineering Audit Report
