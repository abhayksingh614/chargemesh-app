# ChargeMesh — Project Overview

> **Version:** 1.2.5 | **Status:** Mobile App — Production-Ready (Android) | **Updated:** 2026-08-24

---

## 1. Product Summary

**ChargeMesh** is a unified EV charging interoperability platform for India. It aggregates participating Charge Point Operator (CPO) networks into a single cross-platform mobile experience for drivers, backed by a web-only admin portal for operations.

**Tagline:** *Charge Green. Drive Smart.*

ChargeMesh solves the core problem of fragmentation in India's EV charging ecosystem — where multiple CPO networks operate independently with different apps, payment systems, and station discovery tools. ChargeMesh is the single app that unifies them all.

---

## 2. Core Value Proposition

| Pillar | Description |
|--------|-------------|
| **Unified Discovery** | One map and search interface covering multiple CPO networks. Includes state & district filtering across 36 states and 700+ districts. |
| **Connector-Level Status** | Live status tracking at individual connector granularity (`Available`, `Occupied`, `Faulted`, `Unavailable`). |
| **Standardized Charging Flow** | QR scan → pre-charge selection (₹/kWh/time target) → remote start → live session → auto-stop & payment. |
| **Real-Time Session Monitoring** | Live session data: SoC (State of Charge), energy delivered (kWh), power rate (kW), duration, accrued cost. |
| **Bilingual Experience** | Full English and Hindi support with persistent language toggle. |
| **Dark & Light Mode** | Dynamic theme system powered by `ThemeContext` and semantic design tokens. |
| **Eco Impact Tracking** | CO₂ saved, green miles driven, and eco impact analytics per user. |

---

## 3. Implementation Status (as of v1.2.5)

### Mobile App (`apps/mobile`) — **FULLY IMPLEMENTED**

The React Native mobile driver app is the primary deliverable of this phase. It is Android-first and built to production quality.

- **22 fully implemented screens** (see `SCREENS_AND_NAVIGATION.md` for full catalog)
- **20 reusable UI components** with a consistent design system
- **7 state management contexts** using React Context + AsyncStorage
- **Full bilingual support** (English + Hindi, `i18n/translations/`)
- **Mock data layer** — all data comes from `mockData.ts`, `evCatalog.json`, and `stateDistrictMaster.json`
- **Native QR scanning** via CameraX + ML Kit
- **MapLibre-based maps** with station markers, state/district picker
- **Wallet system** — ₹100 joining bonus, transaction history, payment method management
- **Favorites system** — saved stations with search and filter

### Backend API (`apps/backend`) — **SCAFFOLDED — NOT YET CONNECTED**

> ⚠️ **Important:** The backend NestJS project exists as scaffolding only. The mobile app does NOT connect to this backend. All mobile data is sourced from local mock files.

Planned future integration (not yet implemented):
- OCPP 1.6-J and 2.0.1 WebSocket protocol handlers
- REST API for station discovery, session management, telemetry
- PostgreSQL + PostGIS for station/session data
- Redis for live session state cache

### Admin Portal (`apps/admin`) — **SCAFFOLDED — NOT YET FUNCTIONAL**

> ⚠️ **Important:** The Next.js admin portal project exists as scaffolding only. No functional admin screens have been implemented.

Planned future scope:
- Station and CPO management
- Live session monitoring
- User management and analytics

---

## 4. Product Stack Overview

| Component | Technology | Status |
|-----------|------------|--------|
| **Mobile App** | React Native / TypeScript | ✅ Fully Implemented |
| **Backend API** | NestJS / TypeScript / Node.js | 🚧 Scaffolded |
| **Admin Portal** | Next.js / React | 🚧 Scaffolded |
| **Database** | PostgreSQL + PostGIS + Redis | 🚧 Planned (docker-compose ready) |
| **Maps** | MapLibre (mobile) | ✅ Implemented |
| **QR Scanning** | CameraX + ML Kit (native Android) | ✅ Implemented |
| **Payments** | Razorpay (tokenized) | 🚧 Planned (mock only) |
| **Push Notifications** | Firebase FCM / APNs | 🚧 Planned |
| **CPO Protocol** | OCPI 2.3.0 + proprietary adapters | 🚧 Planned |
| **Language** | English + Hindi (bilingual) | ✅ Implemented |

---

## 5. Project Architecture

```
[Driver App (React Native)]
      │
      ├── [Local Mock Data Layer] ← Current state (mockData.ts, evCatalog.json)
      │
      └── [Backend API (NestJS)] ← Future integration (not yet connected)
                │
                ├── [PostgreSQL + PostGIS]
                ├── [Redis Cache]
                └── [CPO Networks via OCPI/OCPP]

[Admin Portal (Next.js)] ← Scaffolded (future scope)
```

> **Note:** The current architecture is intentionally local-first with mock data. This enables full UI/UX development and testing without requiring a live backend. Backend integration is a planned next phase.

---

## 6. Data Sources (Current)

| Data Source | File | Description |
|-------------|------|-------------|
| Charging stations | `apps/mobile/src/services/mockData.ts` | 20 mock stations, 6 CPOs |
| EV vehicle catalog | `apps/mobile/src/data/evCatalog.json` | Multi-brand EV database |
| State & district data | `apps/mobile/src/data/stateDistrictMaster.json` | 36 states, 700+ districts (canonical source) |
| Wallet transactions | `apps/mobile/src/services/walletData.ts` | Mock transaction history |

> **Canonical data source rule:** `stateDistrictMaster.json` is the single source of truth for geographic data. The TypeScript layer (`stateDistrictMaster.ts`) provides typed access to this JSON — it must not maintain a separate duplicate dataset.

---

## 7. Security Notes

> ⚠️ **DEV/TEST ONLY — DO NOT USE IN PRODUCTION**

The mobile app includes demo credentials for development and testing purposes:
- Demo phone numbers and OTP (`123456`) are hardcoded in `AuthContext.tsx`
- These are labelled clearly and must be removed/replaced before any production release
- No real API keys, payment credentials, or user data are present in the codebase
- All `.env` files are excluded from version control via `.gitignore`

For full security documentation, see [`SECURITY.md`](SECURITY.md).

---

## 8. Key Design Principles

1. **Easy to See → Easy to Read → Easy to Understand → Easy to Act**
2. **Local-first architecture** — full offline/mock-first development
3. **Semantic theming** — all colors via theme tokens (no hardcoded hex in components)
4. **Bilingual by default** — no screen should be English-only
5. **Accessibility** — sufficient contrast ratios in both light and dark modes
6. **No real credentials in code** — ever

---

## 9. Related Documentation

| Document | Link |
|----------|------|
| Screen catalog | [SCREENS_AND_NAVIGATION.md](SCREENS_AND_NAVIGATION.md) |
| Feature matrix | [PRODUCT_FEATURES.md](PRODUCT_FEATURES.md) |
| Build & testing | [BUILD_AND_TESTING.md](BUILD_AND_TESTING.md) |
| Architecture detail | [ARCHITECTURE.md](ARCHITECTURE.md) |
| Design system | [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md) |
| Security | [SECURITY.md](SECURITY.md) |
| Legal & privacy | [LEGAL_PRIVACY.md](LEGAL_PRIVACY.md) |
