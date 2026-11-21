# ChargeMesh — System Architecture Specification

The ChargeMesh platform connects EV drivers, charging hardware, charge point operators (CPOs), and platform operators through a high-throughput, horizontally scalable monorepo architecture.

---

## 1. High-Level Monorepo Architecture

```
┌────────────────────────────────────────────────────────────────────────┐
│                        CLIENT PRESENTATION TIER                        │
│                                                                        │
│   ┌──────────────────────────────────┐┌────────────────────────────┐   │
│   │   Driver Mobile App (apps/mobile)││Admin Portal (apps/admin)   │   │
│   │   • React Native 0.74 (Android/iOS││• Next.js 14 App Router     │   │
│   │   • Native CameraX QR Scanner    ││• React 18 / TypeScript 5.5 │   │
│   │   • MapLibre GL Native Vectors   ││• MapLibre GL JS Visualizer │   │
│   │   • BiometricPrompt Native Lock  ││• Real-Time Operations Table│   │
│   └─────────────────┬────────────────┘└─────────────┬──────────────┘   │
└─────────────────────┼───────────────────────────────┼──────────────────┘
                      │ HTTPS (REST API)              │ HTTPS (REST API)
                      ▼                               ▼
┌────────────────────────────────────────────────────────────────────────┐
│               CENTRAL CSMS & TRANSACTION ENGINE (apps/backend)          │
│                                                                        │
│   ┌───────────────────────────┐         ┌──────────────────────────┐   │
│   │ REST API Gateway (/api/v1)│         │ WebSocket Gateways       │   │
│   │ • Stateless JWT Passport  │         │ • /ocpp/:chargePointId   │   │
│   │ • Redis Tiered Throttling │         │ • /telemetry (Driver)    │   │
│   └─────────────┬─────────────┘         └────────────┬─────────────┘   │
│                 │                                    │                 │
│                 ▼                                    ▼                 │
│   ┌────────────────────────────────────────────────────────────┐       │
│   │ Core Domain Modules (NestJS 10.3)                          │       │
│   │ • Auth & Driver Identity (CSPRNG, bcrypt-12)               │       │
│   │ • Station Discovery & PostGIS Spatial Filters              │       │
│   │ • OCPP 1.6-J / 2.0.1 Protocol Engine (Fail-Closed)         │       │
│   │ • Prepaid Wallet & Double-Entry Ledger (Atomic Tx)         │       │
│   │ • Administrative Audit Logger (Immutable Append-Only)      │       │
│   └─────────────────────────────┬──────────────────────────────┘       │
└─────────────────────────────────┼──────────────────────────────────────┘
                                  │
                                  ▼
┌────────────────────────────────────────────────────────────────────────┐
│                       STATE & PERSISTENCE TIER                         │
│                                                                        │
│   ┌────────────────────────────────────┐┌──────────────────────────┐   │
│   │ PostgreSQL 16 + PostGIS            ││ Redis 7 Distributed Cache│   │
│   │ • 9 Relational TypeORM Entities    ││ • Rate Limiter Tokens    │   │
│   │ • Spatial Geo-Index for Stations   ││ • Active Charger Sockets │   │
│   │ • Double-Entry Financial Ledger    ││ • Short-Lived OTP Store  │   │
│   └────────────────────────────────────┘└──────────────────────────┘   │
└────────────────────────────────────────────────────────────────────────┘
                                  ▲
                                  │ OCPP 1.6-J / 2.0.1 (JSON-WS)
┌─────────────────────────────────┴──────────────────────────────────────┐
│                    PHYSICAL EV CHARGING INFRASTRUCTURE                 │
│                                                                        │
│   • OCPP 1.6-J DC Fast Chargers (CCS2 60kW - 240kW)                    │
│   • AC Commercial Chargers (Type 2 7.4kW - 22kW)                       │
│   • Multi-Tenant CPO Networks (Tata Power, Jio-bp, Zeon, Statiq)       │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Workspace Layout

The repository is structured as an npm monorepo with 5 tightly coupled workspaces:

- [`apps/backend`](file:///c:/Users/aksde/Videos/My_Codex/Chargemesh_app/apps/backend): NestJS 10 service hosting REST endpoints, OCPP 1.6-J / 2.0.1 CSMS server, and telemetry pipelines.
- [`apps/admin`](file:///c:/Users/aksde/Videos/My_Codex/Chargemesh_app/apps/admin): Next.js 14 operational portal providing nationwide CPO management, tariff overrides, and ledger audits.
- [`apps/mobile`](file:///c:/Users/aksde/Videos/My_Codex/Chargemesh_app/apps/mobile): React Native cross-platform application for EV drivers targeting Android and iOS.
- [`packages/shared-types`](file:///c:/Users/aksde/Videos/My_Codex/Chargemesh_app/packages/shared-types): Strict TypeScript interfaces shared between frontend, backend, and admin layers.
- [`packages/shared-constants`](file:///c:/Users/aksde/Videos/My_Codex/Chargemesh_app/packages/shared-constants): Canonical business constants, tariff limits, and status states.
