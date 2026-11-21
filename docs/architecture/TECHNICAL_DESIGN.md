# ChargeMesh — Technical Design Specification

This document provides deep technical design details regarding security enforcement, financial accounting, and protocol state machines.

---

## 1. Fail-Closed OCPP State Machine

Physical charging stations communicate with the CSMS via WebSockets using OCPP 1.6-J JSON framing:

- **Station Handshake:** Connection URL format: `ws://<host>:3000/ocpp/<chargePointId>`.
- **Authentication & Validation:** 
  1. The charger's identity (`chargePointId`) is checked against `ChargingStationEntity` in PostgreSQL.
  2. If the station record does not exist or credentials fail, the connection is terminated immediately (`4001 Unauthorized`).
  3. Authorize requests (`Authorize.req`) query valid driver RFID/virtual idTags. If PostgreSQL or Redis is unreachable, the system executes **fail-closed security (`status: 'Blocked'`)**, preventing unauthorized energy theft.
- **Heartbeat & Latency Tracking:** Inbound `Heartbeat.req` frames update the station's `lastHeartbeat` timestamp, categorizing connectivity into Live (<120s), Recent (120-300s), or Stale (>300s).

---

## 2. Double-Entry Financial Ledger Engine

The platform operates under strict financial accounting standards:

- **Atomic Transactions:** All wallet debits, pre-authorization holds, and Razorpay credits execute inside database transactions (`dataSource.transaction()`).
- **Paise Precision:** All currency arithmetic inside the database and business logic is performed in whole integer Paise (1 INR = 100 Paise) to completely eliminate floating-point rounding errors.
- **Audit Traceability:** Every balance mutation creates an immutable record in `finance_ledger` containing `balanceBeforeRupees`, `amountRupees`, `isCredit`, and `balanceAfterRupees`.
- **Discrepancy Rejection:** Top-up payment verification validates that the Razorpay webhook amount matches the database order amount before crediting funds.

---

## 3. Distributed Rate Limiting & DoS Protection

- **Storage:** Managed through Redis via `ioredis` with an in-memory fallback buffer during local development.
- **Tiers:**
  - Public authentication endpoints (`/auth/otp/send`, `/auth/login`): 5 requests / minute
  - Session control commands (`/sessions/start`, `/sessions/:id/stop`): 10 requests / minute
  - Discovery queries (`/stations`): 30 requests / minute
- **HTTP Response:** Returns `429 Too Many Requests` with standard `Retry-After` headers.
