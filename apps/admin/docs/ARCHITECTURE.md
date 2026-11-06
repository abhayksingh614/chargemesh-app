# ChargeMesh Admin Dashboard — System Architecture

> **Application:** `@chargemesh/admin` | **Framework:** Next.js 14 (App Router) | **Target:** Operations & CPO Portal

---

## 1. High-Level System Architecture

The ChargeMesh Admin Dashboard is a desktop-first enterprise web portal designed for system operators, CPO partner managers, customer support agents, and finance controllers.

```
┌──────────────────────────────────────────────────────────────────────────────────────────┐
│                                ADMIN WEB CLIENT (Next.js 14)                             │
│                                                                                          │
│  ┌─────────────────────────┐  ┌──────────────────────────┐  ┌─────────────────────────┐  │
│  │   App Router (/admin)   │  │    TanStack React Query  │  │   Zustand (UI/Auth)     │  │
│  │   Pages, Layouts, Forms │  │    Server-state Caching  │  │   Theme & Filter State  │  │
│  └────────────┬────────────┘  └────────────┬─────────────┘  └────────────┬────────────┘  │
│               │                            │                             │               │
│  ┌────────────▼────────────────────────────▼─────────────────────────────▼────────────┐  │
│  │            Design System & Component Kit (Tailwind CSS + Dark/Light Theme)         │  │
│  │            • KPI Metric Cards    • Live Telemetry Charts    • MapLibre Station Map │  │
│  │            • DataTables + Filters • Ledger Trace Viewer     • Modal Workflows      │  │
│  └─────────────────────────────────────────┬──────────────────────────────────────────┘  │
└────────────────────────────────────────────┼─────────────────────────────────────────────┘
                                             │
                                             │ HTTPS REST (JSON) + WebSocket (WSS)
                                             ▼
┌──────────────────────────────────────────────────────────────────────────────────────────┐
│                                CHARGEMESH BACKEND (NestJS)                               │
│                                                                                          │
│  ┌────────────────────────────────────────────────────────────────────────────────────┐  │
│  │  Admin API Gateway (Port 3000)                                                     │  │
│  │  ├── AdminJwtAuthGuard & RolesGuard (RBAC Enforcement)                             │  │
│  │  ├── AdminAuditLogInterceptor (Records actor, target, timestamp, and diff payload) │  │
│  │  └── Admin Controllers: Auth, Users, Stations, CPOs, Sessions, Finance, Audit      │  │
│  └────────────────────────────────────────┬───────────────────────────────────────────┘  │
└───────────────────────────────────────────┼──────────────────────────────────────────────┘
                                            │
                      ┌─────────────────────┴─────────────────────┐
                      ▼                                           ▼
┌───────────────────────────────────────────────┐ ┌────────────────────────────────────────┐
│               PERSISTENCE LAYER               │ │            REAL-TIME ENGINES           │
│                                               │ │                                        │
│  • PostgreSQL 16: Users, CPOs, Stations,      │ │  • OCPP 1.6-J / 2.0.1 Gateway Server   │
│    Bookings, Tariffs, Audit Logs              │ │    (ws://localhost:3000/ocpp/:id)      │
│  • TimescaleDB: Telemetry time-series metrics │ │  • Live Telemetry Stream Gateway       │
│  • Redis: Real-time session & charger status  │ │    (ws://localhost:3000/telemetry)     │
└───────────────────────────────────────────────┘ └────────────────────────────────────────┘
```

---

## 2. Monorepo Integration & Shared Dependencies

The Admin Portal integrates seamlessly with the monorepo architecture:

- **`@chargemesh/shared-types`**: Canonical source of truth for all data contracts (`UserProfile`, `Vehicle`, `Cpo`, `Location`, `Connector`, `ChargingSession`, `WalletTransaction`, `ApiResponse`, `PaginatedResponse`).
- **`@chargemesh/shared-constants`**: Business constants and thresholds (`STATUS_STALE_THRESHOLD_SECONDS = 300`, `UNKNOWN_IS_NOT_AVAILABLE = true`, `DEFAULT_CURRENCY = 'INR'`, `ERROR_CODES`).
- **`@chargemesh/tsconfig`**: Strict unified TypeScript configurations across workspaces.

---

## 3. Real-Time Telemetry & OCPP Bridge

The Admin Dashboard provides real-time visibility into the EV charging network:

```
[Hardware EVSE Charger] ──(OCPP 1.6-J JSON over WSS)──► [NestJS OcppGateway]
                                                                │
                                                                ▼
                                                    [TelemetryService]
                                                                │
                                                                ▼
[Admin Dashboard: Live Session Inspector] ◄──(WSS Telemetry)───┘
```

1. **MeterValues Ingestion**: Instant updates of `SoC (%)`, `Power (kW)`, `Energy (kWh)`, `Voltage (V)`, `Current (A)`.
2. **Connector Status Notifications**: Real-time transitions between `AVAILABLE`, `IN_USE`, `UNAVAILABLE`, `FAULTED`, and `OFFLINE`.
3. **Stale Data Guard**: If status updates are not received within 300 seconds, the frontend automatically marks the charger as `STALE` with amber visual indicators.
