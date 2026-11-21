# ChargeMesh — Open-Source Repository Audit Report

> **Audit Date:** November 2026  
> **Repository:** [abhayksingh614/chargemesh-app](https://github.com/abhayksingh614/chargemesh-app)  
> **Auditor Role:** Senior Open Source Architect, Staff Software Engineer & DevSecOps Specialist  
> **Audit Standard:** Open Source Readiness, Security Posture, Architecture Integrity, and Play Store Release Verification

---

## Executive Summary

ChargeMesh is an EV charging interoperability and discovery platform engineered for the Indian electric vehicle ecosystem. It addresses the fragmentation of Charge Point Operators (CPOs) across India by creating a unified driver application, real-time OCPP gateway services, and an operations management portal.

This audit report represents an exhaustive source-code verification of the ChargeMesh repository. Every assertion in this document is derived directly from the verified code files, package manifests, build scripts, and test suites across the monorepo.

---

## 1. Repository Inventory & Workspace Structure

The project is structured as an NPM Workspaces monorepo:

| Path | Type | Technology | Purpose | Code Verification Status |
| :--- | :--- | :--- | :--- | :--- |
| `apps/mobile` | Cross-Platform App | React Native 0.74.2, TypeScript 5.5 | Driver-facing mobile application (Android & iOS) | **Implemented (Local-First Mock Mode)** |
| `apps/backend` | REST & WS Gateway | NestJS 10.3, Express, ws | Central CSMS gateway, OCPP 1.6-J/2.0.1, REST APIs | **Implemented (In-Memory Data Models)** |
| `apps/admin` | Web Portal | Next.js 14.2 App Router, React 18 | CPO Operations & Executive Management Portal | **Implemented (Local Data Layer)** |
| `packages/shared-types` | Core Domain Models | TypeScript 5.5 | Canonical interfaces, enums, models | **Implemented & Built** |
| `packages/shared-constants` | Business Rules | TypeScript 5.5 | Status thresholds, GST rates, error codes | **Implemented & Built** |
| `packages/tsconfig` | Build Tooling | JSON | Shared compiler options base | **Implemented** |
| `docker/` | Infrastructure | Docker Compose v3.9 | PostgreSQL 16 + PostGIS, Redis 7, pgAdmin | **Implemented & Verified** |
| `docs/` | System Documentation | Markdown | Architecture specs, UI flows, security rules | **21 Documents Present** |

---

## 2. Source-Code Verification: Implemented vs Partially Implemented vs Planned

To ensure strict engineering integrity, we categorize all capabilities by actual codebase reality:

### 2.1 Mobile Application (`apps/mobile`)

| Capability | Status | Source Location / Verification Evidence |
| :--- | :--- | :--- |
| **22 Complete Driver Screens** | **Implemented** | `apps/mobile/src/screens/` (Splash, Onboarding, Login, Register, Home, Map, StationDetail, PreCharge, LiveCharging, SessionComplete, QRScanner, Activity, Profile, MyAccount, Vehicle, AddVehicle, MyVehicles, PaymentMethods, Favorites, WalletTransactions, EcoSustainability, PermissionSetup, AddMoney) |
| **Bilingual i18n (English & Hindi)** | **Implemented** | `apps/mobile/src/i18n/translations/` (`en.ts`, `hi.ts`) with runtime language toggle in `LanguageContext.tsx` |
| **Adaptive Theming** | **Implemented** | `apps/mobile/src/theme/` (Light & Dark theme token sets) with semantic color tokens in `ThemeContext.tsx` |
| **Native Android CameraX QR Scanner** | **Implemented** | Hardware-accelerated camera feed with Google ML Kit Barcode scanning bridge in `android/app/src/main/java/` |
| **Native AndroidX Biometric Lock** | **Implemented** | `BiometricPrompt` with TEE hardware-backed key protection in `services/fingerprintAuth.ts` and `components/FingerprintLockOverlay.tsx` |
| **Radial Telemetry Gauge UI** | **Implemented** | `components/ChargingGauge.tsx` and `screens/LiveChargingScreen.tsx` (real-time kW, %, V, A, dynamic charging curve) |
| **Fast Wallet & Running Ledger** | **Implemented** | `services/walletData.ts`, `screens/WalletTransactionsScreen.tsx`, and `screens/AddMoneyScreen.tsx` with 18% GST calculation |
| **EV Garage & Connector Filtering** | **Implemented** | Multi-vehicle storage, battery specs, `data/evCatalog.json`, and connector filtering in `context/FilterContext.tsx` |
| **State & District Geo-Master** | **Implemented** | 36 Indian states and 700+ districts in `data/stateDistrictMaster.json` for geo-fencing and district-level station discovery |
| **Backend REST API Client** | **Partially Implemented** | Data layer currently runs in local-first mock mode (`services/mockData.ts`); HTTP client wiring to NestJS is scaffolded |
| **Live SMS OTP Delivery** | **Planned** | Auth UI accepts simulated test OTPs; production AWS SNS/Msg91 delivery requires credential wiring |
| **Razorpay Production Checkout** | **Planned** | Sandboxed wallet simulation implemented; live UPI intent / SDK bridge planned |

### 2.2 Backend Gateway Service (`apps/backend`)

| Capability | Status | Source Location / Verification Evidence |
| :--- | :--- | :--- |
| **NestJS 10 Framework Scaffold** | **Implemented** | `apps/backend/src/app.module.ts`, `main.ts`, global prefix `/api/v1`, HTTP exception filters, transform interceptor |
| **Driver Auth & JWT Token Issuance** | **Implemented** | `modules/auth/` (`auth.controller.ts`, `auth.service.ts`, `jwt.strategy.ts`, Passport JWT, bcrypt) |
| **Station Discovery REST API** | **Implemented** | `modules/stations/` (`GET /api/v1/stations`, `GET /api/v1/stations/:id` with geo-radius and connector filtering) |
| **Charging Session State Machine** | **Implemented** | `modules/sessions/` (`POST /api/v1/sessions/start`, `POST /api/v1/sessions/:id/stop`, `GET /api/v1/sessions/:id`) |
| **OCPP 1.6-J & 2.0.1 WebSocket CSMS** | **Implemented** | `modules/ocpp/` (`ocpp.gateway.ts`, `ocpp.service.ts` handling `BootNotification`, `Heartbeat`, `StatusNotification`, `Authorize`, `StartTransaction`, `StopTransaction`, `MeterValues`, `RemoteStartTransaction`, `RemoteStopTransaction`) |
| **Live Telemetry WebSocket Gateway** | **Implemented** | `modules/telemetry/` (`telemetry.gateway.ts`, `telemetry.service.ts` broadcasting real-time session readings) |
| **Admin Operations & RBAC API** | **Implemented** | `modules/admin/` (Controllers for Dashboard stats, CPO sync, User moderation, Financial ledger, and Audit trail) |
| **Automated Unit Test Harness** | **Implemented** | 4 test suites (`sessions.service.spec.ts`, `stations.service.spec.ts`, `ocpp.service.spec.ts`, `auth.service.spec.ts`), **12/12 passing** |
| **PostgreSQL + PostGIS Persistence** | **Planned / Scaffolded** | Docker container and PostGIS init script (`docker/postgres/init.sql`) active; backend currently uses in-memory maps (`Map<string, T>`); ORM entities (TypeORM/Prisma) planned |
| **OCPI 2.2.1 / 2.3 Modules** | **Planned** | Direct OCPP CSMS gateway implemented; OCPI bilateral REST modules planned for Phase 3 |

### 2.3 CPO Admin Portal (`apps/admin`)

| Capability | Status | Source Location / Verification Evidence |
| :--- | :--- | :--- |
| **Next.js 14 App Router Framework** | **Implemented** | `apps/admin/src/app/`, `globals.css`, responsive sidebar navigation |
| **Role-Based Access Control (RBAC)** | **Implemented** | `Super Admin`, `Operations Admin`, `Finance Admin`, `Support Admin`, `Analyst` roles in `lib/authContext.tsx` |
| **14 Management Views** | **Implemented** | Executive Dashboard, Users & Drivers, CPO Networks, Stations & Hubs, Live Chargers, Bookings, Sessions, Finance & Ledger, Fast Wallet, EV Master Catalog, ESG Sustainability, Broadcast Alerts, Audit Trail, Settings |
| **MapLibre GL Map Integration** | **Implemented** | `components/AdminMapLibreMap.tsx` for visual station hub clustering |
| **Live Telemetry Visualizer** | **Implemented** | `components/TelemetryLineChart.tsx` for power/voltage curves |
| **Backend REST Client Wiring** | **Partially Implemented** | Currently driven by in-memory `dataService.ts`; ready for production backend endpoints |

---

## 3. Dependency & License Audit

### 3.1 Third-Party Dependencies

All direct runtime dependencies across the workspaces utilize standard, business-friendly permissive open-source licenses:

- **React & React Native Ecosystem:** MIT License (`react`, `react-native`, `react-native-screens`, `react-native-safe-area-context`, `@react-navigation/*`, `@react-native-async-storage/async-storage`).
- **NestJS Ecosystem:** MIT License (`@nestjs/core`, `@nestjs/common`, `@nestjs/jwt`, `@nestjs/passport`, `@nestjs/websockets`).
- **Next.js Ecosystem:** MIT License (`next`, `react-dom`).
- **Mapping & Geospatial:** BSD-3-Clause (`maplibre-gl`), BSD-2-Clause (`@maplibre/maplibre-react-native`).
- **Networking & Utilities:** MIT License (`uuid`, `bcrypt`, `class-validator`, `class-transformer`, `rxjs`, `ws`).
- **Infrastructure:** PostgreSQL License (PostgreSQL), GNU GPL v2 (PostGIS extension runtime), 3-Clause BSD / RSALv2 (Redis).

### 3.2 Repository Licensing Recommendation

- **Current State:** The repository contains a proprietary notice in `LICENSE` (`PROPRIETARY SOFTWARE LICENSE Copyright (c) 2026 ChargeMesh. All Rights Reserved.`) and `"license": "UNLICENSED"` in `package.json`.
- **Target Recommendation:** **MIT License**
  - **Rationale:** The MIT license provides maximum adoption potential for EV charging interoperability, permits seamless collaboration with hardware CPO partners, educational institutions, and independent developers, while disclaiming liability.
  - **Alternative (Apache 2.0):** If the repository owner desires explicit patent retaliation clauses and trademark protections, Apache 2.0 is the recommended alternative.
  - **Action Required:** Formal owner approval is needed before transitioning the proprietary license text to MIT.

---

## 4. Quality & Build Verification Summary

| Check | Workspace | Result | Observations |
| :--- | :--- | :--- | :--- |
| `npm run typecheck` | Monorepo (5 workspaces) | ✅ **PASS** | 0 TypeScript errors across `shared-types`, `shared-constants`, `backend`, `admin`, `mobile`. |
| `npm run test:backend` | `apps/backend` | ✅ **PASS** | 4/4 test suites, 12/12 unit tests passing. |
| `npm run test:mobile` | `apps/mobile` | 🟡 **PASS (No Tests)** | Jest configured with `--passWithNoTests`; unit test suite needed for components/contexts. |
| `npm run build:backend` | `apps/backend` | ✅ **PASS** | NestJS CLI produces optimized production build in `dist/`. |
| `npm run build:admin` | `apps/admin` | ⚠️ **PARTIAL** | Compiles 19 static pages; styled-jsx / dual React instance in npm monorepo requires deduplication config. |
| `npm run lint` | Monorepo | ⚠️ **PARTIAL** | ESLint executable was unbundled in root devDependencies; lint configuration script needed. |

---

## 5. Security & DevSecOps Audit Findings

1. **No Committed Hardcoded Credentials:** Automated secret scanning across git history and working tree detected no production private keys, GitHub tokens, AWS credentials, or live payment keys.
2. **Environment Variable Hygiene:** `.env.example` templates exist at the root, backend, mobile, and admin directories containing sanitized placeholders (`your_jwt_secret_here_min_64_chars`, `rzp_test_xxxxxxxxxxxx`).
3. **Android Release Security:** ProGuard/R8 rules are strictly defined in `apps/mobile/android/app/proguard-rules.pro` protecting native CameraX, BiometricPrompt, and React Native bridge classes while enabling resource and code shrinking. Dynamic keystore fallback protects release signing.
4. **OWASP Best Practices:** In-memory backend services sanitize passwords using object destructuring (`const { passwordHash, ...safe } = admin`).

---

## 6. Recommendations & Roadmap to Open-Source Launch

1. **Adopt Open-Source License:** Authorize the transition from proprietary license to the MIT License.
2. **Publish Contributor Infrastructure:** Provide full GitHub community health files (`CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, `SECURITY.md`, `SUPPORT.md`, Issue & PR templates).
3. **Enhance Testing Suite:** Add React Native component tests for mobile contexts and Next.js page tests.
4. **Database Migration Pipeline:** Introduce TypeORM or Prisma migrations for the PostgreSQL + PostGIS schema.
5. **REST API Client Wiring:** Transition mobile and admin portals from local mock mode to dynamic backend REST communication via feature flags (`USE_MOCK_DATA=false`).
