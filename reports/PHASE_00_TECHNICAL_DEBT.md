# Phase 00 — Technical Debt & Architectural Liabilities

> **Audit Date:** November 20, 2026  
> **Repository:** [https://github.com/abhayksingh614/chargemesh-app](https://github.com/abhayksingh614/chargemesh-app)  
> **Standard:** Quantitative Technical Debt Register  

---

## 1. Technical Debt Summary by Category

| Category | Primary Debt Item | Severity | Effort Estimate | Risk of Inaction |
| :--- | :--- | :---: | :---: | :--- |
| **Licensing** | Proprietary license text in `LICENSE` file blocks open-source distribution. | **CRITICAL** | Low (1 day) | Automatic disqualification from Codex for OSS and contributor rejection. |
| **Persistence** | In-memory JS `Map` storage in backend instead of PostgreSQL + PostGIS. | **CRITICAL** | High (5–7 days) | Total data loss on container restart; inability to scale; no real database integrity. |
| **API Integration** | Mobile client operates entirely on local mock data; zero backend HTTP calls. | **HIGH** | Medium (3–4 days) | Mobile app cannot communicate with live chargers or central backend CSMS. |
| **Admin Integration** | Admin web portal operates entirely on local mock data; zero backend HTTP calls. | **HIGH** | Medium (2–3 days) | CPO operators cannot monitor live stations or execute remote commands. |
| **Build Stability** | `npm run build:admin` fails during static prerendering (`/500`, `/404`). | **HIGH** | Low (1–2 days) | Admin portal cannot be deployed as a static production Next.js build. |
| **Testing Harness** | `apps/backend/test/jest-e2e.json` path mapping bug breaks E2E testing. | **MEDIUM** | Low (1 day) | Cannot run automated integration tests against REST and OCPP endpoints. |
| **Testing Coverage** | `apps/mobile` has 0 tests; `apps/admin` has no test script; 0 coverage metrics. | **HIGH** | Medium (3–4 days) | High risk of regression when refactoring components or adding features. |
| **Tooling & Linting** | `eslint` is missing from monorepo devDependencies; `npm run lint` fails. | **MEDIUM** | Low (1 day) | Code style inconsistencies and lack of automated static quality gating in CI. |
| **Security Secrets** | Plaintext admin credentials (`admin123`, `ops123`) in backend service source code. | **HIGH** | Low (1 day) | Security vulnerability if backend code is deployed with in-memory seed credentials. |

---

## 2. Deep Dive: Technical Liabilities

### 2.1 Debt Item DEBT-01: In-Memory Volatile Backend Persistence
- **Affected File:** `apps/backend/src/modules/**/*.service.ts`
- **Technical Description:** All persistent entities (`User`, `Station`, `Connector`, `Session`, `AdminUser`, `Cpo`, `AuditLog`) are instantiated as JavaScript `Map<string, T>` variables inside NestJS service singletons.
- **Root Cause:** Initial rapid prototyping bypassed database integration. Although Docker Compose includes PostgreSQL + PostGIS, no ORM (TypeORM or Prisma) or SQL driver was ever wired into `apps/backend`.
- **Impact:** Any container restart, deployment, or horizontal scaling operation destroys all state.

### 2.2 Debt Item DEBT-02: Client Island Isolation (Mock Data Only)
- **Affected Files:** `apps/mobile/src/services/mockData.ts`, `apps/admin/src/lib/dataService.ts`
- **Technical Description:** Neither the mobile driver application nor the admin operations portal makes any network requests to the backend API (`http://localhost:3001/api/v1`).
- **Root Cause:** Developed in a local-first mock mode for rapid UI evaluation. The transition phase to connect real REST and WebSocket hooks was not completed.
- **Impact:** The backend CSMS gateway runs in complete isolation from the driver app and admin dashboard.

### 2.3 Debt Item DEBT-03: Next.js Static Prerender Failure in Admin Portal
- **Affected File:** `apps/admin/src/app/**`
- **Technical Description:** `npm run build:admin` terminates with `TypeError: Cannot read properties of null (reading 'useContext')` during static page prerendering of `/404` and `/500`.
- **Root Cause:** React 18 dual-version hoisting conflict between Next.js 14 and root npm workspaces with `styled-jsx`.
- **Impact:** Production deployment via `next build` fails in CI and standalone Docker builds.

### 2.4 Debt Item DEBT-04: Broken Jest E2E Configuration
- **Affected File:** `apps/backend/test/jest-e2e.json`
- **Technical Description:** `moduleNameMapper` references `<rootDir>/../../packages/shared-types/index.ts`, which evaluates to `apps/packages/shared-types` instead of `packages/shared-types`.
- **Root Cause:** Incorrect relative path depth calculation.
- **Impact:** All end-to-end integration tests fail to launch.

### 2.5 Debt Item DEBT-05: Missing Linting Infrastructure
- **Affected Files:** `package.json`, `apps/*/package.json`
- **Technical Description:** Monorepo package manifests define `"lint": "eslint ..."` scripts, but `eslint` is absent from dependencies.
- **Root Cause:** Omission during initial workspace setup.
- **Impact:** `npm run lint` fails monorepo-wide.
