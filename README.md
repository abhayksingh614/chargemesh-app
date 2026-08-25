# ChargeMesh ⚡

> **One app. Multiple networks. Verified chargers. One charging experience.**

ChargeMesh is a unified EV charging interoperability platform for India. It aggregates participating Charge Point Operator (CPO) networks into a single cross‑platform mobile experience for drivers, backed by a web‑only admin portal for operations.

## Tagline
**Charge Green. Drive Smart.**

---

## Monorepo Structure
```
chargemesh-app/
├─ apps/
│  ├─ mobile/   # React Native – Android + iOS driver app (fully implemented)
│  ├─ admin/    # Next.js – admin portal (scaffolded, not yet functional)
│  └─ backend/  # NestJS – API & CPO integration hub (scaffolded, not yet connected to mobile)
├─ packages/
│  ├─ shared-types/      # TypeScript types used across packages
│  ├─ shared-constants/  # Business rule constants
│  └─ tsconfig/          # Shared TS config
├─ docs/                 # Canonical project documentation (18 files)
└─ .docs/                # Historical planning docs & archive
```

---

## Tech Stack
| Layer | Technology |
|-------|------------|
| Mobile | React Native (TypeScript) – Android + iOS |
| Admin Web | Next.js (React + TypeScript) |
| Backend API | NestJS (Node.js + TypeScript) |
| Database | PostgreSQL + PostGIS |
| Cache | Redis |
| Cloud | AWS |
| Maps | MapLibre |
| Payments | Razorpay (tokenized) |
| Push Notifications | Firebase (FCM / APNs) |
| CPO Protocol | OCPI 2.3.0 + proprietary adapters |

---

## Quick Start
### Prerequisites
- Node.js >= 20.x
- npm >= 10.x (or pnpm >= 9.x)
- React Native dev environment (Android Studio / Xcode)
- Docker (local PostgreSQL & Redis)
- AWS CLI configured (for production secrets)

### 1. Clone & Install
```bash
git clone https://github.com/abhayksingh614/chargemesh-app.git
cd chargemesh-app
npm install
```

### 2. Environment Setup
```bash
# Root env (shared variables)
cp .env.example .env
# App‑specific env files
cp apps/backend/.env.example    apps/backend/.env
cp apps/admin/.env.example      apps/admin/.env
cp apps/mobile/.env.example     apps/mobile/.env
```
> **Never commit `.env` files.** All secrets should be stored in AWS Secrets Manager for production.

### 3. Start Local Services
```bash
docker-compose up -d   # PostgreSQL + Redis
```

### 4. Run the Applications
```bash
# Backend API
npm run dev --workspace=apps/backend

# Admin portal
npm run dev --workspace=apps/admin

# Mobile (Metro bundler)
npm run start --workspace=apps/mobile
# Android
npm run android --workspace=apps/mobile
# iOS
npm run ios --workspace=apps/mobile
```

---

## Documentation & Guidelines
All canonical project specifications live under [`docs/`](docs/):
- `PROJECT_OVERVIEW.md` – Product vision & core architecture
- `SCREENS_AND_NAVIGATION.md` – Detailed screen catalog and navigation flow
- `PRODUCT_FEATURES.md` – Implemented vs planned feature matrix
- `BUILD_AND_TESTING.md` – Build, install, and device‑testing procedures
- `ARCHITECTURE.md` – Current local‑first architecture diagram
- `TECHNOLOGY_STACK.md` – Full stack with version numbers
- `DESIGN_SYSTEM.md` – UI tokens, dark/light mode, micro‑interactions
- `VEHICLE_DATABASE.md` – EV catalog data model
- `CPO_AND_STATIONS.md` – Station & CPO data model
- `SECURITY.md` – Security practices and dev‑only credentials handling
- `LEGAL_PRIVACY.md` – Legal & privacy notice for end‑users

> **NOTE:** Demo credentials (phone numbers and OTP `123456`) are included for development/testing only and must be removed or replaced before any production release.

---

## Key Features (as of v1.3.0)
- **22 fully‑implemented screens** covering onboarding, live charging telemetry, wallet ledger, garage, profile, and eco metrics.
- **Native QR Scanner** – Hardware-accelerated CameraX & Google ML Kit with real-time barcode decoding.
- **Native Fingerprint App Lock** – Hardware Keystore protection via Android `BiometricPrompt` on app launch and resume.
- **Dedicated Add Money & Wallet Ledger** – Full-screen multi-method payment flow (Card, UPI VPA, Net Banking) with persistent running ledger.
- **Unified Demo Environment** – Single synchronized prototype persona (`Abhay`) with mathematically reconciled sessions, wallet transactions, and favorites.
- **Bilingual UI** – English & Hindi with persistent language toggle.
- **Dynamic Light/Dark Mode** – Powered by `ThemeContext` and semantic design tokens.
- **MapLibre Integration** – Interactive map with state & district search (36 states, 700+ districts).
- **EV Catalog & Garage** – Multi-vehicle compatibility filtering and garage management.

---

## Contributing
Please see [.github/CONTRIBUTING.md](.github/CONTRIBUTING.md) for the contribution workflow, coding standards, and PR guidelines.

---

## License
**Private & Confidential — ChargeMesh © 2026**
