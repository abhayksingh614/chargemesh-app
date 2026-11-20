# ChargeMesh — Phase 03 Security Audit & Vulnerability Assessment
**Document Reference:** `CM-SEC-P3-001`  
**Audit Standard:** OWASP Top 10 (2021), ASVS Level 2, NIST SP 800-63B  
**Audit Date:** 2026-11-20  
**Target Branch:** `develop`  
**Evaluation Scope:** Authentication, Cryptography, Rate Limiting, CORS, Secrets Isolation  

---

## 1. Security Evaluation Summary

| Finding ID | Severity | Category | Description | Status |
| :--- | :--- | :--- | :--- | :--- |
| **SEC-001** | CRITICAL | Broken Auth | Hardcoded administrative password and backdoor comparison | **VERIFIED RESOLVED** |
| **SEC-002** | HIGH | Rate Limiting | Missing brute-force throttling on authentication endpoints | **VERIFIED RESOLVED** |
| **SEC-003** | HIGH | Cryptography | Fallback to hardcoded default JWT secret in production | **VERIFIED RESOLVED** |
| **SEC-004** | HIGH | Access Control | Overly permissive CORS wildcard with credentials | **VERIFIED RESOLVED** |
| **SEC-005** | HIGH | Auth & Tokens | Universal OTP bypass `'123456'` in driver login | **PARTIALLY RESOLVED** |
| **SEC-006** | HIGH | Architecture | Missing production SMS gateway provider in `OtpService` | **NEW FINDING (OPEN)** |
| **SEC-007** | HIGH | Architecture | In-memory OTP storage fails in multi-instance horizontal cluster | **NEW FINDING (OPEN)** |
| **SEC-008** | HIGH | Data Security | Password change & reset in AdminAuthService bypass DB persistence | **NEW FINDING (OPEN)** |
| **SEC-009** | MEDIUM | Rate Limiting | Rate limiter fail-open policy to local memory under Redis outage | **NEW FINDING (DEGRADED)** |
| **SEC-010** | MEDIUM | Authorization | Missing wallet balance pre-authorization check before starting session | **NEW FINDING (OPEN)** |

---

## 2. Granular Vulnerability Analysis

### SEC-001: Admin Authentication & Password Hashing
- **Status:** **VERIFIED RESOLVED**
- **Affected File:** [apps/backend/src/modules/admin/admin-auth.service.ts](file:///c:/Users/aksde/Videos/My_Codex/Chargemesh_app/apps/backend/src/modules/admin/admin-auth.service.ts)
- **Audit Evidence:**
  - Evaluated `seedInitialAdmins()`: No hardcoded default credentials are set in production; requires `ADMIN_INITIAL_EMAIL` and `ADMIN_INITIAL_PASSWORD`.
  - Password hashing uses `bcrypt` with `SALT_ROUNDS = 12`.
  - Password comparison executes `await bcrypt.compare(password, admin.passwordHash)`.
  - Constant-time dummy comparison (`await bcrypt.compare(password, '$2b$12$...')`) executes on user-not-found to eliminate timing side-channel attacks.
  - Safe projection `toSafeAdmin()` strips `passwordHash` before returning user DTOs.

### SEC-003 & CFG-001: JWT Configuration & Startup Validation
- **Status:** **VERIFIED RESOLVED**
- **Affected Files:**
  - [apps/backend/src/config/env.validation.ts](file:///c:/Users/aksde/Videos/My_Codex/Chargemesh_app/apps/backend/src/config/env.validation.ts)
  - [apps/backend/src/config/configuration.ts](file:///c:/Users/aksde/Videos/My_Codex/Chargemesh_app/apps/backend/src/config/configuration.ts)
  - [apps/backend/src/modules/auth/auth.module.ts](file:///c:/Users/aksde/Videos/My_Codex/Chargemesh_app/apps/backend/src/modules/auth/auth.module.ts)
- **Audit Evidence:**
  - `validateEnvironment()` executes during `ConfigModule.forRoot` boot.
  - In production (`NODE_ENV === 'production'`), startup is immediately aborted if:
    1. `JWT_SECRET` is undefined or `< 32 characters`.
    2. `JWT_SECRET` contains insecure substrings (`chargemesh-secret-key`, `default`, `secret`, `changeme`).
  - `jwtExpiresIn` defaults to `'7d'`.

### SEC-004: Production CORS Allowlist
- **Status:** **VERIFIED RESOLVED**
- **Affected File:** [apps/backend/src/main.ts](file:///c:/Users/aksde/Videos/My_Codex/Chargemesh_app/apps/backend/src/main.ts#L22-L49)
- **Audit Evidence:**
  - `main.ts` intercepts incoming HTTP `Origin` header dynamically.
  - Compares origin against `corsOrigins` list from `ConfigService`.
  - In production, wildcard origin `'*'` is forbidden when `credentials: true`.
  - Non-browser requests (native mobile apps, curl, internal microservices) lacking an `Origin` header are permitted. Unauthorized browser origins receive an explicit CORS violation rejection.

### SEC-005 & SEC-006: OTP Security & SMS Provider Status
- **Status:** **PARTIALLY RESOLVED / OPEN (SEC-006)**
- **Affected Files:**
  - [apps/backend/src/modules/auth/otp/otp.service.ts](file:///c:/Users/aksde/Videos/My_Codex/Chargemesh_app/apps/backend/src/modules/auth/otp/otp.service.ts)
  - [apps/backend/src/modules/auth/otp/mock-otp.provider.ts](file:///c:/Users/aksde/Videos/My_Codex/Chargemesh_app/apps/backend/src/modules/auth/otp/mock-otp.provider.ts)
- **Root Cause & Operational Risk:**
  - Cryptographic hardening of OTP tokens is verified: `crypto.randomInt(100000, 999999)` with SHA-256 salted hashing, 5-minute TTL, maximum 3 verification attempts, 60-second rate cooldown, and `crypto.timingSafeEqual` comparison.
  - **Critical Production Risk:** In `otp.service.ts`:
    ```typescript
    constructor() {
      this.provider = new MockOtpProvider();
    }
    ```
    `MockOtpProvider` line 10 contains:
    ```typescript
    if (process.env.NODE_ENV === 'production') {
      throw new Error('FATAL SEC-005: MockOtpProvider is strictly prohibited in production.');
    }
    ```
    Because no production SMS provider (e.g., Twilio, AWS SNS, MSG91) has been integrated yet, running the backend with `NODE_ENV=production` causes an immediate fatal crash on boot!
  - **Remediation Required:** Implement `TwilioOtpProvider` or `AwsSnsOtpProvider` implementing `IOtpProvider` and inject dynamically based on configuration.

### SEC-007: In-Memory OTP Storage in Multi-Instance Deployments
- **Status:** **NEW FINDING (HIGH)**
- **Affected File:** [apps/backend/src/modules/auth/otp/otp.service.ts#L23](file:///c:/Users/aksde/Videos/My_Codex/Chargemesh_app/apps/backend/src/modules/auth/otp/otp.service.ts#L23)
- **Audit Evidence:**
  - `otpStore = new Map<string, StoredOtpRecord>()` stores hashes in local Node.js process memory.
  - In a horizontally scaled production deployment (e.g. 3 backend pods behind an AWS ALB or Kubernetes Ingress without sticky sessions):
    - Request OTP hits Pod 1 (stored in Pod 1's memory).
    - Verify OTP hits Pod 2 (Pod 2 has no record of the phone number).
    - Driver login fails with `No OTP request found for this phone number`.
  - **Remediation Required:** Move OTP storage from `Map` to Redis with key `chargemesh:otp:<phoneNumber>` and Redis TTL matching the 5-minute expiry.

### SEC-008: Admin Password Changes Bypass Database Persistence
- **Status:** **NEW FINDING (HIGH)**
- **Affected File:** [apps/backend/src/modules/admin/admin-auth.service.ts#L185-L229](file:///c:/Users/aksde/Videos/My_Codex/Chargemesh_app/apps/backend/src/modules/admin/admin-auth.service.ts#L185-L229)
- **Audit Evidence:**
  - `changePassword` and `resetPasswordBySuperAdmin` update `admin.passwordHash` on the in-memory `AdminUserRecord` object.
  - They do NOT call `this.adminRepo.update(admin.id, { passwordHash: admin.passwordHash, updatedAt: new Date() })`.
  - When the backend process restarts or crashes, the updated password is lost, and the previous password hash in the database is restored.
  - **Remediation Required:** Add `await this.adminRepo.update(admin.id, { passwordHash: admin.passwordHash, updatedAt: new Date() })` in both methods.

### SEC-009: Distributed Rate Limiter Outage Policy (Fail-Open to In-Memory)
- **Status:** **NEW FINDING (MEDIUM - SRE/DEGRADED)**
- **Affected File:** [apps/backend/src/common/throttler/redis-throttler-storage.service.ts#L71-L119](file:///c:/Users/aksde/Videos/My_Codex/Chargemesh_app/apps/backend/src/common/throttler/redis-throttler-storage.service.ts#L71-L119)
- **Classification:** **DEGRADED (FAIL-OPEN TO IN-MEMORY)**
- **Security Implications:**
  - When Redis crashes or times out, the service does not fail-closed (which would reject legitimate users). Instead, it falls back to an in-memory `Map` per container.
  - If a production cluster has 5 pods running and Redis fails, an attacker targeting the login endpoint (5 req/min) can achieve up to $5 \times 5 = 25$ req/min by distributing requests across all pods.
  - While this design maximizes availability, sensitive financial or authentication endpoints should be accompanied by monitoring alerts when Redis is unreachable.

### SEC-010: Missing Wallet Pre-Authorization Check Before Session Start
- **Status:** **NEW FINDING (MEDIUM)**
- **Affected File:** [apps/backend/src/modules/sessions/sessions.service.ts#L54-L87](file:///c:/Users/aksde/Videos/My_Codex/Chargemesh_app/apps/backend/src/modules/sessions/sessions.service.ts#L54-L87)
- **Audit Evidence:**
  - `startSession()` verifies station and connector status (`AVAILABLE`).
  - It does NOT check whether the driver (`userId`) has a positive wallet balance (`walletBalancePaise > 0`) or active payment method.
  - A user with ₹0 balance can start a high-power DC fast charging session (e.g., 60 kW) and incur hundreds of rupees of uncollectible debt before stopping.
  - **Remediation Required:** Implement a minimum wallet balance check (e.g., ₹200 or 20,000 Paise) or payment pre-authorization hold before transitioning session to `STARTING`.
