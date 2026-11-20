# Master Findings Register — ChargeMesh Engineering Baseline

> **Register Version:** 2.0.0 (Phase 02 Remediation Update)  
> **Repository:** [https://github.com/abhayksingh614/chargemesh-app](https://github.com/abhayksingh614/chargemesh-app)  
> **Branch:** `develop`  
> **Commit SHA:** `b9b28481236cf6c7706955ba0de44a415ccaa1f7` (+ Phase 02 local changes)  
> **Status Standard:** Verified against actual code and runtime execution  
> **Single Source of Truth:** All remediation decisions and phase implementations track back to this register.  

---

## Findings Summary Matrix

| ID | Category | Severity | Description | Final Status |
| :--- | :--- | :---: | :--- | :---: |
| **LIC-001** | Licensing | **CRITICAL** | Proprietary license in `LICENSE` blocks open-source collaboration | ⚠️ **PENDING APPROVAL** |
| **DATA-001** | Persistence | **CRITICAL** | Volatile in-memory `Map` storage in backend instead of PostgreSQL | ⏳ **PLANNED (Phase 3)** |
| **ARCH-001** | Integration | **HIGH** | Mobile app operates in local mock mode; zero backend REST calls | ⏳ **PLANNED (Phase 4)** |
| **ARCH-002** | Integration | **HIGH** | Admin portal operates in local mock mode; zero backend REST calls | ⏳ **PLANNED (Phase 4)** |
| **BUILD-001** | Build | **HIGH** | `npm run build:admin` fails during Next.js static prerendering | ✅ **PASS (Resolved Phase 2B)** |
| **TEST-001** | Testing | **MEDIUM** | `apps/backend/test/jest-e2e.json` path mapping breaks E2E tests | ✅ **PASS (Resolved Phase 2B)** |
| **TEST-002** | Testing | **HIGH** | `apps/mobile` has 0 automated tests (runs with `--passWithNoTests`) | ⏳ **PLANNED (Phase 6)** |
| **TEST-003** | Testing | **MEDIUM** | `apps/admin` has no test script or testing framework configured | ⏳ **PLANNED (Phase 6)** |
| **TOOL-001** | Tooling | **MEDIUM** | `eslint` executable is unbundled; `npm run lint` fails monorepo-wide | ✅ **PASS (Resolved Phase 2B)** |
| **SEC-001** | Security | **HIGH** | Hardcoded plaintext administrative credentials in `admin-auth.service.ts`| ✅ **PASS (Resolved Phase 2A)** |
| **SEC-002** | Security | **MEDIUM** | Absence of rate-limiting throttlers on authentication endpoints | ✅ **PASS (Resolved Phase 2A)** |
| **DATA-002** | Architecture | **MEDIUM** | Triplicate divergent station & CPO mock datasets across workspaces | ⏳ **PLANNED (Phase 3)** |
| **TYPE-001** | Type Safety | **LOW** | TypeScript static typecheck across all 5 monorepo workspaces | ✅ **PASS** |
| **PROT-001** | Protocols | **LOW** | Backend OCPP 1.6-J CSMS WebSocket frame handling and transactions | ✅ **PASS** |
| **HARD-001** | Mobile | **LOW** | Native Android CameraX ML Kit QR scanner and Biometric Keystore lock | ✅ **PASS** |
| **SEC-003** | Security | **LOW** | Automated secret scan detected zero committed production keys | ✅ **PASS** |

---

## Detailed Findings Register

### Finding LIC-001: Proprietary License Text Blocks Open-Source Collaboration
- **Severity:** **CRITICAL**
- **Affected File:** `LICENSE` (lines 1–69), `package.json` (line 42)
- **Actual Observed Behaviour:** `LICENSE` contains "PROPRIETARY SOFTWARE LICENSE Copyright (c) 2026 ChargeMesh. All Rights Reserved. ... No license, express or implied, is granted ... Exclusive proprietary property of ChargeMesh". Root `package.json` specifies `"license": "UNLICENSED"`.
- **Expected Behaviour:** Standard OSI-approved open-source license (MIT or Apache-2.0) with clean copyright attribution.
- **Technical Impact:** Prohibits external contributions, fork redistribution, community adoption, and disqualifies the project from the OpenAI Codex for Open Source program.
- **Remediation Plan:** Awaiting maintainer final selection between MIT License and Apache License 2.0. The migration roadmap and third-party notices have been prepared in `THIRD_PARTY_NOTICES.md` and `docs/LICENSE_EVALUATION.md`.
- **Final Status:** ⚠️ **PENDING OWNER APPROVAL** (Gated; no license modification executed)

---

### Finding DATA-001: Volatile In-Memory Persistence in NestJS Backend
- **Severity:** **CRITICAL**
- **Affected Files:** `apps/backend/src/modules/auth/auth.service.ts`, `apps/backend/src/modules/stations/stations.service.ts`, `apps/backend/src/modules/sessions/sessions.service.ts`, `apps/backend/src/modules/admin/*.service.ts`
- **Actual Observed Behaviour:** State is persisted in JavaScript memory variables (`new Map<string, T>()`).
- **Expected Behaviour:** Durable database persistence via PostgreSQL 16 + PostGIS with migrations and connection pooling.
- **Remediation Plan:** Scheduled for Phase 3 (Database Persistence & Repository Layer).
- **Final Status:** ⏳ **PLANNED (Phase 3)**

---

### Finding ARCH-001: Mobile Application Disconnected from Backend REST API
- **Severity:** **HIGH**
- **Affected Files:** `apps/mobile/src/services/mockData.ts`, `apps/mobile/src/context/*.tsx`
- **Actual Observed Behaviour:** Mobile screens read from local mock files; zero network HTTP requests to backend.
- **Remediation Plan:** Scheduled for Phase 4 (Centralized `apiClient.ts` with mock fallback toggle).
- **Final Status:** ⏳ **PLANNED (Phase 4)**

---

### Finding ARCH-002: Admin Operations Portal Disconnected from Backend Admin API
- **Severity:** **HIGH**
- **Affected Files:** `apps/admin/src/lib/dataService.ts`, `apps/admin/src/app/(dashboard)/**/page.tsx`
- **Actual Observed Behaviour:** Operations portal views consume local hardcoded objects from `dataService.ts`.
- **Remediation Plan:** Scheduled for Phase 4 (Connect `dataService.ts` to `/api/v1/admin/*` endpoints).
- **Final Status:** ⏳ **PLANNED (Phase 4)**

---

### Finding BUILD-001: Next.js Static Prerender Failure in Admin Portal
- **Severity:** **HIGH**
- **Affected Files:** `apps/admin/package.json`, `apps/admin/next.config.js`, `apps/admin/src/components/Sidebar.tsx`, `apps/admin/src/pages/404.tsx`, `apps/admin/src/pages/500.tsx`
- **Actual Observed Behaviour (Phase 0):** `npm run build:admin` crashed during prerendering `/500` and `/404` with `TypeError: Cannot read properties of null (reading 'useContext')` in `StyleRegistry` due to dual React 18 instance hoisting conflicts.
- **Remediation Implemented (Phase 2B):**
  1. Added `styled-jsx@5.1.1` to `@chargemesh/admin` dependencies.
  2. Created `apps/admin/next.config.js` with `transpilePackages: ['@chargemesh/shared-types', '@chargemesh/shared-constants']`.
  3. Created App Router and Pages error boundaries (`apps/admin/src/app/not-found.tsx`, `apps/admin/src/app/error.tsx`, `apps/admin/src/pages/404.tsx`, `apps/admin/src/pages/500.tsx`).
  4. Fixed nullable pathname check in `apps/admin/src/components/Sidebar.tsx` line 80 (`(pathname?.startsWith(...) ?? false)`).
- **Test Evidence:** `npm run build:admin` compiles with **Exit code 0**, cleanly prerendering all 19 routes (17 App Router views and 2 Pages Router error views).
- **Final Status:** ✅ **PASS**

---

### Finding TEST-001: Broken Jest E2E Configuration in Backend
- **Severity:** **MEDIUM**
- **Affected File:** `apps/backend/test/jest-e2e.json` (lines 9–12)
- **Actual Observed Behaviour (Phase 0):** `moduleNameMapper` mapped `@chargemesh/shared-types` with `<rootDir>/../../packages/...` resolving to non-existent `apps/packages/...`.
- **Remediation Implemented (Phase 2B):** Corrected path depth mapping to `<rootDir>/../../../packages/shared-types/index.ts` and `<rootDir>/../../../packages/shared-constants/index.ts`.
- **Test Evidence:** `npm run test:e2e --workspace=apps/backend` executes cleanly with **2 passed suites, 4 passed tests, Exit code 0**.
- **Final Status:** ✅ **PASS**

---

### Finding TEST-002: Zero Automated Test Coverage in Mobile Application
- **Severity:** **HIGH**
- **Affected Files:** `apps/mobile/`
- **Actual Observed Behaviour:** `jest --passWithNoTests` reports 0 tests found.
- **Remediation Plan:** Scheduled for Phase 6.
- **Final Status:** ⏳ **PLANNED (Phase 6)**

---

### Finding TEST-003: Missing Test Script & Harness in Admin Portal
- **Severity:** **MEDIUM**
- **Affected File:** `apps/admin/package.json`
- **Actual Observed Behaviour:** Executing `npm run test:admin` returns `Missing script: "test"`.
- **Remediation Plan:** Scheduled for Phase 6.
- **Final Status:** ⏳ **PLANNED (Phase 6)**

---

### Finding TOOL-001: Missing ESLint Binary in Monorepo Packages
- **Severity:** **MEDIUM**
- **Affected Files:** `package.json`, `.eslintrc.js`, `apps/admin/.eslintrc.json`, `apps/mobile/.eslintrc.js`
- **Actual Observed Behaviour (Phase 0):** `npm run lint` failed monorepo-wide because `eslint` was unbundled and configuration was missing.
- **Remediation Implemented (Phase 2B):**
  1. Installed `eslint@^8.57.0`, `@typescript-eslint/parser@^7.0.0`, and `@typescript-eslint/eslint-plugin@^7.0.0`.
  2. Established root `.eslintrc.js` with non-interactive monorepo rules.
  3. Created `apps/admin/.eslintrc.json` and `apps/mobile/.eslintrc.js`.
  4. Resolved empty catch statements in `authContext.tsx` and lexical declarations in `ocpp.service.ts`.
- **Test Evidence:** `npm run lint` executes cleanly across all 3 application workspaces with **Exit code 0, 0 errors**.
- **Final Status:** ✅ **PASS**

---

### Finding SEC-001: Hardcoded Plaintext Administrative Credentials in Backend Source Code
- **Severity:** **HIGH**
- **Affected Files:** `apps/backend/src/modules/admin/admin-auth.service.ts`, `apps/backend/src/modules/admin/admin-auth.controller.ts`, `apps/backend/src/modules/admin/admin-auth.service.spec.ts`
- **Actual Observed Behaviour (Phase 0):** Service seeded plaintext credentials (`admin123`, `ops123`, `finance123`, `support123`) and allowed any user to authenticate with `'admin123'`.
- **Remediation Implemented (Phase 2A):**
  1. Implemented `bcrypt` password hashing with 12 salt rounds.
  2. Added environment-based provisioning: `ADMIN_INITIAL_EMAIL` and `ADMIN_INITIAL_PASSWORD`.
  3. Enforced production safeguard: In `production` environment, refuses to seed default insecure credentials; requires explicit environment variables with minimum 12 characters.
  4. Implemented timing attack mitigation via constant-time dummy hash comparison for non-existent users.
  5. Implemented `changePassword` with complexity enforcement (length ≥ 8, letters + numbers).
  6. Implemented `resetPasswordBySuperAdmin` for credential rotation.
  7. Authored comprehensive unit test suite `admin-auth.service.spec.ts` covering 11 security test scenarios.
- **Test Evidence:** All 11 unit tests in `admin-auth.service.spec.ts` pass cleanly; backend unit test total increased from 12 to 23 tests.
- **Final Status:** ✅ **PASS**

---

### Finding SEC-002: Absence of Rate-Limiting Throttlers on Authentication Endpoints
- **Severity:** **MEDIUM**
- **Affected Files:** `apps/backend/package.json`, `apps/backend/src/app.module.ts`, `apps/backend/src/main.ts`, `apps/backend/src/modules/auth/auth.controller.ts`, `apps/backend/src/modules/admin/admin-auth.controller.ts`
- **Actual Observed Behaviour (Phase 0):** Authentication endpoints had no rate limiting, vulnerable to credential stuffing.
- **Remediation Implemented (Phase 2A):**
  1. Installed `@nestjs/throttler@^5.1.2` in `@chargemesh/backend`.
  2. Configured global `ThrottlerModule` with `APP_GUARD` in `app.module.ts` (100 req/min base).
  3. Applied `@Throttle({ default: { limit: 5, ttl: 60000 } })` to driver registration, driver login, and admin login endpoints.
  4. Configured `expressApp.set('trust proxy', 1)` in `main.ts` for accurate client IP resolution behind reverse proxies.
- **Test Evidence:** Throttler guards compiled into backend DI container; E2E and unit test suites pass with **Exit code 0**.
- **Final Status:** ✅ **PASS**

---

### Finding TYPE-001: Static TypeScript Compilation Across All 5 Workspaces
- **Severity:** **LOW**
- **Final Status:** ✅ **PASS** (Zero TypeScript errors across monorepo)

---

### Finding PROT-001: Backend OCPP 1.6-J CSMS WebSocket Protocol Handling
- **Severity:** **LOW**
- **Final Status:** ✅ **PASS** (100% test pass on OCPP frame parser and state machine)

---

### Finding HARD-001: Native Android CameraX & Biometric Keystore Hardware Bridges
- **Severity:** **LOW**
- **Final Status:** ✅ **PASS** (Verified Kotlin implementations with ProGuard keep rules)

---

### Finding SEC-003: Zero Committed Production Secrets Detected
- **Severity:** **LOW**
- **Final Status:** ✅ **PASS** (Automated regex scanning confirms zero committed production secrets)
