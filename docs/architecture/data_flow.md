# ChargeMesh — End-to-End Data Flow Specification

This document details the exact sequence of messages and state transitions across the platform.

---

## 1. Driver Authentication & Profile Hydration

```mermaid
sequenceDiagram
    autonumber
    actor Driver as EV Driver (Mobile App)
    participant Nest as NestJS API Gateway
    participant Redis as Redis Cache
    participant DB as PostgreSQL Database

    Driver->>Nest: POST /api/v1/auth/otp/send ({ phoneNumber })
    Nest->>Redis: Check Rate Limit (max 5/min)
    Nest->>Nest: Generate 6-digit CSPRNG OTP
    Nest->>Redis: SETEX otp:+91... (300s TTL)
    Nest-->>Driver: { success: true, message: "OTP Dispatched" }

    Driver->>Nest: POST /api/v1/auth/login ({ phoneNumber, otp })
    Nest->>Redis: Verify OTP & invalidate key
    Nest->>DB: SELECT * FROM users WHERE phoneNumber = :phoneNumber
    DB-->>Nest: User Entity
    Nest->>Nest: Generate HS256 JWT (exp: 15m)
    Nest-->>Driver: { token, user: { id, name, walletBalancePaise } }
```

---

## 2. Charging Session Initiation & OCPP RemoteStart

```mermaid
sequenceDiagram
    autonumber
    actor Driver as EV Driver (Mobile App)
    participant Nest as NestJS CSMS
    participant DB as PostgreSQL Database
    participant Charger as Physical EV Charger (OCPP)
    actor Admin as Admin Portal (Next.js)

    Driver->>Nest: POST /api/v1/sessions/start ({ stationId, connectorId, target })
    Nest->>DB: Check walletBalancePaise >= preAuthHold (₹200)
    Nest->>DB: INSERT INTO charging_sessions (status: 'REQUESTED')
    Nest->>Charger: RemoteStartTransaction.req (connectorId, idTag)
    Charger-->>Nest: RemoteStartTransaction.conf (status: 'Accepted')
    Nest->>DB: UPDATE charging_sessions SET status = 'CHARGING'
    Nest-->>Driver: { success: true, sessionId, status: 'CHARGING' }
    Admin->>Nest: GET /api/v1/admin/dashboard/sessions
    Nest-->>Admin: Returns active charging session row
```

---

## 3. Telemetry Ingestion & Financial Settlement

```mermaid
sequenceDiagram
    autonumber
    participant Charger as Physical EV Charger
    participant Nest as NestJS CSMS
    participant DB as PostgreSQL Database
    actor Driver as EV Driver

    loop Every 10 Seconds
        Charger->>Nest: MeterValues.req ({ transactionId, energyKwh, powerKw, currentSoC })
        Nest->>DB: INSERT INTO meter_values
        Nest->>Nest: Update accumulated cost
        Nest->>Driver: WS /telemetry Broadcast ({ energyKwh, powerKw, costSoFar })
    end

    Driver->>Nest: POST /api/v1/sessions/:id/stop
    Nest->>Charger: RemoteStopTransaction.req
    Charger->>Nest: StopTransaction.req (finalMeterKwh)
    Nest->>DB: Atomically debit wallet & record finance_ledger entry
    Nest->>DB: UPDATE charging_sessions SET status = 'COMPLETED'
    Nest-->>Driver: Final Session Invoice & Receipt
```
