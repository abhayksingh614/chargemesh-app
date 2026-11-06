# ChargeMesh Admin Dashboard — Phased Implementation Roadmap

This roadmap breaks down the development of the **ChargeMesh Admin Dashboard** into 11 distinct, testable phases following the local-first engineering standard.

---

## 📅 Phased Execution Plan

```mermaid
gantt
    title ChargeMesh Admin Dashboard Execution Timeline
    dateFormat  YYYY-MM-DD
    section Core Infrastructure
    Phase 1 : Contracts & Types       :p1, 2026-09-01, 2d
    Phase 2 : Admin Auth & RBAC       :p2, after p1, 3d
    Phase 3 : Next.js App Shell Layout:p3, after p2, 3d
    section Operational Modules
    Phase 4 : Executive Dashboard     :p4, after p3, 3d
    Phase 5 : Drivers & KYC           :p5, after p4, 3d
    Phase 6 : CPO & Station Hubs      :p6, after p5, 4d
    Phase 7 : Live Sessions & CDRs    :p7, after p6, 3d
    section Financial & Master Data
    Phase 8 : Finance, Ledger & Wallet:p8, after p7, 4d
    Phase 9 : Centralized EV Master   :p9, after p8, 3d
    section Platform Polish
    Phase 10: ESG, Alerts & Audit Log :p10, after p9, 3d
    Phase 11: E2E Verification & Audit:p11, after p10, 3d
```

---

## Phase Details & Deliverables

### Phase 1: Shared Types & Admin Data Contracts
- Extend `@chargemesh/shared-types` with `AdminUser`, `AdminRole`, `AuditLogEntry`, `AdminCpoDetail`, and `PaginatedResponse` wrappers.
- Update `@chargemesh/shared-constants` with Admin permission bitmasks and session timeout limits.

### Phase 2: Backend Admin Security & RBAC Guard
- Implement `AdminAuthModule` in NestJS with dedicated `/api/v1/admin/auth` endpoints.
- Author `AdminJwtGuard`, `@Roles(...)` decorator, and `RolesGuard`.
- Implement `AdminAuditLogInterceptor` to persist administrative mutations into the audit log.

### Phase 3: Next.js 14 Admin Portal Foundation & Layout
- Scaffold Next.js 14 App Router layout with responsive sidebar, header, global search bar, and user profile popover.
- Setup Dark/Light mode theme provider with ChargeMesh enterprise design tokens.
- Configure TanStack React Query client with optimistic caching and retry policies.

### Phase 4: Executive Dashboard & Overview Module
- Build KPI summary cards (`Total Drivers`, `Active Chargers`, `Network Power Load`, `Today's Revenue`).
- Implement real-time line charts for 24h energy load and hourly session volume.
- Render CPO uptime health widget and live system alert notification ticker.

### Phase 5: User & Driver Management Module
- Create searchable, filterable driver data table with pagination and CSV export.
- Build Driver Detail view displaying vehicles, KYC status, wallet balance, and session history.
- Implement account status management workflow (Suspend / Reactivate) with mandatory audit reason modal.

### Phase 6: CPO Networks & Station Control Center
- Build CPO partner directory with OCPI sync trigger buttons and uptime indicators.
- Create MapLibre geospatial station explorer with clustering and connector status filters.
- Implement EVSE / Charger diagnostics view with live status badges and Remote OCPP control buttons.

### Phase 7: Charging Sessions, Telemetry & CDR Archive
- Implement live session inspector streaming real-time WebSocket telemetry packets (`SoC`, `kW`, `kWh`, `₹`).
- Build historical CDR table with filters for date, CPO, station, vehicle make, and status.
- Implement exception handling workflow for interrupted or failed sessions.

### Phase 8: Financial Reconciliation & Fast Wallet Ledger
- Build transaction ledger viewer with double-entry running balance trace.
- Implement payment gateway reconciliation interface (Razorpay / UPI reference matcher).
- Build audited wallet adjustment tool with Super / Finance Admin approval flow.

### Phase 9: Centralized EV Master Database
- Build OEM Brand catalog manager (Tata, MG, Mahindra, BYD, Hyundai, etc.).
- Build Model & Variant specification editor (`batteryCapacityKwh`, `maxDcPowerKw`, `connectorTypes`, `rangeKm`).
- Implement vehicle-to-charger compatibility verification simulator.

### Phase 10: ESG Sustainability, Broadcasts & Audit Logs
- Build ESG carbon footprint dashboard calculating network CO₂ offset based on Indian grid factor.
- Build targeted notification and broadcast announcement creator for mobile app drivers.
- Build tamper-evident, searchable audit log inspector with JSON diff viewer.

### Phase 11: End-to-End Local Verification & Documentation
- Run automated TypeScript check (`npm run typecheck`) and ESLint (`npm run lint`) across all apps and packages.
- Verify that wallet mathematical balances and session debits remain perfectly reconciled.
- Update `README.md` and documentation files before final review.
