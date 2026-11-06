# ChargeMesh — Testing & Quality Assurance Standard

> **Standard:** Verified against actual test runners across monorepo workspaces.  
> **Source:** Jest, TypeScript CLI, NestJS CLI, Next.js build tools.  

---

## 1. Testing Summary & Status

| Workspace / Scope | Tooling | Command | Verified Result | Observations |
| :--- | :--- | :--- | :--- | :--- |
| **Monorepo Typecheck** | `tsc --noEmit` | `npm run typecheck` | ✅ **PASS** | 0 TypeScript errors across all 5 workspaces (`shared-types`, `shared-constants`, `backend`, `mobile`, `admin`). |
| **Backend Unit Tests** | `jest` + `ts-jest` | `npm run test:backend` | ✅ **PASS (12/12)** | 4 test suites pass in ~20s. Covers auth, stations, sessions, and OCPP protocol logic. |
| **Mobile Unit Tests** | `jest` | `npm run test --workspace=apps/mobile` | 🟡 **PASS (0 Tests)** | Jest exits cleanly with `--passWithNoTests`. React Native component and context test suites planned. |
| **Backend Production Build** | `nest build` | `npm run build:backend` | ✅ **PASS** | Successfully compiles NestJS server to `dist/apps/backend`. |
| **Admin Production Build** | `next build` | `npm run build:admin` | ⚠️ **PARTIAL** | Compiles 19 static pages; Next.js lockfile patching / dual React 18 resolution in monorepo requires deduplication. |
| **Monorepo Linting** | `eslint` | `npm run lint` | ⚠️ **PENDING** | ESLint binary not bundled in root `devDependencies`. |

---

## 2. Test Prerequisites & Environment

Before running tests, ensure you have:
1. Built the shared TypeScript packages:
   ```bash
   npm run build --workspace=packages/shared-types
   npm run build --workspace=packages/shared-constants
   ```
2. Node.js `>= 20.0.0` and npm `>= 10.0.0`.
3. For local backend E2E tests with Docker services, ensure containers are active:
   ```bash
   npm run docker:up
   ```

---

## 3. Verified Test Commands

### 3.1 Typecheck All Workspaces
```bash
# Typecheck everything across the monorepo
npm run typecheck

# Or typecheck a specific workspace
npm run typecheck --workspace=apps/backend
npm run typecheck --workspace=apps/mobile
npm run typecheck --workspace=apps/admin
```

### 3.2 Backend Unit Tests
```bash
# Run all backend tests
npm run test:backend

# Run with test coverage report
npm run test:cov --workspace=apps/backend

# Run in watch mode during development
npm run test:watch --workspace=apps/backend
```

#### Verified Backend Test Suites:
- `apps/backend/src/modules/auth/auth.service.spec.ts`: Validates registration, duplicate phone rejection, credential checking, and JWT issuance.
- `apps/backend/src/modules/stations/stations.service.spec.ts`: Validates station lookup by ID and spatial query filters.
- `apps/backend/src/modules/sessions/sessions.service.spec.ts`: Validates session lifecycle, target limits, and stop commands.
- `apps/backend/src/modules/ocpp/ocpp.service.spec.ts`: Validates OCPP 1.6-J CSMS frame handling, BootNotification, Heartbeat, and MeterValues.

### 3.3 Mobile Tests
```bash
npm run test --workspace=apps/mobile
```

---

## 4. Known Limitations & Technical Debt

1. **Mobile Unit Test Coverage:** The mobile client relies heavily on local mock data and native device APIs (CameraX, BiometricPrompt, MapLibre GL). Mocking native bridges in Jest requires dedicated mock setups in `jest.setup.js`.
2. **ESLint Executable:** The monorepo manifests reference `eslint` in scripts, but `eslint` was not installed as a direct dependency in `devDependencies`. A unified ESLint 8/9 flat config is planned.
3. **Next.js Dual React Resolution:** When running `next build` in `apps/admin`, npm workspaces hoist `react@18.2.0` while Next.js sub-packages resolve `18.3.1`, occasionally triggering context null checks in static generation.

---

## 5. Authoring New Tests (Guidelines for Contributors)

### Writing a Backend Unit Test
Place test files adjacent to the service being tested with `.spec.ts` suffix:
```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { StationsService } from './stations.service';

describe('StationsService', () => {
  let service: StationsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StationsService],
    }).compile();

    service = module.get<StationsService>(StationsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
```

### Writing a Mobile Context Test
Mock native Android modules using `jest.mock()` before importing React Native components:
```typescript
jest.mock('react-native/Libraries/EventEmitter/NativeEventEmitter');
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);
```
