# CHARGEMESH — PHASE 05 MASTER FINDING REGISTER & REMEDIATION TRACKER
**Version:** 1.0  
**Date:** 2026-11-20  
**Execution Authority:** Principal Software Architect, Staff Backend Engineer, DevSecOps Lead, QA Lead  
**Repository:** `https://github.com/abhayksingh614/chargemesh-app`  

---

## 1. Master Findings Register

| Ref ID | Original Severity | Current Severity | Root Cause Summary | Affected Files | Status | Action Plan |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **`FIN-001`** | CRITICAL | CRITICAL | `stopSession` calculates cost but never updates driver `walletBalancePaise` or writes to `finance_ledger`. | `apps/backend/src/modules/sessions/sessions.service.ts` | **OPEN** | Implement atomic wallet debit and ledger recording inside `dataSource.transaction` with pessimistic locking. |
| **`SEC-009`** | CRITICAL | CRITICAL | Administrative controllers lack `@Roles()` guards. Any valid driver JWT can adjust wallets or suspend users. | `apps/backend/src/modules/admin/*.controller.ts` | **OPEN** | Create `RolesGuard`, `@Roles()` decorator, and enforce across all `/api/v1/admin/*` routes. |
| **`OCPP-002`**| CRITICAL | CRITICAL | `handleAuthorize` unconditionally returns `{ status: 'Accepted' }` without checking user validity or balance. | `apps/backend/src/modules/ocpp/ocpp.service.ts` | **OPEN** | Connect `handleAuthorize` to `UserEntity`, verifying registration and positive balance. |
| **`SEC-010`** | HIGH | HIGH | `JwtStrategy` populates `req.user.userId`, but admin controllers inspect `req.user.sub || req.user.id`. | `apps/backend/src/modules/auth/jwt.strategy.ts` | **OPEN** | Normalize JWT user object with `id`, `sub`, `userId`, `role`. |
| **`INT-001`** | HIGH | HIGH | Mobile app and Admin portal rely entirely on local mock datasets and `AsyncStorage` instead of backend REST APIs. | `apps/mobile/src/`, `apps/admin/src/` | **OPEN** | Author `@chargemesh/api-client`, wire mobile auth/stations/wallet to backend, wire admin services to backend APIs. |
| **`SEC-011`** | HIGH | HIGH | 7-day static JWT expiration with no refresh token endpoint (`/auth/refresh`) or Redis token revocation. | `apps/backend/src/modules/auth/` | **OPEN** | Implement refresh token service, rotation, `/auth/refresh` route, and Redis revocation. |
| **`OCPP-003`**| HIGH | HIGH | Active charging transactions stored in volatile in-memory Map; lost upon server restart. | `apps/backend/src/modules/ocpp/ocpp.service.ts` | **OPEN** | Persist active transactions in PostgreSQL `charging_sessions` and sync in Redis. |
| **`DB-001`**  | MEDIUM | MEDIUM | `charging_stations` lacks GiST functional spatial index, forcing sequential scans on `ST_DWithin`. | `apps/backend/src/database/migrations/` | **OPEN** | Add migration with GiST index on `ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)::geography`. |
| **`SEC-014`** | MEDIUM | MEDIUM | Redis OTP attempt counter uses read-modify-write (`get` -> `set`) instead of native atomic `INCR`. | `apps/backend/src/modules/auth/otp/redis-otp-storage.service.ts` | **OPEN** | Separate attempt counter into atomic integer key with Redis `INCR`. |
| **`SEC-013`** | MEDIUM | MEDIUM | Backend `main.ts` lacks `helmet` middleware for standard HTTP security headers. | `apps/backend/src/main.ts` | **OPEN** | Install and configure `helmet` middleware in `main.ts`. |
| **`REM-A05`** | HIGH | HIGH | Wallet pre-auth checks balance but does not place a reservation hold/lock (concurrent overspending risk). | `apps/backend/src/modules/sessions/sessions.service.ts` | **OPEN** | Implement atomic wallet reservation of ₹200.00 (`walletHeldPaise`), released or settled at session stop. |
| **`REM-B01`** | MEDIUM | MEDIUM | SMS gateway external integration blueprint documented; requires commercial provider credentials. | `apps/backend/src/modules/auth/otp/` | **BLOCKED_EXTERNAL** | Production SMS stub fails closed safely; live SMS blocked by external provider keys. |
| **`REM-B02`** | HIGH | HIGH | Razorpay payment integration architecture. | `apps/backend/src/modules/` | **OPEN** | Implement complete server-side Razorpay order, signature verification, webhook handler, and test suite. |
| **`LIC-001`** | HIGH | HIGH | Open-source license selection between MIT and Apache-2.0. | `LICENSE` | **BLOCKED_OWNER_DECISION** | Retain proprietary notices pending owner sign-off. |
| **`POL-001`** | MEDIUM | LOW | Inactivity fee policy. | `apps/backend/src/config/` | **BLOCKED_OWNER_DECISION** | Keep disabled/unconfigured pending business confirmation. |
