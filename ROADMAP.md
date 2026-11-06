# ChargeMesh — Strategic Development Roadmap

> **Status Standard:** Verified against codebase reality. Unfinished features are explicitly marked as **Planned** or **In Progress**. No unverified partnerships or fictional delivery dates are claimed.  
> **Repository:** [abhayksingh614/chargemesh-app](https://github.com/abhayksingh614/chargemesh-app)  

---

## Roadmap Overview

```
Phase 1: Foundation ────────► Phase 2: Core Platform ────────► Phase 3: EV Interoperability
(Code Quality & Security)     (Mobile & Backend REST)          (OCPP CSMS & OCPI Roaming)
                                         │
                                         ▼
Phase 5: Open-Source Ecosystem ◄── Phase 4: Platform Expansion
(Community & Ecosystem Growth)    (Payments & Advanced Analytics)
```

---

## Phase 1: Foundation & Architecture Hardening

Focus: Monorepo stability, type safety, security posture, and testing infrastructure.

- [x] **Monorepo Architecture:** npm workspaces with `@chargemesh/shared-types`, `@chargemesh/shared-constants`, and `@chargemesh/tsconfig`.
- [x] **Strict TypeScript Typechecking:** 100% typecheck passing across all 5 monorepo workspaces.
- [x] **Backend Unit Testing:** Automated Jest unit test suite covering sessions, stations, auth, and OCPP protocol logic.
- [x] **Security Posture & Credential Sanitization:** Elimination of hardcoded secrets; full template coverage in `.env.example`.
- [x] **Android Build Hardening:** Dynamic release signing fallback and ProGuard/R8 rules protecting CameraX and Biometrics.
- [x] **Open-Source Documentation:** Architecture diagrams, threat model, contributor guidelines, and code of conduct.
- [ ] **Automated Linting Pipeline:** Standardize root ESLint configuration across React Native, Next.js, and NestJS. *(In Progress)*
- [ ] **CI Secret Scanning:** Add automated `gitleaks` step to GitHub Actions. *(Planned)*

---

## Phase 2: Core Platform & Integration

Focus: Connecting mobile client interfaces to live backend services and expanding driver workflows.

- [x] **Mobile UI Implementation:** 22 complete screens with light/dark theme design system and bilingual i18n (English/Hindi).
- [x] **Hardware CameraX QR Scanner:** Native Android barcode capture and ML Kit decoding bridge.
- [x] **Hardware Biometric App Lock:** AndroidX `BiometricPrompt` with TEE Keystore protection.
- [x] **Local Geo-Master Database:** 36 Indian states and 700+ districts catalog for geo-fencing and station lookup.
- [ ] **Mobile-to-Backend REST Wiring:** Transition driver app from local mock mode to dynamic NestJS HTTP client with offline fallback. *(In Progress)*
- [ ] **SMS OTP Gateway Provider:** Integration with AWS SNS / Msg91 for automated one-time password delivery. *(Planned)*
- [ ] **PostgreSQL Persistent Entities:** Replace in-memory backend maps with TypeORM / Prisma database migration pipeline. *(Planned)*
- [ ] **Redis Live Session State:** Ephemeral connector status and rate limiting in Redis. *(Planned)*

---

## Phase 3: EV Interoperability & CPO Protocols

Focus: Standardized protocols, hardware charge point communication, and roaming networks.

- [x] **OCPP 1.6-J & 2.0.1 WebSocket CSMS Gateway:** Central System server in NestJS handling BootNotification, Heartbeats, StatusNotification, Authorize, and Transaction lifecycle.
- [x] **Real-Time Telemetry Gateway:** WebSocket broadcast service streaming live power (kW), SoC (%), voltage, and current to clients.
- [x] **Status Freshness Rules:** Enforcement of freshness thresholds (<120s Live, 120-300s Recent, >300s Stale warning; Unknown ≠ Available).
- [ ] **OCPI 2.2.1 / 2.3 Roaming Modules:** Implement Locations, Tariffs, Sessions, and CDRs modules for bilateral CPO aggregation. *(Planned)*
- [ ] **Automated Tariff Synchronization:** Scheduled cron engine to synchronize dynamic peak/off-peak pricing tariffs from CPO endpoints. *(Planned)*
- [ ] **Hardware Protocol Conformance Testing:** Automated OCPP compliance suite against simulated EVSE hardware. *(Planned)*

---

## Phase 4: Platform Expansion & Operations

Focus: Financial reconciliation, multi-tenant operations, and fleet management.

- [x] **Operations Portal Interface:** Next.js 14 App Router portal with 14 administrative views, KPI cards, and MapLibre GL map.
- [x] **Role-Based Access Control (RBAC):** Backend guards and frontend context for Super Admin, Operations, Finance, and Support.
- [x] **Running Financial Ledger Models:** 18% GST tax calculation and double-entry transaction record types.
- [ ] **Live Payment Gateway Tokenization:** Full Razorpay UPI Intent / Card checkout integration. *(Planned)*
- [ ] **Automated CPO Payout Reconciliation:** Split payments and revenue share calculation engine. *(Planned)*
- [ ] **Driver Route Planning:** Route charger recommendation based on EV battery capacity and consumption curves. *(Planned)*

---

## Phase 5: Open-Source Community Ecosystem

Focus: External developer onboarding, modular plugin architecture, and public APIs.

- [x] **GitHub Community Health:** Comprehensive Issue Templates, PR Template, Dependabot, and Git branching strategy.
- [x] **Contributor Documentation:** Step-by-step setup, coding conventions, and architectural diagrams.
- [ ] **Community EV Catalog Submissions:** Open JSON schema allowing automotive enthusiasts to submit new EV models and charging curves. *(Planned)*
- [ ] **Custom CPO Protocol Plugin SDK:** Extensible adapter interface for regional Indian CPOs lacking native OCPP/OCPI compliance. *(Planned)*
- [ ] **Public Sandbox API & Mock EVSE:** Hosted staging environment for testing driver apps and admin widgets. *(Planned)*
