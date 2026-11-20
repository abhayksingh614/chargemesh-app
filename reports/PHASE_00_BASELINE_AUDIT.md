# Phase 00 — Baseline Audit & Empirical Verification

> **Audit Date:** November 20, 2026  
> **Environment:** Windows 11 x64, Node.js v20+, npm v10+  
> **Repository Commit:** `b9b28481236cf6c7706955ba0de44a415ccaa1f7`  
> **Methodology:** Direct command-line execution and log verification  

---

## 1. Baseline Test Execution Results

| Command | Working Directory / Target | Exit Code | Duration | Outcome | Root Cause / Observations |
| :--- | :--- | :---: | :---: | :---: | :--- |
| `npm run typecheck` | Root Monorepo | `0` | ~18s | ✅ **PASS** | 0 TypeScript errors across all 5 workspaces (`shared-types`, `shared-constants`, `backend`, `mobile`, `admin`). |
| `npm run test:backend` | `apps/backend` | `0` | 17.7s | ✅ **PASS** | 4 test suites passed, 12 unit tests passed. Covers sessions, stations, auth, and OCPP protocol logic. |
| `npm run test:admin` | `apps/admin` | `1` | 3s | ❌ **FAIL** | `Missing script: "test"`. No test script or Jest/Vitest setup in `apps/admin/package.json`. |
| `npm test` | Root Monorepo (`--workspaces --if-present`) | `0` | 13.9s | ⚠️ **PARTIAL** | Backend runs 12 tests (PASS); Mobile runs `jest --passWithNoTests` (PASS, 0 tests); Admin is skipped. |
| `npm run test:e2e` | `apps/backend` | `1` | 12.4s | ❌ **FAIL** | `moduleNameMapper` in `apps/backend/test/jest-e2e.json` maps `<rootDir>/../../packages/...` resolving to `apps/packages/...` instead of `packages/...`. |
| `npm run lint` | Root Monorepo | `1` | 5s | ❌ **FAIL** | `apps/admin`: prompts interactively (no `.eslintrc*`); `apps/backend` & `apps/mobile`: `eslint` is not recognized as a command (uninstalled). |
| `npm run build:backend` | `apps/backend` | `0` | 9s | ✅ **PASS** | NestJS CLI compiles server to `dist/apps/backend/src/main.js`. |
| `npm run build:admin` | `apps/admin` | `1` | 26s | ❌ **FAIL** | Static page prerender failure (`/500`, `/404`) due to dual React 18 instance context error with `styled-jsx` in npm monorepo hoisting. |

---

## 2. Command-by-Command Empirical Details

### 2.1 Monorepo Static Typecheck (`npm run typecheck`)
- **Execution Command:** `npm run typecheck --workspaces --if-present`
- **Output Evidence:**
  ```text
  > @chargemesh/admin@1.0.0 typecheck
  > tsc --noEmit
  
  > @chargemesh/backend@1.0.0 typecheck
  > tsc --noEmit
  
  > @chargemesh/mobile@1.0.0 typecheck
  > tsc --noEmit
  
  > @chargemesh/shared-constants@1.0.0 typecheck
  > tsc --noEmit
  
  > @chargemesh/shared-types@1.0.0 typecheck
  > tsc --noEmit
  ```
- **Result:** Code `0`. Zero type errors.

### 2.2 Backend Unit Tests (`npm run test:backend`)
- **Execution Command:** `jest`
- **Output Evidence:**
  ```text
  PASS src/modules/sessions/sessions.service.spec.ts (14.75 s)
  PASS src/modules/ocpp/ocpp.service.spec.ts (14.75 s)
  PASS src/modules/stations/stations.service.spec.ts (14.754 s)
  PASS src/modules/auth/auth.service.spec.ts (15.15 s)
  
  Test Suites: 4 passed, 4 total
  Tests:       12 passed, 12 total
  Snapshots:   0 total
  Time:        17.726 s
  ```
- **Result:** Code `0`. 12 unit tests pass.

### 2.3 Backend E2E Tests (`npm run test:e2e`)
- **Execution Command:** `jest --config ./test/jest-e2e.json`
- **Output Evidence:**
  ```text
  FAIL test/ocpp.e2e-spec.ts
  FAIL test/app.e2e-spec.ts
  ● Test suite failed to run
    Could not locate module @chargemesh/shared-types mapped as:
    C:\Users\aksde\Videos\My_Codex\Chargemesh_app\apps\packages\shared-types\index.ts.
  ```
- **Root Cause:** Path resolution in `jest-e2e.json` uses `<rootDir>/../../packages` where `<rootDir>` is `apps/backend/test`. Two `..` steps resolve to `apps/packages` instead of root `packages`.

### 2.4 Monorepo Linter Execution (`npm run lint`)
- **Execution Command:** `npm run lint --workspaces --if-present`
- **Output Evidence:**
  ```text
  > @chargemesh/admin@1.0.0 lint
  > next lint
  ? How would you like to configure ESLint? https://nextjs.org/docs/basic-features/eslint
  
  > @chargemesh/backend@1.0.0 lint
  'eslint' is not recognized as an internal or external command
  
  > @chargemesh/mobile@1.0.0 lint
  'eslint' is not recognized as an internal or external command
  ```
- **Root Cause:** `eslint` was never added to `devDependencies` of root `package.json`, `apps/backend/package.json`, or `apps/mobile/package.json`.

### 2.5 Admin Production Build (`npm run build:admin`)
- **Execution Command:** `next build`
- **Output Evidence:**
  ```text
  TypeError: Cannot read properties of null (reading 'useContext')
      at exports.useContext (.../react/cjs/react.production.min.js)
      at StyleRegistry (.../styled-jsx/dist/index/index.js)
  Error occurred prerendering page "/500"
  Error occurred prerendering page "/404"
  ```
- **Root Cause:** Next.js 14 hoisted `react@18.3.1` in `apps/admin` while root dependencies hoisted `react@18.2.0`, causing multiple React copies in runtime memory during static HTML generation.

---

## 3. Infrastructure & Docker Verification

- **`docker-compose.yml` Configuration:**
  - Services: `postgres` (`postgis/postgis:16-3.4-alpine`), `redis` (`redis:7-alpine`), `redis-commander`, `pgadmin`.
  - Port Bindings: Postgres `5432:5432`, Redis `6379:6379`, Redis Commander `8081:8081`, pgAdmin `5050:80`.
  - Init Script: `docker/postgres/init.sql` enables `postgis`, `postgis_topology`, `uuid-ossp`, and `pg_trgm`.
- **Backend Persistence Gap:**
  - `apps/backend` currently has **NO PostgreSQL ORM/driver installed** (no `typeorm`, `prisma`, `pg`, or `@nestjs/typeorm` in `apps/backend/package.json`).
  - All data services (`AuthService`, `StationsService`, `SessionsService`, `AdminCpoService`, `AdminFinanceService`, etc.) persist records in transient JavaScript `Map` and Array variables in memory.
  - Restarting the NestJS process discards all user accounts, transactions, and session state.

---

## 4. GitHub Actions CI Pipeline Verification

Workflows present in `.github/workflows/`:
1. `ci-backend.yml`: Spins up Postgres & Redis containers, installs dependencies, builds shared packages, runs typecheck, unit tests, and backend build.
2. `ci-mobile.yml`: Installs dependencies, builds shared packages, runs typecheck and unit tests (`--passWithNoTests`).
3. `ci-admin.yml`: Installs dependencies, builds shared packages, runs typecheck.
4. `ci-monorepo.yml`: Unified monorepo CI testing full pipeline on pull requests.
