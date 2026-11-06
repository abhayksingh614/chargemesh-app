# ChargeMesh — Security & DevSecOps Audit Report

> **Audit Standard:** OWASP Top 10 API Security, CWE/SANS Top 25, Play Store Security Requirements, DPDP Act 2023  
> **Repository:** [abhayksingh614/chargemesh-app](https://github.com/abhayksingh614/chargemesh-app)  
> **Date:** November 2026  
> **Classification:** Comprehensive Security Audit  

---

## 1. Executive Summary

ChargeMesh handles sensitive automotive, financial, and geospatial workflows, including driver geolocation, vehicle specifications, fast wallet balances, and direct hardware communication with physical EV charging equipment.

An automated and manual static security analysis was conducted across all source files, configurations, build scripts, and git commit history. The codebase demonstrates strong security architecture with no exposed production credentials, proper environment abstraction, and hardware-backed biometric protections.

---

## 2. Secrets & Credential Exposure Review

| Category | Finding | Status |
| :--- | :--- | :--- |
| **Committed API Keys / Tokens** | Automated regex scan for AWS access keys (`AKIA...`), GitHub personal access tokens (`ghp_...`), Razorpay live keys (`rzp_live_...`), and RSA private keys detected **zero production secrets**. | ✅ **PASSED** |
| **Environment File Hygiene** | Only `.env.example` templates exist (`.env.example`, `apps/backend/.env.example`, `apps/mobile/.env.example`, `apps/admin/.env.example`). No `.env` or production credentials exist in the repository. | ✅ **PASSED** |
| **Gitignore Coverage** | `.gitignore` comprehensively excludes `.env`, `.env.*`, `*.pem`, `*.key`, `*.keystore`, `*.jks`, `keystore.properties`, and build artifacts across all workspaces. | ✅ **PASSED** |
| **Android Signing Keystores** | `app/build.gradle` dynamically checks environment variables (`CM_RELEASE_STORE_FILE`) and falls back to `debug.keystore` for local builds, preventing production keystore commits. | ✅ **PASSED** |

---

## 3. Authentication & Authorization Security

### 3.1 Backend Authentication (`apps/backend`)

- **JWT Implementation:** Driver tokens are signed and verified using `@nestjs/jwt` and `passport-jwt` with configurable expiration (`15m` access tokens, `30d` refresh tokens).
- **Password Hashing:** Implemented via `bcrypt` with salt rounds for driver registration and verification.
- **Admin In-Memory Model:** In `apps/backend/src/modules/admin/admin-auth.service.ts`, default in-memory administrative accounts are seeded for local development.
  - *Observation:* `passwordHash` fields are stripped before returning responses using object destructuring:
    ```typescript
    const { passwordHash, ...safeAdmin } = admin;
    return safeAdmin;
    ```
  - *Recommendation:* Prior to production deployment, migrate in-memory admin seeding to persistent database storage with bcrypt-hashed credentials stored in secret managers.

### 3.2 Role-Based Access Control (RBAC)

- Admin routes are protected with `RolesGuard` (`apps/backend/src/modules/admin/guards/roles.guard.ts`) validating against `AdminRole` enums:
  - `SUPER_ADMIN`
  - `OPERATIONS_ADMIN`
  - `FINANCE_ADMIN`
  - `SUPPORT_ADMIN`
  - `ANALYST`
- Unauthorized attempts correctly throw `UnauthorizedException` or `ForbiddenException`.

### 3.3 Mobile Hardware Security (`apps/mobile`)

- **Biometric Security:** Native Android `BiometricPrompt` integrates with the hardware Trusted Execution Environment (TEE) / Keystore.
- **App Lock Overlay:** When enabled, `FingerprintLockOverlay` intercepts app foreground transitions and prevents screen interaction until hardware authentication passes.
- **No CPO Credentials in Mobile:** The mobile app does not store or process direct CPO API keys, adhering strictly to the architecture standard.

---

## 4. Network, CORS & API Gateway Security

- **CORS Protection:** Configured in `apps/backend/src/main.ts` via `cors: { origin: ... }` with strict origin filtering based on `CORS_ALLOWED_ORIGINS`.
- **Global Input Sanitization:** Global `ValidationPipe` with `whitelist: true`, `transform: true`, and `forbidNonWhitelisted: true` is enabled, rejecting malicious payload pollution.
- **HTTP Exception Filtering:** `HttpExceptionFilter` intercepts errors to sanitize internal system stack traces from leaking to client responses.

---

## 5. Build Hardening & Android Security

- **ProGuard / R8 Optimization:** `apps/mobile/android/app/build.gradle` enables `enableProguardInReleaseBuilds = true` and `shrinkResources = true`.
- **ProGuard Rules:** `apps/mobile/android/app/proguard-rules.pro` contains explicit keep rules for:
  - React Native JNI bridges and TurboModules
  - AndroidX CameraX Core and Lifecycle
  - Google ML Kit Barcode Vision
  - AndroidX Biometrics Keystore
  - Native Kotlin modules
- **Google Play Compliance:** Deceptive or unverified third-party OAuth modals were eliminated, complying with Google Play Developer Program policies.

---

## 6. Privacy & DPDP Act 2023 Compliance

- **Data Minimization:** Driver registration collects only minimal required parameters (`phoneNumber`, `name`, `vehicle` specs).
- **Account Deletion & Data Privacy:** Dedicated modal dialogues exist in the mobile app (`LegalDocsModal`, `PrivacyPolicyModal`, `DataPrivacyModal`) informing drivers of their rights and data retention schedules.
- **Geospatial Privacy:** Coordinates are used exclusively for radial distance calculations (`ST_DWithin` / Haversine) and are not retained as persistent tracking breadcrumbs without explicit active charging sessions.

---

## 7. DevSecOps Action Plan

1. **Automated Secret Scanning in CI:** Integrate `gitleaks` or GitHub Secret Scanning in `.github/workflows/` to block accidental credential commits.
2. **Dependabot Configuration:** Add `.github/dependabot.yml` to automatically monitor and alert on vulnerable third-party npm packages and GitHub Actions.
3. **Database Migration to Secrets Manager:** Wire backend configuration directly to AWS Secrets Manager or HashiCorp Vault in production environments.
4. **Rate Limiting:** Activate NestJS Throttler (`@nestjs/throttler`) for brute-force protection on `/api/v1/auth/login` and `/api/v1/admin/auth/login`.
