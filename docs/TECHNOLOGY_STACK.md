# ChargeMesh — Technology Stack Specification

> **Status:** Authoritative Local Source of Truth  
> **Source Verification:** Discovered from workspace configurations, `package.json`, lockfiles, Dockerfiles, and compose definitions.

---

## 1. Core Monorepo & Language Environment

| Technology | Discovered Version | Purpose | Environment | Source |
| :--- | :--- | :--- | :--- | :--- |
| **Node.js** | `>=20.0.0` | Execution Runtime | Dev, Test, Prod | `package.json` (`engines`) |
| **npm** | `>=10.0.0` | Monorepo Package Manager & Workspaces | Dev, CI | `package.json` (`engines`) |
| **TypeScript** | `^5.5.0` | Strict Static Type Checking | Dev, Build, CI | `package.json`, `packages/tsconfig` |

---

## 2. Customer Mobile Application (`apps/mobile`)

| Technology | Discovered Version | Purpose | Environment | Source |
| :--- | :--- | :--- | :--- | :--- |
| **React Native** | `0.74.2` | Cross-Platform Driver App (iOS & Android) | Client App | `apps/mobile/package.json` |
| **React** | `18.2.0` | UI Component Framework | Client App | `apps/mobile/package.json` |
| **React Navigation** | `^6.1.17` | App Routing & Screen Transitions | Client App | `apps/mobile/package.json` |
| **React Navigation Bottom Tabs** | `^6.5.20` | Driver Primary Tab Navigation | Client App | `apps/mobile/package.json` |
| **React Navigation Native Stack** | `^6.9.26` | Native Stack Navigation Transitions | Client App | `apps/mobile/package.json` |
| **AsyncStorage** | `^1.23.1` | Local Driver Profile & Session Caching | Client App | `apps/mobile/package.json` |
| **Safe Area Context** | `^4.10.1` | Safe Area Screen Boundaries | Client App | `apps/mobile/package.json` |
| **Screens** | `^3.31.1` | Native Screen Optimization | Client App | `apps/mobile/package.json` |
| **Gesture Handler** | `^2.16.2` | Gesture & Touch Interactions | Client App | `apps/mobile/package.json` |
| **Babel** | `^7.24.0` | JavaScript/TypeScript Transpiler | Dev, Build | `apps/mobile/package.json` |
| **Custom Theme Tokens** | Internal | Unified Design System (`theme.ts`) | Client App | `apps/mobile/src/theme/` |

---

## 3. Backend Services & Protocols (`apps/backend`)

| Technology | Discovered Version | Purpose | Environment | Source |
| :--- | :--- | :--- | :--- | :--- |
| **NestJS / Node.js** | `20.x` | REST API, CSMS Gateway, Event Handling | Backend | Root & Backend configs |
| **OCPP 1.6-J & 2.0.1** | Standard Spec | Charge Point WebSocket Communication | CSMS Server | `.env.example`, `docs/` |
| **OCPI 2.3.0** | Standard Spec | CPO Interoperability & Roaming Hub | Backend | `docs/` |
| **JWT (JSON Web Tokens)** | `HMAC SHA-256 / RS256` | Stateless Authentication & Session Tokens | Auth Service | `.env.example` |
| **Razorpay SDK** | Test/Prod API | Payment Processing & Webhooks | Billing | `.env.example` |
| **Firebase Cloud Messaging** | Admin SDK | Push Alerts & Session Milestone Triggers | Notifications | `.env.example` |
| **AWS SNS / SES** | AWS SDK | SMS OTP & Transaction Invoicing | Notifications | `.env.example` |

---

## 4. Databases, Caching & Data Storage

| Technology | Discovered Version | Purpose | Environment | Source |
| :--- | :--- | :--- | :--- | :--- |
| **PostgreSQL** | `16` (`postgis/postgis:16-3.4-alpine`) | Relational Metadata & Transactions | Local Docker, Cloud | `docker-compose.yml` |
| **PostGIS Extension** | `3.4` | Spatial Coordinates & Geospatial Search | Local Docker, Cloud | `docker/postgres/init.sql` |
| **Redis** | `7` (`redis:7-alpine`) | Connector State Cache, Pub/Sub, Rates | Local Docker, Cloud | `docker-compose.yml` |
| **pgAdmin 4** | `latest` (`dpage/pgadmin4`) | Database Management UI (Dev Tools Profile)| Dev Tools | `docker-compose.yml` |
| **Redis Commander** | `latest` (`rediscommander/redis-commander`)| Redis UI Explorer (Dev Tools Profile) | Dev Tools | `docker-compose.yml` |

---

## 5. Web Admin Operations Portal (`apps/admin`)

| Technology | Discovered Version | Purpose | Environment | Source |
| :--- | :--- | :--- | :--- | :--- |
| **Next.js / React** | `18.x / 19.x` | Browser-based Operations & Monitoring Portal | Web Admin | Workspace scripts & CI |
| **TypeScript** | `^5.5.0` | Static Typing | Web Admin | `packages/tsconfig` |

---

## 6. Testing, Quality & CI/CD Tooling

| Technology | Discovered Version | Purpose | Environment | Source |
| :--- | :--- | :--- | :--- | :--- |
| **Jest** | `29.x` | Unit & Integration Test Runner | Dev, Local, CI | `apps/mobile/package.json` |
| **ESLint** | `8.x` | Static Linting & Code Quality Analysis | Dev, Local, CI | Monorepo configs |
| **Docker & Docker Compose**| `Compose 3.9 / Docker 24+` | Container Orchestration & Local Services | Dev, Staging | `docker-compose.yml` |
| **GitHub Actions** | `v4 Actions` | Automated CI Pipelines (Backend, Mobile, Admin)| CI (Local-First Mirror)| `.github/workflows/` |

---

## 7. Technology Management Policies

1. **Strict Source-of-Truth**: Dependency configuration files (`package.json`, `docker-compose.yml`) remain the definitive authoritative source.
2. **No Redundant Dependencies**: Prioritize native Node.js capabilities and existing workspace libraries before adding third-party packages.
3. **Local-First Verification**: Verify compatibility, security, and TypeScript definitions locally prior to adopting new packages.
