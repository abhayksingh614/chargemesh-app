# ChargeMesh ⚡

> **One app. Multiple networks. Verified chargers. One charging experience.**

ChargeMesh is a unified EV charging interoperability platform for India. It aggregates participating Charge Point Operator (CPO) networks into a single cross-platform mobile experience for drivers, backed by a web-only admin portal for operations.

**Tagline:** Charge Green. Drive Smart.

---

## Monorepo Structure

```
chargemesh-app/
├── apps/
│   ├── mobile/          # React Native — Android + iOS customer app
│   ├── admin/           # Next.js — Web-only admin portal
│   └── backend/         # NestJS — Core API + CPO Integration Hub
├── packages/
│   ├── shared-types/    # Shared TypeScript types (API contracts, models)
│   ├── shared-constants/# Shared constants (status enums, connector types)
│   └── tsconfig/        # Shared TypeScript config base
├── .docs/               # Project documentation (source + generated)
├── .github/             # CI/CD workflows and issue templates
└── src/
    └── logo/            # Brand assets
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Mobile | React Native (TypeScript) — Android + iOS |
| Admin Web | Next.js (React + TypeScript) |
| Backend API | NestJS (Node.js + TypeScript) |
| Database | PostgreSQL + PostGIS |
| Cache | Redis |
| Cloud | AWS |
| Maps | MapLibre |
| Payments | Razorpay |
| Push Notifications | Firebase (FCM for Android + APNs for iOS) |
| CPO Protocol | OCPI 2.3.0 + Proprietary Adapters |

---

## Quick Start

### Prerequisites

- Node.js >= 20.x
- npm >= 10.x (or pnpm >= 9.x)
- React Native environment (Android Studio / Xcode)
- Docker (for local PostgreSQL + Redis)
- AWS CLI configured

### 1. Clone & Install

```bash
git clone https://github.com/abhayksingh614/chargemesh-app.git
cd chargemesh-app
npm install
```

### 2. Environment Setup

```bash
# Copy root env template
cp .env.example .env

# Copy app-specific env templates
cp apps/backend/.env.example    apps/backend/.env
cp apps/admin/.env.example      apps/admin/.env
cp apps/mobile/.env.example     apps/mobile/.env
```

Fill in the required values — see [Environment Variables](#environment-variables) below.

### 3. Start Local Services (Docker)

```bash
docker-compose up -d
```

This starts:
- PostgreSQL (port 5432)
- Redis (port 6379)

### 4. Run Apps

```bash
# Backend API
npm run dev --workspace=apps/backend

# Admin Portal
npm run dev --workspace=apps/admin

# Mobile (Metro bundler)
npm run start --workspace=apps/mobile

# Mobile — Android
npm run android --workspace=apps/mobile

# Mobile — iOS
npm run ios --workspace=apps/mobile
```

---

## Environment Variables

See:
- [`.env.example`](.env.example) — root shared variables
- [`apps/backend/.env.example`](apps/backend/.env.example) — backend-specific
- [`apps/admin/.env.example`](apps/admin/.env.example) — admin-specific
- [`apps/mobile/.env.example`](apps/mobile/.env.example) — mobile-specific

> ⚠️ **Never commit `.env` files. All secrets must go through AWS Secrets Manager in production.**

---

## Documentation & Guidelines

All canonical project specifications and architectural documentation live in [`docs/`](docs/) and [`.docs/`](.docs/):

| Document | Description |
|----------|-------------|
| [Technology Stack](docs/TECHNOLOGY_STACK.md) | Authoritative stack specification & version matrix |
| [Development Rules](DEVELOPMENT_RULES.md) | Local-first development rules & git workflow gates |
| [Design System](DESIGN_SYSTEM.md) | ChargeMesh UI/UX Design System, tokens, modal architecture & design guidelines |
| [Project Overview](docs/PROJECT_OVERVIEW.md) | Product vision, value proposition & core architecture |
| [Requirements](docs/REQUIREMENTS.md) | Functional & non-functional requirements specification |
| [System Architecture](docs/ARCHITECTURE.md) | Subsystem architecture & data flow diagrams |
| [Application Workflows](docs/WORKFLOW.md) | Driver journey & OCPP sequence diagrams |
| [API Documentation](docs/API_DOCUMENTATION.md) | REST & WebSocket telemetry API specs |
| [Database Schema](docs/DATABASE_SCHEMA.md) | Relational & time-series data models |
| [Deployment Guide](docs/DEPLOYMENT.md) | Local container setup & service port matrix |
| [Deep Project Specs](.docs/ChargeMesh_Project_Documentation.md) | Extended product requirements & business model |

---

## Key Features & Recent Updates

| Feature / Update | Description |
|---|---|
| ☀️ **Dynamic Time-Based Greeting** | Homepage dynamically greets the driver based on local device time: *Good Morning* (5 AM – 12 PM), *Good Afternoon* (12 PM – 5 PM), or *Good Evening* (5 PM – 5 AM). |
| 🗺️ **State & District Search Engine** | Comprehensive master dataset of **36 Indian States & Union Territories** and **700+ verified districts** integrated into interactive Map bottom sheets with instant search & filter. |
| 🎁 **₹100 Joining Bonus** | New driver registrations automatically receive an initial **₹100 joining bonus** credited to their in-app charging wallet. |
| 📱 **Portrait-Only Lock** | Android screen orientation locked strictly to vertical portrait mode for consistent layout rendering and zero distortion. |
| 🔐 **Clean Background Authentication** | Streamlined production login & registration screens. Demo driver profiles (*Rahul Sharma* `9412602135` & *Abhay Kumar Singh* `6399414330`, OTP `123456`) operate in the background layer without cluttering the UI. |
| 🧼 **Streamlined Dashboard** | Removed redundant "Offers for You" carousel from the homepage for a focused EV telemetry and station discovery experience. |
| 🎨 **Standardized UI Spacing System** | Global tokenized design system (`spacing.*`, `borderRadius.*`, `CM_COLORS.*`) with dynamic safe-area insets across modals, sticky bottom bars, and cards. |
| 🏗️ **Monorepo Workspaces** | Complete npm workspace support for `@chargemesh/mobile`, `@chargemesh/backend`, `@chargemesh/admin`, `@chargemesh/shared-types`, `@chargemesh/shared-constants`, and `@chargemesh/tsconfig`. |

---

## Key Product Rules

1. **UNKNOWN ≠ AVAILABLE** — Unknown/Stale charger status must never show as Available
2. **Connector-first** — Always show connector-level status, not just station-level
3. **Mobile never talks to CPO APIs directly** — All CPO traffic goes through the backend Integration Hub
4. **No raw payment credentials in mobile** — Razorpay tokenization only
5. **Every session needs reconciliation** — Session → CDR → Payment must all match

---

## Contributing

See [CONTRIBUTING.md](.github/CONTRIBUTING.md)

---

## License

Private & Confidential — ChargeMesh © 2026
