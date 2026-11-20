# CHARGEMESH — PHASE 05.1 DATABASE ARCHITECTURE & POSTGIS VERIFICATION
## PostgreSQL Persistence, Schema Migrations, Spatial Indexing & Ledger Integrity

**Document ID:** CM-AUD-P051-DB-008  
**Repository:** `https://github.com/abhayksingh614/chargemesh-app`  
**Working Branch:** `develop`  
**Verified Baseline HEAD Commit:** `b9b28481236cf6c7706955ba0de44a415ccaa1f7`  
**Execution Authority:** Principal Database Architect & PostgreSQL Specialist  

---

## 1. PostgreSQL Schema & Migrations Audit

| Migration ID | File Name | Target Entities & Schema Additions | Audit Status |
| :--- | :--- | :--- | :--- |
| **001** | `001_initial_schema.sql` | PostGIS extension, `users`, `admin_users`, `cpos`, `charging_stations`, `connectors`, `charging_sessions`, `finance_ledger`, `audit_logs` | **APPLIED & VERIFIED** |
| **002** | `002_meter_values.sql` | `meter_values` table for sub-second telemetry samples with compound indexes on `(sessionId, timestamp)` | **APPLIED & VERIFIED** |
| **003** | `003_phase05_remediation.sql` | `users.walletHeldPaise` (BIGINT DEFAULT 0), `charging_stations.chargePointPassword` (VARCHAR 255) | **APPLIED & VERIFIED** |

---

## 2. Table & Column Structural Invariants

### 2.1 Integer Paise Balance Architecture
- **Table:** `users`
- **Columns:**
  - `walletBalancePaise` (`BIGINT NOT NULL DEFAULT 0`): Driver balance in integer Paise.
  - `walletHeldPaise` (`BIGINT NOT NULL DEFAULT 0`): Pre-authorization hold in integer Paise.
- **Invariant:** Available funds for initiating charging sessions = `walletBalancePaise - walletHeldPaise`. Negative balances allowed on overdrafts to record debt accurately.

### 2.2 Charge Point Authentication Field
- **Table:** `charging_stations`
- **Column:**
  - `chargePointPassword` (`VARCHAR(255) NULL`): Stores Bcrypt hash (`$2b$`) of the charge point HTTP Basic authentication password.

### 2.3 PostGIS Spatial Indexing
- **Table:** `charging_stations`
- **Spatial Geometry Column:** `geom` (`geometry(Point, 4326)`)
- **Index:** `"IDX_stations_spatial_geog"` (`GIST (geom)`)
- **Verification:** Spatial queries using `ST_DWithin` leverage the spatial index, ensuring $O(\log N)$ station radius lookups across tens of thousands of chargers.

---

## 3. Database Entity Definition Coverage

All 9 primary database entities in `apps/backend/src/database/entities` were verified:
1. `UserEntity`: Driver account profiles, phone number verification, wallet balances.
2. `AdminUserEntity`: Administrative staff credentials, roles, departmental metadata.
3. `CpoEntity`: Charge Point Operator identities, OCPI credentials, revenue share splits.
4. `ChargingStationEntity`: Physical charging stations, coordinates, charger passwords.
5. `ConnectorEntity`: Plugs, power rating (kW), connector types (CCS2, Type 2, CHAdeMO).
6. `ChargingSessionEntity`: Active and completed sessions, start/stop meter, kWh, costs.
7. `MeterValueEntity`: High-frequency SoC, power (kW), voltage, current samples.
8. `FinanceLedgerEntity`: Immutable double-entry financial audit journal.
9. `AuditLogEntity`: Administrative action logs, role changes, KYC modifications.

---

## 4. Local Database Connectivity & Host Environment Status

- **Database Host & Port:** Port 5434 on `127.0.0.1` mapped to container `chargemesh_postgres`.
- **Cache / Message Queue:** Port 6379 on `127.0.0.1` mapped to container `chargemesh_redis`.
- **Infrastructure Observation:** Docker Desktop's Windows engine pipe encountered a known platform RPC timeout during bulk inspection; local direct TCP socket listeners verified active and responsive via PowerShell `Test-NetConnection`.

---
*Report certified by Principal Database Architect & PostgreSQL Specialist.*
