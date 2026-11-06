# ChargeMesh Admin Dashboard — Functional & Non-Functional Requirements

> **Scope:** Full Operational Lifecycle of ChargeMesh Ecosystem  
> **Target Audience:** System Administrators, CPO Partners, Support Teams, Finance Controllers

---

## 1. Functional Requirements by Module

### Module 1: Executive Dashboard & Live Overview
- **REQ-DASH-01**: Display real-time key performance indicators (Total Drivers, Active Chargers, Offline Chargers, Total Delivered kWh, Today's Net Revenue in ₹).
- **REQ-DASH-02**: Provide live 24-hour power load and charging session volume line charts.
- **REQ-DASH-03**: Display CPO network uptime health distribution (Active, Degraded, Down).
- **REQ-DASH-04**: Show a live feed of recent system alerts (Session faults, OCPP disconnects, reconciliation warnings).

### Module 2: User & Driver Management
- **REQ-USER-01**: Paginated, filterable driver directory with search by Name, Phone, Email, or User Code (`CM-DRV-xxxx`).
- **REQ-USER-02**: Comprehensive User Profile modal displaying KYC verification status, verified vehicles, current wallet balance, lifetime charging stats, and preferences.
- **REQ-USER-03**: Administrative account actions: Suspend Account, Reactivate Account, Reset 2FA/Password, and Add Internal Admin Notes.
- **REQ-USER-04**: View driver session history, active reservations, and favorite charging hubs.

### Module 3: CPO Partner Network Management
- **REQ-CPO-01**: Central directory of all 12+ CPO partners with protocol type (`OCPI_2_3`, `OCPI_2_2`, `PROPRIETARY`), status, and support contact details.
- **REQ-CPO-02**: OCPI module synchronization status monitor (Locations, Tariffs, Sessions, CDRs).
- **REQ-CPO-03**: CPO API endpoint and encrypted credential configuration (with RBAC-restricted visibility).
- **REQ-CPO-04**: Detailed CPO performance metrics: 30-day uptime percentage, sync error rate, active station count, and revenue share breakdown.

### Module 4: Charging Station & Hub Management
- **REQ-STN-01**: Geospatial interactive map and table view of all charging stations across India.
- **REQ-STN-02**: Station creation and edit workflows (Name, Address, Coordinates, Operating Hours, Amenities, Facilities, Access Directions).
- **REQ-STN-03**: Station-level operational status management (`OPERATIONAL`, `UNDER_MAINTENANCE`, `DECOMMISSIONED`).
- **REQ-STN-04**: Tariff assignment and dynamic pricing schedule overrides.

### Module 5: Charger & EVSE Diagnostics
- **REQ-EVSE-01**: Live connector grid displaying operational status (`AVAILABLE`, `IN_USE`, `UNAVAILABLE`, `RESERVED`, `OFFLINE`, `STALE`, `UNKNOWN`).
- **REQ-EVSE-02**: Visual freshness warnings for connectors exceeding `STATUS_STALE_THRESHOLD_SECONDS` (300s).
- **REQ-EVSE-03**: Remote OCPP Control Actions for authorized Operations Admins (`RemoteReset`, `UnlockConnector`, `TriggerMessage`, `RemoteStop`).

### Module 6: Bookings & Reservation Management
- **REQ-BKG-01**: Monitor upcoming, in-progress, completed, and cancelled charger reservations.
- **REQ-BKG-02**: View slot time, user details, station/connector assignment, and fee calculation.
- **REQ-BKG-03**: Handle cancellation requests, no-show disputes, and refund processing.

### Module 7: Charging Sessions & Telemetry Monitoring
- **REQ-SESS-01**: Real-time live session telemetry inspector (SoC %, Current Power kW, Energy kWh, Billed Cost ₹, Voltage, Amperage).
- **REQ-SESS-02**: Comprehensive CDR (Charge Detail Record) archive with export capabilities (CSV / Excel).
- **REQ-SESS-03**: Exception session handling for `AUTH_FAILED`, `START_FAILED`, `INTERRUPTED`, and `RECONCILIATION_REQUIRED`.

### Module 8: Finance, Payments & Reconciliation
- **REQ-FIN-01**: Complete transaction ledger viewer (UPI Top-ups, Card Top-ups, Session Debits, Refunds).
- **REQ-FIN-02**: Payment gateway reconciliation tool matching gateway reference IDs with internal session records.
- **REQ-FIN-03**: Process full or partial refunds with mandatory reason documentation and reference linkage.

### Module 9: Wallet Management & Ledger Auditing
- **REQ-WAL-01**: View driver double-entry ledger trace ensuring $\text{Balance} = \sum \text{Credits} - \sum \text{Debits}$.
- **REQ-WAL-02**: Audited manual wallet adjustments (`CREDIT_ADJUSTMENT` / `DEBIT_ADJUSTMENT`) with Super/Finance Admin approval and justification.
- **REQ-WAL-03**: ₹100 Welcome Joining Bonus audit and redemption tracking.

### Module 10: Centralized EV Master Database
- **REQ-EVM-01**: OEM Brand catalog manager (Tata, MG, Mahindra, BYD, Hyundai, BMW, Kia, etc.).
- **REQ-EVM-02**: Model and variant specification configuration (Battery Capacity kWh, Max AC kW, Max DC kW, Connector Types, Rated Range km).
- **REQ-EVM-03**: Compatibility verification rules engine linking vehicles to supported connector standards.

### Module 11: Sustainability & ESG Impact
- **REQ-ESG-01**: Total network carbon footprint offset calculator based on Indian grid factor (`INDIA_GRID_CO2_KG_PER_KWH = 0.71 kg/kWh`).
- **REQ-ESG-02**: State-wise and regional clean energy consumption reporting.
- **REQ-ESG-03**: Generate downloadable ESG compliance summary reports for CPO partners.

### Module 12: Notifications & Broadcast Announcements
- **REQ-NOTIF-01**: Create targeted push notifications to mobile drivers (System Maintenance, New Station Openings, Peak Tariff Alerts).
- **REQ-NOTIF-02**: Filter recipients by geographic region, vehicle make, or activity tier.

### Module 13: Immutable Audit Logs
- **REQ-AUD-01**: Record all administrative mutations with Actor ID, Actor Role, Timestamp, IP Address, Target Entity, Action Type, and JSON Diffs (`previousValue`, `newValue`).
- **REQ-AUD-02**: Tamper-evident read-only log viewer with search by admin user, date range, or entity type.

### Module 14: System Settings & Feature Flags
- **REQ-SET-01**: Manage global system feature flags (`ECO_IMPACT`, `WALLET`, `RESERVATIONS`, `SMART_CHARGING`, `BATTERY_TARGET`).
- **REQ-SET-02**: Admin user account provisioning and RBAC role assignment.

---

## 2. Non-Functional Requirements

1. **Security**: Mandatory JWT authentication with short-lived access tokens, refresh token rotation, and strict RBAC enforcement.
2. **Performance**: Page initial load under 1.5s; table searches and filter responses under 300ms; telemetry updates rendered within 100ms of WebSocket receipt.
3. **Data Integrity**: Zero tolerance for un-audited balance changes or missing ledger references.
4. **Usability**: Fully responsive desktop UI with keyboard shortcuts, dark/light theme switching, and data export shortcuts.
