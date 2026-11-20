# Phase 00 — Architecture Review & System Decomposition

> **Audit Date:** November 20, 2026  
> **Repository:** [https://github.com/abhayksingh614/chargemesh-app](https://github.com/abhayksingh614/chargemesh-app)  
> **Architectural Standard:** Production Open-Source Architecture Evaluation  

---

## 1. Architectural Strengths Observed

1. **Clean Monorepo Workspace Boundaries:** The separation into `apps/` (`mobile`, `backend`, `admin`) and `packages/` (`shared-types`, `shared-constants`, `tsconfig`) provides clear boundaries.
2. **Canonical Domain Typing:** `@chargemesh/shared-types` enforces shared domain models across both client apps and the backend gateway, preventing model divergence.
3. **Robust Hardware Integration on Android:** The mobile app features production-grade native Android bridges for CameraX (instant QR decoding via ML Kit) and `BiometricPrompt` (TEE hardware Keystore app lock).
4. **OCPP 1.6-J & 2.0.1 Protocol Handlers:** The backend CSMS gateway (`apps/backend/src/modules/ocpp`) cleanly implements JSON-RPC frame parsers and message handlers for all critical charging states (`BootNotification`, `Authorize`, `StartTransaction`, `MeterValues`, `StopTransaction`).
5. **Declarative NestJS Validation:** Backend controllers use `ValidationPipe` with `class-validator` and `class-transformer` DTOs, rejecting invalid payloads at the ingress layer.

---

## 2. Architectural Flaws & Antipatterns

### 2.1 Backend Antipatterns (`apps/backend`)
1. **Volatile In-Memory Repository Antipattern:** All NestJS domain services (`AuthService`, `StationsService`, `SessionsService`, `AdminCpoService`, etc.) instantiate in-memory collections (`Map<string, T>` or `Array<T>`) as their source of truth.
   - *Architectural Impact:* No transactional integrity, no ACID compliance, no durability across pod restarts, and inability to horizontally scale beyond a single node.
2. **Absence of Repository Abstraction Layer:** Services interact directly with in-memory maps instead of through a clean repository interface (`IUserRepository`, `IStationRepository`), which will require refactoring when introducing an ORM.
3. **Hardcoded Administrative Credentials:** In `apps/backend/src/modules/admin/admin-auth.service.ts`, plaintext passwords (`admin123`, `ops123`, `finance123`) are hardcoded into the service constructor.
4. **WebSocket Heartbeat Drift:** The OCPP gateway tracks connections in memory without Redis pub/sub, preventing distributed WebSocket cluster deployment.

### 2.2 Mobile Antipatterns (`apps/mobile`)
1. **Direct Data File Coupling:** Mobile screens and contexts directly import static JSON and TypeScript mock files (`import { mockStations } from '../services/mockData'`) instead of communicating through an abstracted API service layer.
2. **Simulated State Timer Antipattern:** `LiveChargingScreen` and `ChargingContext` generate artificial charging telemetry via `setInterval` increments rather than subscribing to the real `/telemetry` WebSocket gateway.
3. **Unprotected Root Navigation Reset:** Mobile navigation relies on local state flags without deep link guards or centralized authentication session expiration interceptors.

### 2.3 Admin Antipatterns (`apps/admin`)
1. **Dual React Instance Conflict:** Next.js 14 App Router resolves `react@18.3.1` while npm monorepo hoists `react@18.2.0`, causing context collisions with `styled-jsx` during static HTML pre-rendering.
2. **Purely Mock Data Service:** `dataService.ts` contains duplicate copies of station, CPO, and session records that have no linkage to the backend Admin API.
3. **Lack of Server Components Utilization:** Almost all dashboard views are declared with `'use client'`, forfeiting Next.js App Router server-side streaming and data fetching advantages.

### 2.4 Shared Packages Antipatterns (`packages/*`)
1. **Compiled Dist Synchronization Dependency:** Packages configure `"main": "dist/index.js"` and `"types": "dist/index.d.ts"`. In developer environments where `dist/` is cleaned, TypeScript resolution fails unless `npm run build` is explicitly executed beforehand.

---

## 3. Layered Architecture Evaluation Matrix

```
┌─────────────────────────┬──────────────────────┬──────────────────────┬─────────────┐
│ Layer                   │ Current Paradigm     │ Target Architecture  │ Debt Level  │
├─────────────────────────┼──────────────────────┼──────────────────────┼─────────────┤
│ Mobile Presentation     │ React Native Screens │ Design Token Driven  │ LOW         │
│ Mobile Data Access      │ Direct Mock Imports  │ Axios/Fetch Client   │ HIGH        │
│ Mobile Telemetry        │ Local setInterval    │ WSS Telemetry Stream │ HIGH        │
│ Admin Presentation      │ Client Components    │ Next.js App Router   │ MEDIUM      │
│ Admin Data Access       │ Local Data Service   │ Backend REST Client  │ HIGH        │
│ Backend Ingress         │ REST + WebSockets    │ REST + WSS Gateways  │ LOW         │
│ Backend Service Logic   │ Domain Services      │ Domain Services      │ LOW         │
│ Backend Persistence     │ In-Memory JS Maps    │ PostgreSQL + PostGIS │ CRITICAL    │
│ Cache & Ephemeral State │ None                 │ Redis 7 Sentinel/Cl  │ HIGH        │
│ Security & Secrets      │ .env Templates       │ AWS Secrets / Vault  │ MEDIUM      │
└─────────────────────────┴──────────────────────┴──────────────────────┴─────────────┘
```
