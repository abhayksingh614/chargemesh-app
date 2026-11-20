# ChargeMesh — Phase 03 Database Schema & Relational Integrity Audit
**Document Reference:** `CM-DATA-AUDIT-001`  
**Database Engine:** PostgreSQL 16.3 + PostGIS 3.4 Alpine  
**ORM Framework:** TypeORM 0.3.31 + @nestjs/typeorm 10.0.2  
**Audit Date:** 2026-11-20  
**Audit Scope:** 9 Entities, DDL, Constraints, Column Types, Service-to-Repository Persistence  

---

## 1. Schema Definition & Relational Verification

An independent inspection was conducted of all 9 TypeORM entity definitions against the live PostgreSQL database schema:

| Entity Name | Target Table | Primary Key | Foreign Keys | Key Indexes | Verification Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `UserEntity` | `users` | `id` (VARCHAR 64) | None | UK: `phoneNumber` | **VERIFIED PASS** |
| `AdminUserEntity` | `admin_users` | `id` (VARCHAR 64) | None | UK: `email` | **VERIFIED PASS** |
| `CpoEntity` | `cpos` | `id` (VARCHAR 64) | None | None | **VERIFIED PASS** |
| `ChargingStationEntity`| `charging_stations`| `id` (VARCHAR 64) | `cpoId` -> `cpos(id)` | UK: `chargePointId`, `city` | **VERIFIED PASS** |
| `ConnectorEntity` | `connectors` | `id` (VARCHAR 64) | `stationId` -> `stations(id)` | `stationId`, `status` | **VERIFIED PASS** |
| `ChargingSessionEntity`| `charging_sessions`| `id` (VARCHAR 64) | None (Denormalized) | `stationId`, `userId`, `status` | **VERIFIED PASS** |
| `MeterValueEntity` | `meter_values` | `id` (UUID) | None | `sessionId`, `timestamp DESC` | **VERIFIED PASS** |
| `FinanceLedgerEntity` | `finance_ledger` | `id` (VARCHAR 64) | None | UK: `referenceId`, `userId` | **PARTIALLY VERIFIED** |
| `AuditLogEntity` | `audit_logs` | `id` (VARCHAR 64) | None | `actorId`, `timestamp DESC` | **VERIFIED PASS** |

---

## 2. In-Depth Entity & Type Audit

### 2.1. Monetary Value Precision (`finance_ledger` vs. `users`)
- **`users.walletBalancePaise`:** Stored as `BIGINT`. This is correct; storing monetary values in the smallest currency unit (Paise) eliminates IEEE 754 floating-point rounding errors.
- **`finance_ledger.amountRupees`, `balanceBeforeRupees`, `balanceAfterRupees`:**
  - In [finance-ledger.entity.ts](file:///c:/Users/aksde/Videos/My_Codex/Chargemesh_app/apps/backend/src/database/entities/finance-ledger.entity.ts#L31-L56), these columns are defined as `@Column('float')`.
  - In PostgreSQL DDL, this translates to `DOUBLE PRECISION`.
  - **Risk:** Floating point representations accumulate decimal rounding artifacts (e.g., `0.1 + 0.2 = 0.30000000000000004`). In a high-volume financial ledger, this leads to balance reconciliation drift across bank settlement audits.
  - **Remediation Recommendation:** Change column definitions to `numeric(12, 2)` or store as integer `amountPaise: bigint`.

### 2.2. PostGIS Spatial Column & Index Status
- **`charging_stations`:** Contains `latitude: DOUBLE PRECISION` and `longitude: DOUBLE PRECISION`.
- The PostgreSQL database has the `postgis` extension enabled (`3.4 USE_GEOS=1 USE_PROJ=1 USE_STATS=1`).
- However, `charging_stations` does NOT currently define a dedicated PostGIS `geometry(Point, 4326)` or `geography(Point, 4326)` column with a GiST index.
- Spatial search in [stations.service.ts](file:///c:/Users/aksde/Videos/My_Codex/Chargemesh_app/apps/backend/src/modules/stations/stations.service.ts#L84-L106) executes in Node.js process memory using the JavaScript Haversine formula instead of native PostGIS `ST_DWithin` in SQL.
- **Remediation Recommendation:** Add a generated or managed `geography(Point, 4326)` column and GiST index to support sub-millisecond database-level spatial filtering for 50,000+ EV charging locations.

---

## 3. Service-to-Repository Persistence Audit

A critical check performed by this audit is verifying whether services actually persist writes to PostgreSQL or retain data in transient memory `Map` structures.

| Module & Service | Operation | Claims Persistence? | Actual Runtime Behavior | Audit Finding |
| :--- | :--- | :--- | :--- | :--- |
| `AuthService` | Driver Register | Yes | Writes to `userRepo.save()` + memory fallback | **DURABLE** |
| `AuthService` | Driver Login | Yes | Reads from `userRepo.findOneBy()` | **DURABLE** |
| `StationsService` | List Stations | Yes | Reads from `stationRepo.find({ relations: ['connectors'] })` | **DURABLE** |
| `SessionsService` | Start Session | Yes | Writes to `sessionRepo.save()` | **DURABLE** |
| `SessionsService` | Stop Session | Yes | Writes to `sessionRepo.update()` | **DURABLE** |
| `SessionsService` | Add Meter Value | Yes | Writes to `meterRepo.save()` | **DURABLE** |
| `AdminAuthService` | Admin Login | Yes | Reads from `adminRepo.findOneBy()` | **DURABLE** |
| `AdminAuthService` | Change Password | Yes | **Mutates in-memory Map only; does NOT update `adminRepo`** | **CRITICAL DEFECT** |
| `AdminAuthService` | Reset Password | Yes | **Mutates in-memory Map only; does NOT update `adminRepo`** | **CRITICAL DEFECT** |
| `AdminCpoService` | List / Sync | Yes | Reads/Updates via `cpoRepo` | **DURABLE** |
| `AdminUsersService` | Find / List | Yes | **Reads ONLY from in-memory `this.users` Map** | **MAJOR DEFECT** |
| `AdminFinanceService`| Adjust Balance | Yes | Saves to `financeRepo`, **but fails to update `userRepo.walletBalancePaise`** | **MAJOR DEFECT** |
| `AdminAuditService` | Record Log | Yes | Writes to `auditRepo.save()` | **DURABLE** |

### Summary of Service Audit
The core driver flows (Driver Register, Login, Stations, Sessions, Meter Telemetry, CPO Sync, Audit Logs) have genuine, durable PostgreSQL persistence.  
However, the **Admin User and Finance balance management modules contain critical omissions** where methods update only in-memory JavaScript `Map` objects without calling TypeORM repository update methods, resulting in silent data loss upon process restarts.
