# ChargeMesh — System Architecture

## 1. High-Level Architectural Diagram

```text
+-------------------------------------------------------------+
|                  ChargeMesh Mobile Client                   |
|           (React Native / iOS / Android Driver App)         |
+------------------------------+------------------------------+
                               |
                   HTTPS / WSS | REST & Telemetry Stream
                               v
+-------------------------------------------------------------+
|                   ChargeMesh API Gateway                    |
+------------------------------+------------------------------+
                               |
        +----------------------+----------------------+
        |                                             |
        v                                             v
+-----------------------------+        +-----------------------------+
|     NestJS Core Backend     |        |   OCPP CSMS Gateway Server  |
|  - Auth & User Profiles     |        |   - OCPP 1.6-J / 2.0.1      |
|  - Station & Tariff Engine  |        |   - WebSocket Connection Hub|
|  - Billing & Transactions   |        |   - Remote Start/Stop RPC   |
+--------------+--------------+        +--------------+--------------+
               |                                      |
               +-------------------+------------------+
                                   |
                                   v
+-------------------------------------------------------------+
|                   Persistence & Cache Layer                 |
|  - PostgreSQL: Relational metadata (Users, Stations, Tariffs)|
|  - TimescaleDB: High-frequency telemetry time-series        |
|  - Redis: Real-time connector states, pub/sub, auth cache   |
+-------------------------------------------------------------+
```

## 2. Core Subsystems

### 2.1 Mobile Application (`apps/mobile`)
- Built with React Native and TypeScript.
- Uses React Navigation (Tab & Native Stack).
- Employs modular presentation components and unified theme design tokens.

### 2.2 Backend & OCPP CSMS (`apps/backend`)
- Built with NestJS microservice framework.
- Dedicated WebSocket gateway implementing the Open Charge Point Protocol (OCPP).
- Message dispatching via an asynchronous event bus.

### 2.3 Shared Modules (`packages/shared-types` & `packages/utils`)
- Shared TypeScript interfaces for station, connector, telemetry, transaction, and tariff models.
- Common math, formatting, and validation utilities shared across client, admin, and backend.
