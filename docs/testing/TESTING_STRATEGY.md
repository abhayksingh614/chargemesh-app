# ChargeMesh — Automated Testing Strategy & Execution

This document details the quality assurance architecture, test conventions, and execution workflows across all workspaces.

---

## 1. Testing Pyramid & Baseline Status

| Workspace | Test Runner | Test Suites | Passing Tests | Pass Rate | Target Coverage |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Backend & CSMS** (`apps/backend`) | Jest 29 / ts-jest | 15 suites | 96 tests | **100%** | > 85% Statements |
| **Operations Admin** (`apps/admin`) | Jest 29 / ts-jest | 2 suites | 10 tests | **100%** | > 90% Services |
| **Driver Mobile** (`apps/mobile`) | Jest 29 / react-native | 2 suites | 9 tests | **100%** | Critical logic |
| **Monorepo Total** | **Jest Workspaces** | **19 suites** | **115 tests** | **100%** | **Comprehensive** |

---

## 2. Test Execution Commands

```bash
# Execute entire test suite across all 5 workspaces
npm run test

# Run tests with strict typechecking
npm run typecheck && npm run test

# Run specific workspace tests
npm --workspace=@chargemesh/backend test
npm --workspace=@chargemesh/admin test
npm --workspace=@chargemesh/mobile test

# Run single backend test file
npm --workspace=@chargemesh/backend test -- src/modules/wallet/wallet.service.spec.ts
```

---

## 3. Core Test Categories

### 3.1 Financial Ledger Integrity Tests (`wallet.service.spec.ts`, `admin-finance.service.spec.ts`)
- Verifies atomic debit/credit operations under concurrent request loads.
- Rejects fraudulent client amount tampering where client verification amount diverges from authorized order amount.
- Enforces non-negative balance constraints.

### 3.2 Security & Authorization Tests (`auth.service.spec.ts`, `roles.guard.spec.ts`, `admin-auth.service.spec.ts`)
- Enforces strict PBKDF2 / bcrypt hashing with 12 salt rounds.
- Tests password policy complexity (uppercase, lowercase, numbers, special characters).
- Verifies role-based access control (RBAC) across `SUPER_ADMIN`, `OPERATIONS_ADMIN`, and `FINANCE_ADMIN`.
- Tests fail-closed OCPP authentication.

### 3.3 Hardware Protocol & CSMS Handshake Tests (`ocpp.service.spec.ts`)
- Tests OCPP `BootNotification`, `StatusNotification`, `Heartbeat`, `StartTransaction`, and `StopTransaction`.
- Verifies graceful handling of database timeouts with fail-closed security.
