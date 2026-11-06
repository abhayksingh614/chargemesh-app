# ChargeMesh — Technology Stack Specification

> **Version:** 1.0.0 (Production Verified)  
> **Source Evidence:** Verified directly from root `package.json`, `apps/*/package.json`, `build.gradle`, and `docker-compose.yml`.  
> **Repository:** [abhayksingh614/chargemesh-app](https://github.com/abhayksingh614/chargemesh-app)  

---

## 1. Monorepo Core & Runtime Environment

| Technology | Verified Version | Purpose | Code Verification Status |
| :--- | :--- | :--- | :--- |
| **Node.js** | `>= 20.0.0` (LTS) | JavaScript runtime engine | ✅ Implemented & Enforced in `package.json` |
| **npm** | `>= 10.0.0` | Package manager with native workspaces | ✅ Implemented & Active |
| **TypeScript** | `^5.5.0` | Strict static typing across all 5 workspaces | ✅ Implemented (100% Passing Typecheck) |
| **Docker Compose** | `3.9` | Container orchestration for local data services | ✅ Implemented & Active |

---

## 2. Mobile Application (`apps/mobile`)

| Technology | Verified Version | Layer / Purpose | Code Verification Status |
| :--- | :--- | :--- | :--- |
| **React Native** | `0.74.2` | Core cross-platform mobile framework | ✅ Implemented |
| **React** | `18.2.0` | Declarative UI component model | ✅ Implemented |
| **React Navigation** | `^6.1.17` | Navigation container & routing | ✅ Implemented |
| **Bottom Tabs Navigator** | `^6.5.20` | 5-tab main driver navigation | ✅ Implemented |
| **Native Stack Navigator** | `^6.9.26` | Native gesture-driven screen transitions | ✅ Implemented |
| **AsyncStorage** | `^1.23.1` | Local persistence for auth, favorites, and theme | ✅ Implemented |
| **MapLibre React Native** | `^10.1.6` | Vector map engine for station discovery | ✅ Implemented |
| **AndroidX CameraX** | API 34 Native | Hardware-accelerated camera video preview | ✅ Implemented |
| **Google ML Kit** | Native Android | High-speed Barcode / QR code scanning | ✅ Implemented |
| **AndroidX Biometric** | Native Android | Hardware TEE `BiometricPrompt` app lock | ✅ Implemented |
| **Safe Area Context** | `^4.10.1` | Edge-to-edge screen inset handling | ✅ Implemented |
| **Gesture Handler** | `2.16.2` | Fluid native touch and swipe gestures | ✅ Implemented |

---

## 3. Backend Gateway Service (`apps/backend`)

| Technology | Verified Version | Layer / Purpose | Code Verification Status |
| :--- | :--- | :--- | :--- |
| **NestJS** | `^10.3.0` | Enterprise TypeScript server framework | ✅ Implemented |
| **Express** | `^4.19.2` | Underlying HTTP application engine | ✅ Implemented |
| **ws (WebSocket)** | `^8.16.0` | High-throughput WebSocket server | ✅ Implemented |
| **Passport & Passport-JWT** | `^0.7.0` / `^4.0.1` | Authentication middleware & JWT verification | ✅ Implemented |
| **@nestjs/jwt** | `^10.2.0` | JWT token generation and validation | ✅ Implemented |
| **bcrypt** | `^5.1.1` | Cryptographic password hashing | ✅ Implemented |
| **class-validator** | `^0.14.1` | Declarative DTO runtime request validation | ✅ Implemented |
| **class-transformer** | `^0.5.1` | Request payload transformation and hydration | ✅ Implemented |
| **uuid** | `^9.0.1` | RFC 4122 UUID generator | ✅ Implemented |
| **RxJS** | `^7.8.1` | Reactive streams for telemetry pipeline | ✅ Implemented |
| **Jest** | `^29.7.0` | Automated unit testing harness (12 tests) | ✅ Implemented |

---

## 4. Admin Management Portal (`apps/admin`)

| Technology | Verified Version | Layer / Purpose | Code Verification Status |
| :--- | :--- | :--- | :--- |
| **Next.js** | `^14.2.0` | React framework with App Router & SSR | ✅ Implemented |
| **React & React DOM** | `^18.2.0` | Client presentation and component tree | ✅ Implemented |
| **MapLibre GL** | `^6.6.0` | WebGL-powered interactive station maps | ✅ Implemented |
| **Tailwind-free CSS** | CSS Variables | High-performance CSS token system | ✅ Implemented |

---

## 5. Infrastructure & Storage (`docker/`)

| Technology | Verified Version | Purpose | Code Verification Status |
| :--- | :--- | :--- | :--- |
| **PostgreSQL** | `16-3.4-alpine` | Primary relational persistent database | ✅ Configured in `docker-compose.yml` |
| **PostGIS Extension** | `3.4` | Geospatial spatial indexing & coordinates | ✅ Initialized in `docker/postgres/init.sql` |
| **Redis** | `7-alpine` | Ephemeral caching, session store, rate limits | ✅ Configured in `docker-compose.yml` |
| **Redis Commander** | Latest | Web GUI for Redis cache inspection | ✅ Configured under `tools` profile |
| **pgAdmin 4** | Latest | Web GUI for PostgreSQL administration | ✅ Configured under `tools` profile |

---

## 6. Protocols & Standards

| Standard | Version / Spec | Purpose | Status in Codebase |
| :--- | :--- | :--- | :--- |
| **OCPP-J** | 1.6-J and 2.0.1 | Direct Charge Point communication protocol | ✅ Implemented in `apps/backend/src/modules/ocpp` |
| **OCPI** | 2.2.1 / 2.3 | Roaming CPO-to-eMSP protocol | ⏳ Planned for Phase 3 |
| **JWT** | RFC 7519 | Stateless API authentication | ✅ Implemented |
| **SemVer** | 2.0.0 | Versioning standard for monorepo packages | ✅ Followed across manifests |
| **Conventional Commits** | 1.0.0 | Standardized Git commit message format | ✅ Documented in `.github/GIT_STRATEGY.md` |
