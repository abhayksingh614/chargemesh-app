# ChargeMesh — System Architecture

> **Version:** 1.2.5 | **Status:** Local-First (Mock Data) | **Updated:** 2026-08-24

---

## 1. Current Architecture — Local-First (v1.2.5)

> **Important:** The current implementation is intentionally local-first. The mobile app does NOT connect to any backend API. All data is sourced from local mock files. Backend integration is a planned next phase.

```
┌─────────────────────────────────────────────────────────┐
│          ChargeMesh Driver App (React Native)           │
│                 Android + iOS (v1.2.5)                  │
│                                                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐ │
│  │   Screens   │  │  Contexts   │  │   Components    │ │
│  │  (22 total) │  │  (7 total)  │  │   (20 total)    │ │
│  └──────┬──────┘  └──────┬──────┘  └────────┬────────┘ │
│         └────────────────┼──────────────────┘          │
│                          │                              │
│  ┌───────────────────────▼────────────────────────────┐ │
│  │                 Local Data Layer                   │ │
│  │  mockData.ts    evCatalog.json    walletData.ts    │ │
│  │  stateDistrictMaster.json (canonical geo source)   │ │
│  └────────────────────────────────────────────────────┘ │
│                          │                              │
│  ┌───────────────────────▼────────────────────────────┐ │
│  │              AsyncStorage Persistence              │ │
│  │  Auth state · Theme · Language · Favorites         │ │
│  └────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘

         ⬆ Not connected yet ⬆

┌─────────────────────────────────────────────────────────┐
│         ChargeMesh Backend (NestJS) — SCAFFOLDED        │
│                  (Planned — Phase 2)                    │
└─────────────────────────────────────────────────────────┘
```

---

## 2. Planned Architecture — Backend-Connected (Phase 2)

> This is the **target** architecture once backend integration is complete. Not yet implemented.

```
┌─────────────────────────────────────────────────────────┐
│          ChargeMesh Driver App (React Native)           │
└─────────────────────────┬───────────────────────────────┘
                          │ HTTPS REST + WebSocket
                          ▼
┌─────────────────────────────────────────────────────────┐
│               ChargeMesh API Gateway                    │
└────────┬───────────────────────────────┬────────────────┘
         │                               │
         ▼                               ▼
┌────────────────────┐     ┌─────────────────────────────┐
│  NestJS Core API   │     │  OCPP CSMS Gateway Server   │
│  - Auth / Users    │     │  - OCPP 1.6-J / 2.0.1       │
│  - Stations        │     │  - WebSocket Hub             │
│  - Sessions        │     │  - Remote Start / Stop RPC  │
│  - Billing         │     │  - Telemetry stream          │
└────────┬───────────┘     └──────────────┬──────────────┘
         │                               │
         └───────────────┬───────────────┘
                         ▼
┌─────────────────────────────────────────────────────────┐
│               Persistence & Cache Layer                 │
│  PostgreSQL + PostGIS  │  TimescaleDB  │  Redis         │
│  (stations, sessions)  │  (telemetry)  │  (live state)  │
└─────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────┐
│           CPO Network Integrations (OCPI 2.3.0)         │
│  Tata Power  │  Jio-bp  │  Statiq  │  ChargeZone  │ ... │
└─────────────────────────────────────────────────────────┘
```

---

## 3. Mobile App Internal Architecture

### 3.1 Layer Structure

```
apps/mobile/src/
├── navigation/         # RootStackNavigator + MainTabNavigator
├── screens/            # 22 screen-level components
├── components/         # 20 reusable UI components
├── context/            # 7 React Context providers
├── services/           # Mock data services
├── data/               # Static JSON/TS data sources
├── i18n/               # Bilingual translations (EN + HI)
└── theme/              # Static color tokens (colors.ts)
```

### 3.2 State Management

The app uses 7 React Context providers, stacked at the app root:

| Context | Responsibility | Persistence |
|---------|---------------|-------------|
| `ThemeContext` | Light/Dark mode toggle + theme tokens | AsyncStorage |
| `LanguageContext` | EN/Hindi toggle, translation lookup | AsyncStorage |
| `AuthContext` | User auth, vehicle list, wallet, profile | AsyncStorage |
| `ChargingContext` | Active session, telemetry simulation, timer | Memory |
| `FavoritesContext` | Saved stations CRUD | AsyncStorage |
| `FilterContext` | Map/home station filter state | Memory |

### 3.3 Navigation Structure

```
RootStackNavigator
├── Splash
├── Onboarding
├── Login
├── Register
└── MainTabNavigator
    ├── HomeScreen → StationDetail → PreCharge → QRScanner → LiveCharging → SessionComplete
    ├── MapScreen → StationDetail (same flow)
    ├── QRScannerScreen (direct Scan & Charge entry)
    ├── ActivityScreen
    └── ProfileScreen → MyAccount / MyVehicles / AddVehicle / Vehicle
                      → PaymentMethods / WalletTransactions
                      → Favorites / EcoSustainability
```

### 3.4 Data Flow (Current — Mock)

```
User Action
    ↓
Screen Component
    ↓
Context Hook (useAuth / useCharging / useFavorites / ...)
    ↓
Local Mock Data (mockData.ts / evCatalog.json / ...)
    ↓
AsyncStorage (for persistent state)
    ↓
UI Update (re-render via context)
```

---

## 4. Native Integrations

| Feature | Technology | Platform |
|---------|------------|----------|
| QR Code Scanning | CameraX + ML Kit | Android (native module) |
| Maps | MapLibre GL | Android + iOS |
| Local Storage | AsyncStorage | Cross-platform |
| Permissions | react-native-permissions | Android + iOS |

---

## 5. Data Source Architecture

```
Canonical Data Sources (Local — Current)
├── mockData.ts             ← Stations, CPOs, sessions (20 stations, 6 CPOs)
├── evCatalog.json          ← EV vehicle database (JSON — canonical)
├── stateDistrictMaster.json ← Geographic data (JSON — canonical source of truth)
│   └── stateDistrictMaster.ts ← Typed accessor layer (imports from JSON, no separate data)
└── walletData.ts           ← Transaction history mock
```

> **Canonical source rule:** `stateDistrictMaster.json` is the authoritative data source.
> `stateDistrictMaster.ts` provides typed access — it must not maintain a separate dataset.

---

## 6. Security Architecture (Current)

| Concern | Current Approach | Production Requirement |
|---------|-----------------|----------------------|
| Authentication | Mock (demo phone + OTP 123456) | Real OTP/OAuth via backend |
| Data storage | AsyncStorage (unencrypted) | Encrypted AsyncStorage for sensitive data |
| API keys | None in codebase | AWS Secrets Manager |
| App signing | Debug keystore | Production keystore (Play Store) |
| Credentials in code | Dev-only, labelled | Remove before production release |

See [`SECURITY.md`](SECURITY.md) for full security documentation.

---

## 7. Monorepo Package Architecture

```
chargemesh-app/
├── apps/
│   ├── mobile/       ← Fully implemented React Native app
│   ├── backend/      ← Scaffolded NestJS (not connected)
│   └── admin/        ← Scaffolded Next.js (not connected)
└── packages/
    ├── shared-types/     ← TypeScript types (used by mobile + backend)
    ├── shared-constants/ ← Business rule constants
    └── tsconfig/         ← Shared TypeScript config
```

TypeScript types are shared via `@chargemesh/shared-types` workspace package. The mobile app imports:
- `Cpo`, `CpoProtocol`, `CpoIntegrationStatus`
- `Location`, `Connector`, `ConnectorType`, `PowerType`, `ConnectorStatus`
- `FreshnessState`, `Vehicle`, `ChargingSession`, `SessionStatus`, `ChargeTarget`
