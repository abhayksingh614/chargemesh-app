# Phase 00 — Feature Verification & Mock vs. Real Analysis

> **Audit Date:** November 20, 2026  
> **Repository:** [https://github.com/abhayksingh614/chargemesh-app](https://github.com/abhayksingh614/chargemesh-app)  
> **Standard:** Verification against actual source code (No assumptions from documentation)  

---

## 1. Feature Implementation Matrix: Code Reality

| Application | Domain / Feature | UI Implementation | Data Source / Backing Layer | Real vs. Mock Status |
| :--- | :--- | :---: | :--- | :---: |
| **Mobile** | **Onboarding & Splash** | ✅ Implemented (2 screens) | Local assets & AsyncStorage | **REAL UI (Local State)** |
| **Mobile** | **Driver Login / Auth** | ✅ Implemented (2 screens) | In-memory `demoUserData.ts` / local regex check | ⚠️ **MOCK AUTH (No API call)** |
| **Mobile** | **Station Map Discovery** | ✅ Implemented (`MapScreen`) | MapLibre vector tiles + `mockData.ts` (15 stations) | ⚠️ **MOCK STATIONS** |
| **Mobile** | **District Search** | ✅ Implemented (`MapScreen`) | `data/stateDistrictMaster.json` (700+ districts) | **REAL LOCAL DATA** |
| **Mobile** | **Station Details View** | ✅ Implemented (`StationDetailScreen`) | `mockData.ts` | ⚠️ **MOCK DETAILS** |
| **Mobile** | **CameraX QR Scanner** | ✅ Implemented (`QRScannerScreen`) | Native Kotlin bridge + Google ML Kit | **REAL HARDWARE BRIDGE** |
| **Mobile** | **Biometric App Lock** | ✅ Implemented (`FingerprintLockOverlay`) | AndroidX `BiometricPrompt` + TEE Keystore | **REAL HARDWARE BRIDGE** |
| **Mobile** | **Live Charging Telemetry** | ✅ Implemented (`LiveChargingScreen`) | Simulated intervals in `ChargingContext.tsx` | ⚠️ **MOCK TELEMETRY (No WSS)** |
| **Mobile** | **Fast Wallet & Ledger** | ✅ Implemented (`WalletTransactionsScreen`) | Local running ledger in `walletData.ts` | ⚠️ **MOCK LEDGER (Local Only)** |
| **Mobile** | **Add Money / Checkout** | ✅ Implemented (`AddMoneyScreen`) | Sandboxed mock payment delay (2 seconds) | ⚠️ **MOCK PAYMENT GATEWAY** |
| **Mobile** | **EV Garage & Models** | ✅ Implemented (`MyVehiclesScreen`) | `data/evCatalog.json` (40 models, 63 variants) | **REAL LOCAL DATA** |
| **Mobile** | **Eco Sustainability** | ✅ Implemented (`EcoSustainabilityScreen`)| Local mathematical conversion (CO₂ formula) | **REAL LOCAL LOGIC** |
| **Mobile** | **Bilingual i18n** | ✅ Implemented (All screens) | `i18n/translations/` (`en.ts`, `hi.ts`) | **REAL IMPLEMENTATION** |
| **Backend** | **Driver Auth API** | ✅ Implemented (`/api/v1/auth`) | In-memory `Map<string, UserEntity>` + bcrypt | ⚠️ **IN-MEMORY STORE** |
| **Backend** | **Station Query API** | ✅ Implemented (`/api/v1/stations`) | Hardcoded in-memory `StationEntity[]` array | ⚠️ **IN-MEMORY STORE** |
| **Backend** | **Session State Machine** | ✅ Implemented (`/api/v1/sessions`)| In-memory `Map<string, SessionRecord>` | ⚠️ **IN-MEMORY STORE** |
| **Backend** | **OCPP 1.6-J CSMS Gateway**| ✅ Implemented (`/ocpp`) | High-throughput `ws` server with JSON-RPC handlers | **REAL PROTOCOL GATEWAY** |
| **Backend** | **Telemetry Stream Gateway**| ✅ Implemented (`/telemetry`) | WebSocket broadcast gateway | **REAL PROTOCOL GATEWAY** |
| **Backend** | **Admin Operations API** | ✅ Implemented (`/api/v1/admin/*`) | In-memory maps for CPOs, users, transactions, audit | ⚠️ **IN-MEMORY STORE** |
| **Admin** | **14 Management Views** | ✅ Implemented (Next.js 14) | Sourced from `apps/admin/src/lib/dataService.ts` | ⚠️ **MOCK DATA (No API call)** |
| **Admin** | **MapLibre Station Map** | ✅ Implemented (`AdminMapLibreMap`) | Rendered from local mock stations | ⚠️ **MOCK DATA** |
| **Admin** | **RBAC Auth Guard** | ✅ Implemented (`authContext.tsx`) | In-memory credentials check (`admin123`, `ops123`)| ⚠️ **MOCK CREDENTIALS** |

---

## 2. Mock vs. Real Integration Disconnect Analysis

A critical finding of this audit is that **the monorepo currently operates as three decoupled islands**:

```
┌─────────────────────────────────┐       ┌─────────────────────────────────┐
│     apps/mobile (Driver App)    │       │   apps/admin (Operations Portal) │
│  - 22 Implemented Screens       │       │  - 14 Implemented Views         │
│  - ZERO fetch/axios API calls   │       │  - ZERO fetch/axios API calls   │
│  - Reads from local mockData.ts │       │  - Reads from dataService.ts    │
└────────────────┬────────────────┘       └────────────────┬────────────────┘
                 │ (No Network Connection)                 │ (No Network Connection)
                 ▼                                         ▼
┌───────────────────────────────────────────────────────────────────────────┐
│                    apps/backend (NestJS CSMS Gateway)                     │
│  - Fully functional REST endpoints (/api/v1/auth, /stations, /sessions)   │
│  - Fully functional WebSocket gateways (/ocpp, /telemetry)                │
│  - ZERO database persistence (In-memory Map variables)                    │
└───────────────────────────────────────────────────────────────────────────┘
```

1. **Mobile Isolation:** `apps/mobile` has complete UI implementations for discovery, live charging gauges, and session completion, but does not execute HTTP requests to `apps/backend`.
2. **Admin Isolation:** `apps/admin` renders executive KPIs, CPO tables, and charger states, but fetches nothing from the backend Admin REST controllers.
3. **Backend Volatility:** While `apps/backend` contains controllers, DTOs, and unit tests, its persistence relies entirely on in-memory Maps. Any restart causes complete data loss.

---

## 3. Duplicate Code & Redundant Data Analysis

| Data Entity | Locations Found in Codebase | Discrepancy / Maintenance Risk |
| :--- | :--- | :--- |
| **Station & CPO Data** | 1. `apps/mobile/src/services/mockData.ts`<br>2. `apps/backend/src/modules/stations/stations.service.ts`<br>3. `apps/admin/src/lib/dataService.ts` | **Three divergent mock datasets.** Station IDs and names do not match across mobile, backend, and admin! |
| **EV Vehicles Catalog** | 1. `apps/mobile/src/data/evCatalog.json`<br>2. `apps/admin/src/app/(dashboard)/ev-master/page.tsx`<br>3. `packages/shared-types/index.ts` (`OemBrandMaster`) | Mobile uses nested JSON format; Admin hardcodes sample OEM models; shared-types defines canonical models. |
| **State / District Data**| 1. `apps/mobile/src/data/stateDistrictMaster.json`<br>2. `apps/mobile/src/data/stateDistrictData.ts`<br>3. `.docs/archive/stateDistrictMaster.ts` | Duplicate master lists across active mobile data and legacy archived directories. |
| **Admin User Models** | 1. `apps/backend/src/modules/admin/admin-auth.service.ts`<br>2. `apps/admin/src/lib/authContext.tsx` | Separate in-memory dictionaries for admin accounts (`adm-001`, `adm-002`, `adm-003`). |

---

## 4. Incomplete & Unused Code Identification

1. **Mobile Unused Network Hooks:** `apps/mobile/src/services/` contains mock files but no HTTP client abstraction (e.g. `apiClient.ts`, token refresh interceptor, or API service layer).
2. **Backend Unconnected Docker Services:** `docker-compose.yml` provides PostgreSQL 16 + PostGIS and Redis 7, but `apps/backend` has no database connection module or ORM service.
3. **Admin Missing Test Setup:** `apps/admin` has no test runners, test configs, or component test files.
4. **Archived Artifacts in Version Control:** `.docs/archive/planning-documents/` contains 7 `.docx` binary files totaling ~15 MB that should be pruned or moved out of core source control.
