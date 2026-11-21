# ChargeMesh — Technology Stack

> **Version:** 1.2.5 | **Updated:** 2026-08-24  
> **Source:** Verified from `package.json`, `build.gradle`, `docker-compose.yml`, and source files.

**Legend:** ✅ Active & Used | 🚧 Scaffolded/Planned | ⏳ Planned

---

## 1. Monorepo & Language Environment

| Technology | Version | Purpose | Status |
|------------|---------|---------|--------|
| **Node.js** | `>= 20.0.0` | Runtime environment | ✅ |
| **npm** | `>= 10.0.0` | Monorepo package manager & workspaces | ✅ |
| **TypeScript** | `^5.5.0` | Strict static typing across all packages | ✅ |

---

## 2. Mobile Application (`apps/mobile`) — ✅ Fully Implemented

### Framework & Navigation

| Technology | Version | Purpose | Status |
|------------|---------|---------|--------|
| **React Native** | `0.74.2` | Cross-platform driver app (Android + iOS) | ✅ |
| **React** | `18.2.0` | UI component framework | ✅ |
| **React Navigation** | `^6.1.17` | App routing and screen transitions | ✅ |
| **React Navigation Bottom Tabs** | `^6.5.20` | Main 5-tab bottom navigator | ✅ |
| **React Navigation Native Stack** | `^6.9.26` | Native stack transitions | ✅ |

### Data & Storage

| Technology | Version | Purpose | Status |
|------------|---------|---------|--------|
| **AsyncStorage** | `^1.23.1` | Auth, theme, language, favorites persistence | ✅ |
| **Local mock data** | — | All station, CPO, vehicle, session data | ✅ |
| `stateDistrictMaster.json` | — | Canonical geo data (36 states, 700+ districts) | ✅ |
| `evCatalog.json` | — | EV vehicle database (multi-brand) | ✅ |

### Maps & Location

| Technology | Version | Purpose | Status |
|------------|---------|---------|--------|
| **MapLibre GL (React Native)** | `^10.x` | Native map rendering with station markers | ✅ |
| GPS / Location | `react-native-geolocation-service` | User location (planned) | ⏳ |

### QR Scanning

| Technology | Details | Purpose | Status |
|------------|---------|---------|--------|
| **CameraX** | Android native | Camera capture pipeline | ✅ |
| **ML Kit (Barcode Scanning)** | Google ML Kit | QR code recognition | ✅ |
| Native Module Bridge | RN ↔ Android | Bridges native scanner to JS | ✅ |

### UI & Theming

| Technology | Details | Purpose | Status |
|------------|---------|---------|--------|
| **ThemeContext** | Custom React Context | Light/dark mode with semantic tokens | ✅ |
| **LanguageContext** | Custom React Context | EN/Hindi with i18n translation | ✅ |
| `theme/colors.ts` | Static tokens | Static color palette definitions | ✅ |
| Custom design system | Internal | Spacing, radius, shadows, typography | ✅ |

### Permissions & Platform

| Technology | Details | Purpose | Status |
|------------|---------|---------|--------|
| **Safe Area Context** | `^4.10.1` | Safe area boundaries (notch handling) | ✅ |
| **Screens** | `^3.31.1` | Native screen optimization | ✅ |
| **Gesture Handler** | `^2.16.2` | Gesture and touch interactions | ✅ |
| **Babel** | `^7.24.0` | TypeScript transpiler | ✅ |

### Android Native

| Technology | Details | Status |
|------------|---------|--------|
| **App ID** | `com.chargemesh.mobile` | ✅ |
| **Version** | 1.2.5 (versionCode 8) | ✅ |
| **Android SDK** | Target 34, Min 23 | ✅ |
| **Build Tools** | 34.x | ✅ |
| **Signing (Debug)** | Debug keystore (dev only) | ✅ |
| **Signing (Release)** | Production keystore required | ⚠️ Pending |

---

## 3. Backend API (`apps/backend`) — 🚧 Scaffolded Only

> ⚠️ Not yet connected to mobile app. Planned for Phase 2.

| Technology | Version | Purpose | Status |
|------------|---------|---------|--------|
| **NestJS** | `^10.x` | REST API + OCPP CSMS gateway | 🚧 |
| **OCPP 1.6-J** | Standard spec | Charge point WebSocket protocol | 🚧 |
| **OCPP 2.0.1** | Standard spec | Next-gen charge point protocol | 🚧 |
| **OCPI 2.3.0** | Standard spec | CPO interoperability & roaming | ⏳ |
| **JWT (RS256)** | — | Stateless auth & session tokens | ⏳ |
| **Razorpay SDK** | — | Payment processing & webhooks | ⏳ |
| **Firebase Admin SDK** | — | Push notification dispatch | ⏳ |
| **AWS SNS / SES** | — | SMS OTP & email dispatch | ⏳ |

---

## 4. Databases & Cache — 🚧 Scaffolded (Docker-ready)

> Docker Compose services are defined but backend is not yet active.

| Technology | Version | Purpose | Status |
|------------|---------|---------|--------|
| **PostgreSQL** | `16` (`postgis/postgis:16-3.4-alpine`) | Relational data (stations, users, sessions) | 🚧 |
| **PostGIS** | `3.4` | Geospatial queries and proximity search | 🚧 |
| **Redis** | `7` (`redis:7-alpine`) | Live connector state, pub/sub, auth cache | 🚧 |
| **TimescaleDB** | — | High-frequency telemetry time-series | ⏳ |
| **pgAdmin 4** | Latest | Database management UI (dev only) | 🚧 |
| **Redis Commander** | Latest | Redis UI explorer (dev only) | 🚧 |

---

## 5. Admin Portal (`apps/admin`) — 🚧 Scaffolded Only

> ⚠️ Not yet functional. No screens implemented.

| Technology | Version | Purpose | Status |
|------------|---------|---------|--------|
| **Next.js** | `^14.x` | Admin web portal framework | 🚧 |
| **React** | `^18.x` | UI component framework | 🚧 |
| **TypeScript** | `^5.5.0` | Type safety | 🚧 |

---

## 6. Shared Packages — ✅ Implemented

| Package | Purpose | Status |
|---------|---------|--------|
| `@chargemesh/shared-types` | TypeScript types (enums, interfaces, models) | ✅ Used by mobile |
| `@chargemesh/shared-constants` | Business rule constants | ✅ Used by mobile |
| `@chargemesh/tsconfig` | Shared TypeScript config | ✅ |

**Key types exported from `shared-types`:**
- `Cpo`, `CpoProtocol`, `CpoIntegrationStatus`
- `Location`, `Connector`, `ConnectorType`, `PowerType`, `ConnectorStatus`
- `FreshnessState`, `Vehicle`, `ChargingSession`, `SessionStatus`, `ChargeTarget`

---

## 7. Testing & Quality

| Technology | Version | Purpose | Status |
|------------|---------|---------|--------|
| **Jest** | `^29.x` | Unit & integration test runner | ✅ (no tests written yet) |
| **ESLint** | `^8.x` | Static linting & code quality | ✅ |
| **TypeScript** | — | Compile-time type checking | ✅ |

> Current state: `jest --passWithNoTests`. No automated tests written yet.

---

## 8. Infrastructure & CI/CD

| Technology | Version | Purpose | Status |
|------------|---------|---------|--------|
| **Docker Compose** | `v3.9` | Local service orchestration | ✅ |
| **GitHub Actions** | `v4 Actions` | CI pipelines (mobile, backend, admin) | ✅ (pipeline defined) |
| **AWS** | — | Cloud hosting (production target) | ⏳ |

---

## 9. Technology Management Policies

1. **Strict source of truth:** `package.json`, `build.gradle`, and `docker-compose.yml` are the definitive dependency sources. This document reflects their contents.
2. **No redundant dependencies:** Prefer native capabilities and existing workspace libraries before adding third-party packages.
3. **Local-first verification:** Verify compatibility, security, and TypeScript definitions locally before adopting new packages.
4. **No credentials in code:** All secrets via environment variables (`.env`, not committed). Production secrets via AWS Secrets Manager.
