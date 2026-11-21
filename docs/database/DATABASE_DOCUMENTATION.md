# ChargeMesh — Database Schema & Architecture Reference

The ChargeMesh persistence layer is engineered on **PostgreSQL 16** with **PostGIS** spatial extensions, managed via **TypeORM**.

---

## 1. Entity Model Summary

The database maintains 9 core relational entities:

```
┌─────────────────────────────────┐       ┌─────────────────────────────────┐
│              users              │       │          admin_users            │
├─────────────────────────────────┤       ├─────────────────────────────────┤
│ id (PK, varchar)                │       │ id (PK, varchar)                │
│ phoneNumber (UK, varchar)       │       │ email (UK, varchar)             │
│ name (varchar)                  │       │ passwordHash (varchar)          │
│ email (varchar, nullable)       │       │ role (varchar: SUPER_ADMIN...)  │
│ vehicle (jsonb)                 │       │ status (varchar: ACTIVE...)     │
│ walletBalancePaise (bigint)     │       │ department (varchar)            │
│ walletHeldPaise (bigint)        │       └─────────────────────────────────┘
│ totalKwhCharged (float)         │                        │
│ co2SavedKg (float)              │                        ▼
│ totalSessions (int)             │       ┌─────────────────────────────────┐
│ status (ACTIVE, SUSPENDED...)   │       │           audit_logs            │
└───────────────┬─────────────────┘       ├─────────────────────────────────┤
                │                         │ id (PK, varchar)                │
                │ initiates               │ actorId (varchar)               │
                ▼                         │ actorRole (varchar)             │
┌─────────────────────────────────┐       │ action (STATION_UPDATE, ...)    │
│        charging_sessions        │       │ targetEntity / targetId         │
├─────────────────────────────────┤       │ previousValue / newValue (jsonb)│
│ id (PK, varchar)                │       │ reason (text)                   │
│ userId (FK, varchar)            │       │ timestamp (timestamp)           │
│ stationId (FK, varchar)         │       └─────────────────────────────────┘
│ connectorId (varchar)           │
│ chargePointId (varchar)         │       ┌─────────────────────────────────┐
│ status (CHARGING, COMPLETED...) │       │         finance_ledger          │
│ startTime / endTime (timestamp) │       ├─────────────────────────────────┤
│ energyKwh (float)               │◄──────┤ id (PK, varchar)                │
│ totalCostInr (float)            │credits│ referenceId (UK, varchar)       │
│ pricePerKwh (float)             │/debits│ userId (FK, varchar)            │
└───────────────┬─────────────────┘       │ amountRupees (float)            │
                │                         │ isCredit (boolean)              │
                │ telemetry               │ balanceBeforeRupees (float)     │
                ▼                         │ balanceAfterRupees (float)      │
┌─────────────────────────────────┐       │ reconciled (boolean)            │
│          meter_values           │       └─────────────────────────────────┘
├─────────────────────────────────┤
│ id (PK, varchar)                │
│ sessionId (FK, varchar)         │
│ timestamp (timestamp)           │
│ powerKw (float)                 │
│ energyKwh (float)               │
│ socPercent (float)              │
└─────────────────────────────────┘

┌─────────────────────────────────┐       ┌─────────────────────────────────┐
│              cpos               │       │        charging_stations        │
├─────────────────────────────────┤       ├─────────────────────────────────┤
│ id (PK, varchar)                │       │ id (PK, varchar)                │
│ name (varchar)                  │       │ chargePointId (UK, varchar)     │
│ partyId (varchar)               │       │ name (varchar)                  │
│ countryCode (varchar)           │       │ operator (varchar)              │
│ protocol (OCPI_2_3...)          │       │ address (text)                  │
│ integrationStatus (ACTIVE...)   │       │ city (varchar)                  │
└─────────────────────────────────┘       │ latitude / longitude (float)    │
                                          │ rating (float)                  │
                                          │ status (ACTIVE, MAINTENANCE...) │
                                          └───────────────┬─────────────────┘
                                                          │ 1:N
                                                          ▼
                                          ┌─────────────────────────────────┐
                                          │           connectors            │
                                          ├─────────────────────────────────┤
                                          │ id (PK, varchar)                │
                                          │ stationId (FK, varchar)         │
                                          │ connectorNumber (int)           │
                                          │ type (CCS2, TYPE2, CHADEMO...)  │
                                          │ powerKw (float)                 │
                                          │ status (AVAILABLE, IN_USE...)   │
                                          │ pricePerKwh (float)             │
                                          │ lastUpdated (timestamp)         │
                                          └─────────────────────────────────┘
```

---

## 2. Geospatial Indexing & PostGIS

- Stations store `latitude` and `longitude` fields.
- Fast spatial bounding-box lookups and proximity radius searches are accelerated using PostGIS ST_DWithin and spatial indices with haversine fallback.

---

## 3. Automated Seeding (`SeedService`)

Upon platform startup, [SeedService](file:///c:/Users/aksde/Videos/My_Codex/Chargemesh_app/apps/backend/src/database/seed.service.ts) verifies database state and automatically injects canonical records if tables are empty:
- Default Super Admin (`admin@chargemesh.com`)
- Canonical CPO Partners (Tata Power EZ Charge, Jio-bp pulse, Zeon Charging, Statiq, etc.)
- Delhi NCR Hub Stations and DC Fast Connectors
- Baseline completed driver sessions and financial ledger history

---

## 4. Migrations & Schema Changes

TypeORM migrations are run automatically on production startup (`DB_MIGRATIONS_RUN=true`). To manually manage migrations:

```bash
# Generate new migration
npm --workspace=@chargemesh/backend run migration:generate -- -n MigrationName

# Run pending migrations
npm --workspace=@chargemesh/backend run migration:run

# Revert previous migration
npm --workspace=@chargemesh/backend run migration:revert
```
