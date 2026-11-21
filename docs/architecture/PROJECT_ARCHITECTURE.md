# ChargeMesh — Project Architecture Specification

> **Version:** 1.0.0 (Production Architecture Standard)  
> **Repository:** [abhayksingh614/chargemesh-app](https://github.com/abhayksingh614/chargemesh-app)  
> **Domain:** EV Charging Infrastructure, CSMS Gateway & Interoperability  

---

## 1. Architectural Overview

ChargeMesh is designed as a distributed, high-performance monorepo platform that bridges drivers, Charge Point Operators (CPOs), and central station management systems (CSMS).

The architecture separates concerns into client presentation, central gateway orchestration, operations administration, and shared domain models:

```
┌───────────────────────────────────────────────────────────────────────────────────┐
│                                CLIENT INTERFACES                                  │
├────────────────────────────────────────┬──────────────────────────────────────────┤
│    ChargeMesh Driver App (React Native)│  ChargeMesh Operations Portal (Next.js)  │
│  - 22 Screens, Light/Dark Design System│  - 14 Admin Dashboards, Executive View   │
│  - Native CameraX QR Scanner & ML Kit  │  - CPO Management & Charger Health Map   │
│  - Native AndroidX Biometric App Lock  │  - Financial Ledger & Wallet Adjustments │
│  - Radial Telemetry & Local Geo-Master │  - EV Master Catalog & Audit Trails      │
└───────────────────┬────────────────────┴─────────────────────┬────────────────────┘
                    │                                          │
                    │ HTTPS REST & WSS Telemetry               │ HTTPS Admin REST
                    ▼                                          ▼
┌───────────────────────────────────────────────────────────────────────────────────┐
│                  CHARGEMESH BACKEND PLATFORM & GATEWAY (NestJS 10)                 │
├───────────────────────────────────────────────────────────────────────────────────┤
│  REST API Gateway (/api/v1)                                                       │
│  ├── /auth: Driver Registration, JWT Issuance, Passport Strategy                 │
│  ├── /stations: Geo-spatial Station Query, Distance & Connector Filtering         │
│  ├── /sessions: Remote Start/Stop Commands, Active Session Ledger                │
│  └── /admin: RBAC Guards, Dashboard Metrics, CPO Sync, Moderation & Audit Logs    │
├───────────────────────────────────────────────────────────────────────────────────┤
│  WebSocket Real-Time Gateways                                                     │
│  ├── /ocpp: OCPP 1.6-J & 2.0.1 Protocol Engine (Boot, Heartbeat, Status, Tx)      │
│  └── /telemetry: Real-Time Session Readings Broadcast (kW, SoC %, Voltage, Amps) │
└───────────────────┬──────────────────────────────────────────┬────────────────────┘
                    │                                          │
                    │ TCP / SQL (Port 5432)                    │ TCP In-Memory (6379)
                    ▼                                          ▼
┌────────────────────────────────────────┐ ┌────────────────────────────────────────┐
│      PERSISTENCE (PostgreSQL 16)       │ │          CACHE & STATE (Redis 7)       │
│  - PostGIS Spatial Indexing (ST_DWithin│ │  - Ephemeral Session States            │
│  - UUID-OSSP & pg_trgm Fuzzy Search    │ │  - Rate Limiting Tokens                │
│  - Canonical Relations & Financial Log │ │  - CPO Real-Time Heartbeat Cache       │
└────────────────────────────────────────┘ └────────────────────────────────────────┘
```

---

## 2. Monorepo Organization & Workspace Graph

The repository is managed via **npm workspaces** with modular boundaries:

```
chargemesh-app/
├── apps/
│   ├── mobile/                 # React Native 0.74.2 Cross-Platform Driver Application
│   │   ├── android/            # Native Gradle build scripts, ProGuard, CameraX & Biometric bridges
│   │   └── src/                # 22 Screens, 20+ Components, 7 Contexts, i18n, Theme & Services
│   ├── backend/                # NestJS 10.3 REST API & OCPP 1.6-J / 2.0.1 WebSocket Gateway
│   │   ├── src/                # Auth, Stations, Sessions, Telemetry, OCPP, Admin Modules
│   │   └── test/               # Jest Unit & Integration Test Suites
│   └── admin/                  # Next.js 14.2 App Router CPO & Operations Portal
│       └── src/                # 14 Management Views, Components, MapLibre & Data Services
├── packages/
│   ├── shared-types/           # Canonical TypeScript interfaces, enums, DTO models
│   ├── shared-constants/       # Business constants, error codes, tax rates, timeouts
│   └── tsconfig/               # Shared base TypeScript configuration
├── docker/
│   └── postgres/               # PostgreSQL PostGIS initialization script (init.sql)
└── docs/                       # Comprehensive architectural & compliance specifications
```

### Dependency Flow

```
[apps/mobile]   ───► [packages/shared-types] ◄─── [apps/backend]
       │             [packages/shared-constants]         ▲
       ▼                                                │
[packages/tsconfig] ◄───────────────────────────────────┴─── [apps/admin]
```

- Applications consume `@chargemesh/shared-types` and `@chargemesh/shared-constants`.
- Code changes in domain models update both frontend and backend synchronously.

---

## 3. Mobile Application Architecture (`apps/mobile`)

The mobile client is built on **React Native 0.74.2** following a modular, clean component-driven pattern.

### 3.1 Layer Breakdown

1. **Presentation Layer (Screens & Navigators):**
   - **RootStackNavigator:** Handles root transitions (`Splash` ➔ `Onboarding` ➔ `Login` ➔ `Register` ➔ `MainTabs` ➔ `StationDetail` ➔ `PreCharge` ➔ `LiveCharging` ➔ `SessionComplete` ➔ Sub-screens).
   - **MainTabNavigator:** Bottom navigation with 5 key tabs: Home (`HomeScreen`), Discover Map (`MapScreen`), Charge QR (`QRScannerScreen`), Activity History (`ActivityScreen`), Driver Profile (`ProfileScreen`).
2. **State & Context Layer:**
   - `AuthContext`: Authentication session, driver profile, persistent login state.
   - `ChargingContext`: Active charging session telemetry, kW metrics, target limits, cost accumulator.
   - `FilterContext`: Multi-criteria filter state (Connector type, minimum kW, availability, network).
   - `FavoritesContext`: Saved driver favorite stations with local persistence.
   - `ThemeContext`: Dark/Light theme switching with semantic token dispatch.
   - `LanguageContext`: English / Hindi bilingual language provider.
3. **Hardware & Native Bridge Layer:**
   - **CameraX + Google ML Kit:** Hardware-accelerated camera preview and instant QR barcode scanning.
   - **AndroidX BiometricPrompt:** Hardware Keystore-backed fingerprint/biometric security on app launch.
4. **Data Layer:**
   - Local-first architecture: `mockData.ts`, `evCatalog.json` (OEM models), `walletData.ts`, `stateDistrictMaster.json` (36 States, 700+ Districts).
   - `AsyncStorage` caching engine for offline resilience.

---

## 4. Backend Gateway Architecture (`apps/backend`)

The backend is built with **NestJS 10.3**, providing enterprise modularity, dependency injection, and dual protocol support (HTTP/HTTPS + WebSocket).

### 4.1 Modules & Endpoints

| Module | Protocol | Path / Event | Description |
| :--- | :--- | :--- | :--- |
| **AuthModule** | HTTP | `POST /api/v1/auth/register`<br>`POST /api/v1/auth/login`<br>`GET /api/v1/auth/me` | Driver registration, bcrypt password hashing, JWT access token generation, Passport JWT strategy. |
| **StationsModule** | HTTP | `GET /api/v1/stations`<br>`GET /api/v1/stations/:id` | Geospatial station discovery using Haversine distance, connector power filter, and live availability queries. |
| **SessionsModule** | HTTP | `POST /api/v1/sessions/start`<br>`POST /api/v1/sessions/:id/stop`<br>`GET /api/v1/sessions/:id`<br>`GET /api/v1/sessions/user/history` | State machine governing charging sessions: `REQUESTED` ➔ `STARTING` ➔ `CHARGING` ➔ `STOPPING` ➔ `COMPLETED` / `FAILED`. |
| **OcppModule** | WebSocket | `/ocpp` | Full bidirectional OCPP 1.6-J & 2.0.1 Central System Management Service (CSMS). Handles physical charger connections, authorization, and meter values. |
| **TelemetryModule**| WebSocket | `/telemetry` | Low-latency broadcast gateway streaming live session telemetry (current power kW, state of charge %, voltage, amps, accumulated cost). |
| **AdminModule** | HTTP | `POST /api/v1/admin/auth/login`<br>`GET /api/v1/admin/dashboard/stats`<br>`GET /api/v1/admin/cpos`<br>`GET /api/v1/admin/users`<br>`GET /api/v1/admin/finance/transactions`<br>`GET /api/v1/admin/audit` | Comprehensive operations API with role-based guards (`SUPER_ADMIN`, `OPERATIONS_ADMIN`, `FINANCE_ADMIN`, `SUPPORT_ADMIN`). |

### 4.2 OCPP Protocol Pipeline

```
[Physical EV Charger] ──► (WebSocket wss://.../ocpp)
         │
         ├── [BootNotification] ────────► OcppService.handleBootNotification()
         ├── [Heartbeat]        ────────► OcppService.handleHeartbeat()
         ├── [StatusNotification] ─────► OcppService.handleStatusNotification()
         ├── [Authorize]        ────────► OcppService.handleAuthorize()
         ├── [StartTransaction] ────────► OcppService.handleStartTransaction()
         ├── [MeterValues]      ────────► OcppService.handleMeterValues() ──► TelemetryGateway.broadcast()
         └── [StopTransaction]  ────────► OcppService.handleStopTransaction()  ──► SessionsService.finalize()
```

---

## 5. Operations Admin Portal Architecture (`apps/admin`)

The Admin Web Portal is built on **Next.js 14.2 App Router** with React 18:

- **Executive Overview (`/dashboard`):** Real-time KPI cards (Active Users, 24h Drivers, Total CPOs, Charger Health Breakdown, Revenue, CO₂ Saved).
- **CPO Network Management (`/cpos`):** Partner health, API endpoint status, sync frequency, revenue split.
- **Stations & Hubs (`/stations`, `/chargers`):** Station geospatial directory with MapLibre GL visualization and live connector states.
- **Financial Ledger & Fast Wallet (`/finance`, `/wallet`):** Audit-compliant financial transactions, Razorpay reference reconciliation, wallet credit/debit adjustments.
- **EV Master Catalog (`/ev-master`):** Database of OEM brands (Tata, Mahindra, MG, Hyundai, Kia, BYD), battery specs, connector types, and DC charge limits.
- **Audit Trail (`/audit-logs`):** Immutable log of admin operations with actor role, IP address, previous value, new value, and justification reason.

---

## 6. Database & Persistence Architecture

The planned production database schema runs on **PostgreSQL 16 + PostGIS**:

- **Spatial Indexing:** Uses PostGIS `GEOMETRY(Point, 4326)` with `GIST` indexes for rapid `ST_DWithin` radial station queries.
- **Relational Integrity:** Foreign key constraints between `cpos`, `stations`, `connectors`, `users`, `charging_sessions`, and `wallet_transactions`.
- **Fuzzy Search:** Enabled via PostgreSQL `pg_trgm` extension on station names, cities, and addresses.
- **Development Mode:** Backend currently implements in-memory repository stores (`Map<string, T>`) with equivalent relational shapes to enable zero-dependency development before database migration bootstrap.
