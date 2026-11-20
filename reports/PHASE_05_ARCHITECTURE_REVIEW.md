# CHARGEMESH — PHASE 05 ARCHITECTURAL REVIEW & REMEDIATION BLUEPRINT
**Version:** 1.0  
**Date:** 2026-11-20  
**Execution Authority:** Principal Software Architect, Staff Systems Engineer  
**Repository:** `https://github.com/abhayksingh614/chargemesh-app`  

---

## 1. Systemic Architecture Analysis

The ChargeMesh platform consists of three core applications and shared libraries:
1. `apps/backend`: NestJS CSMS Gateway, HTTP REST API (`/api/v1`), WebSocket Gateways (`/ocpp`, `/telemetry`), PostgreSQL 16 + PostGIS, and Redis 7.
2. `apps/admin`: Next.js 14 Operations Dashboard (App Router + Pages).
3. `apps/mobile`: React Native 0.74 Driver Application.
4. `packages/shared-types`, `shared-constants`: Monorepo TypeScript interfaces and design tokens.

### Target State Architecture
```
  [Mobile Driver App]           [Admin Operations Portal]          [OCPP EV Chargers]
          │                                  │                              │
          │ HTTPS (REST)                     │ HTTPS (REST)                 │ WSS (OCPP 1.6-J)
          ▼                                  ▼                              ▼
  ┌─────────────────────────────────────────────────────────────────────────────────┐
  │                           NestJS CSMS Gateway (Port 3000)                       │
  │                                                                                 │
  │  [Security Layer] Helmet, CORS Allowlist, RateLimiter (Redis), RolesGuard (RBAC)│
  │  [Auth Module] JWT + Refresh Token Rotation, Distributed Redis OTP (Atomic INCR)│
  │  [Wallet & Finance] Razorpay Gateway, Pre-Auth Reservation, Atomic Settlement   │
  │  [OCPP Engine] Authenticated WS, RFID Validation, DB Transaction Mapping        │
  │  [Stations Module] PostGIS GiST Spatial Acceleration (ST_DWithin, ST_Distance)  │
  └────────────────────────┬────────────────────────────────┬───────────────────────┘
                           │                                │
                           ▼                                ▼
            [PostgreSQL 16.3 + PostGIS]                 [Redis 7 Alpine]
            - Users (walletBalancePaise, heldPaise)     - Rate limiting buckets
            - Charging Sessions (Persisted status)      - Distributed OTP keys
            - Finance Ledger (numeric(12,2))            - Token revocation blacklist
            - Spatial Stations (GiST indexed)           - OCPP active session cache
```

---

## 2. Core Remediation Design Principles

1. **Authoritative Single Source of Financial Truth:**
   The backend database (`users.walletBalancePaise`, `users.walletHeldPaise`, and `finance_ledger`) is the sole authoritative state of wallet funds. Neither mobile nor admin applications may synthesize or alter balances locally.
2. **Atomic Pre-Authorization & Settlement Lifecycle:**
   - Pre-Auth at session start: Atomically verify `available = walletBalancePaise - walletHeldPaise >= 20000` (₹200.00). Increment `walletHeldPaise += 20000`.
   - Settlement at session stop: Inside a single TypeORM transaction with `pessimistic_write` lock:
     - Compute actual energy cost in Paise (`costPaise = Math.round(costRupees * 100)`).
     - Release hold: `walletHeldPaise -= 20000`.
     - Debit balance: `walletBalancePaise -= costPaise`.
     - Insert `WALLET_DEBIT` ledger record with unique reference.
3. **Fail-Closed Hardware & Simulation Security:**
   - In production (`NODE_ENV === 'production'`), offline or unrecognized chargers are rejected immediately. Simulated sessions are strictly prohibited in production.
   - Every charger connecting to `/ocpp` must present valid HTTP Basic Auth credentials registered in `charging_stations`.
   - Every RFID tag must match an active `UserEntity` with sufficient balance.
4. **End-to-End API Integration:**
   - Both client frontends will be equipped with API client configurations connecting to backend endpoints, eliminating detached mock execution.
