# CHARGEMESH — PHASE 04 WORKSTREAM 2: APPLICATION SECURITY AUDIT
**Version:** 1.0  
**Date:** 2026-11-20  
**Auditor:** Senior Application Security Engineer, DevSecOps Lead, OWASP Security Auditor  
**Repository:** `https://github.com/abhayksingh614/chargemesh-app`  
**Scope:** Authentication, Authorization, RBAC, Cryptography, API Security, Dependency Vulnerabilities  

---

## 1. Executive Security Summary

A comprehensive application security audit was performed across backend APIs, administrative modules, authentication pipelines, token lifecycles, and third-party dependencies.

While Phase 03 introduced crucial hardening (fail-closed SMS stub, Redis-backed throttling, bcrypt persistence, and parameterization), this audit uncovered **critical privilege escalation vulnerabilities and administrative identity mapping errors** that must be resolved prior to any production release.

### Summary of Vulnerabilities by Severity
| Severity | Count | Primary Areas |
| :--- | :--- | :--- |
| **CRITICAL** | 2 | Missing RBAC Guards on Admin Endpoints, Unauthenticated Role Escalation |
| **HIGH** | 3 | Admin JWT Identity Mapping (`req.user.sub` undefined), Missing Refresh Token & Revocation, WebSocket (`ws`) Denial of Service |
| **MEDIUM** | 4 | Missing HTTP Security Headers (Helmet), Non-Atomic OTP Attempt Counter, Swallowed DB Write Errors in Auth, Long-Lived Static Tokens (7 days) |
| **LOW / INFO**| 3 | Permissive ValidationPipe Stripping, In-Memory Admin Fallback Map, 59 npm Audit Vulnerabilities (mostly build tools) |

---

## 2. Detailed Findings Register

### SEC-009 (CRITICAL): Missing RBAC Guards on Administrative Endpoints
- **Affected Endpoints:**
  - `POST /api/v1/admin/finance/wallet/adjust` (`AdminFinanceController`)
  - `PUT /api/v1/admin/users/:id/status` (`AdminUsersController`)
  - `GET /api/v1/admin/finance/transactions`
  - `GET /api/v1/admin/users`
- **Vulnerability Mechanism:**
  All administrative controllers use `@UseGuards(AuthGuard('jwt'))`. However, none implement a `@Roles()` guard or check `req.user.role`. Any valid driver JWT generated via driver OTP login or `/api/v1/auth/register` is accepted.
  In `AdminFinanceController`:
  ```typescript
  const actor = {
    id: req.user.sub || req.user.id,
    name: req.user.name || 'Finance Admin',
    role: req.user.role || 'FINANCE_ADMIN',
  };
  return this.financeService.adjustWalletBalance(...);
  ```
  If a driver's JWT lacks an explicit role, `actor.role` defaults to `'FINANCE_ADMIN'`. Any regular driver can call this endpoint with their token and credit millions of rupees to their own wallet.
- **Remediation Required:**
  1. Implement a NestJS `RolesGuard` (`@Roles('SUPER_ADMIN', 'FINANCE_ADMIN')`).
  2. Apply `RolesGuard` across all `/api/v1/admin/*` controllers.
  3. Reject requests where `req.user.role` is not an approved administrative role.

---

### SEC-010 (HIGH): Admin JWT Identity Mapping Discrepancy
- **Affected File:** `apps/backend/src/modules/admin/admin-auth.controller.ts` [L28-L50](file:///c:/Users/aksde/Videos/My_Codex/Chargemesh_app/apps/backend/src/modules/admin/admin-auth.controller.ts#L28-L50)
- **Vulnerability Mechanism:**
  `JwtStrategy.validate()` in `apps/backend/src/modules/auth/jwt.strategy.ts` returns:
  ```typescript
  return {
    userId: payload.sub,
    phoneNumber: payload.phoneNumber,
    name: payload.name,
    role: payload.role || 'driver',
  };
  ```
  However, all admin controllers inspect `req.user.sub || req.user.id`. Because `sub` and `id` are undefined on `req.user`, `req.user.sub || req.user.id` evaluates to `undefined`.
  - In `AdminAuthController.getProfile()`: calls `getProfile(undefined)` which throws `UnauthorizedException('Admin not found')`.
  - In `AdminAuthController.changePassword()`: passes `adminId = undefined`, throwing `UnauthorizedException`.
  - In `AdminAuditService`: audit logs record `actor.id = undefined`.
- **Remediation Required:**
  Update `JwtStrategy` to return `{ id: payload.sub, sub: payload.sub, userId: payload.sub, ... }` to normalize user identity across all controller conventions.

---

### SEC-011 (HIGH): Missing Token Refresh & Session Revocation
- **Affected File:** `apps/backend/src/modules/auth/jwt.strategy.ts`, `apps/backend/src/config/configuration.ts`
- **Vulnerability Mechanism:**
  JWT tokens are issued with a 7-day expiration (`JWT_EXPIRES_IN=7d`). There is no refresh token endpoint (`/auth/refresh`), no token rotation, and no Redis-based token revocation blacklist.
  If an administrator account is suspended or a driver token is compromised, the token remains valid for 7 days with no operational mechanism to terminate active sessions.
- **Remediation Required:**
  1. Reduce access token lifetime to 15 minutes.
  2. Implement refresh tokens stored in Redis with cryptographic hash verification.
  3. Implement token revocation endpoint and Redis blacklist validation in `JwtStrategy`.

---

### SEC-012 (HIGH): WebSocket Library (`ws`) Denial of Service & Memory Disclosure
- **Affected Package:** `ws@8.17.1` (via `@nestjs/platform-ws`)
- **Advisories:**
  - `GHSA-58qx-3vcg-4xpx`: Uninitialized memory disclosure
  - `GHSA-96hv-2xvq-fx4p`: Memory exhaustion DoS from tiny fragments and data chunks
- **Risk to ChargeMesh:** ChargeMesh exposes public WebSocket endpoints for OCPP (`/ocpp`) and Telemetry (`/telemetry`). Malicious chargers or network attackers can stream tiny fragmented frames to exhaust server memory and crash the CSMS gateway.
- **Remediation Required:** Upgrade `@nestjs/platform-ws` and underlying `ws` dependency to patched versions; configure maximum frame size limits on the WebSocket server.

---

### SEC-013 (MEDIUM): Missing HTTP Security Headers (Helmet)
- **Affected File:** `apps/backend/src/main.ts`
- **Vulnerability Mechanism:**
  The backend API server does not include `helmet` middleware. Responses lack standard security headers:
  - `X-Content-Type-Options: nosniff`
  - `X-Frame-Options: DENY`
  - `Strict-Transport-Security` (HSTS)
  - `Content-Security-Policy` (CSP)
- **Remediation Required:** Add `app.use(helmet())` in `main.ts`.

---

### SEC-014 (MEDIUM): Non-Atomic Read-Modify-Write in Redis OTP Attempt Tracking
- **Affected File:** `apps/backend/src/modules/auth/otp/redis-otp-storage.service.ts` [L114-L140](file:///c:/Users/aksde/Videos/My_Codex/Chargemesh_app/apps/backend/src/modules/auth/otp/redis-otp-storage.service.ts#L114-L140)
- **Vulnerability Mechanism:**
  `incrementAttempts` fetches the entire JSON payload via `redis.get()`, parses it, increments `record.attempts`, and writes it back via `redis.set()`. Concurrent requests can execute the read simultaneously, bypassing the 3-attempt brute-force limit.
- **Remediation Required:** Store attempts in a dedicated Redis key using native atomic `INCR`.

---

### SEC-015 (LOW): Permissive ValidationPipe Stripping
- **Affected File:** `apps/backend/src/main.ts` [L50-L56](file:///c:/Users/aksde/Videos/My_Codex/Chargemesh_app/apps/backend/src/main.ts#L50-L56)
- **Observation:** `forbidNonWhitelisted` is set to `false`. While unexpected fields are stripped, malicious clients can submit arbitrarily large unwhitelisted payloads without immediate rejection.
- **Remediation:** Set `forbidNonWhitelisted: true`.
