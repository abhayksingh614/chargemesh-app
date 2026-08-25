# ChargeMesh — Database Schema & Data Models

> **Status:** ⚠️ PLANNED — PostgreSQL schema is not yet active. The mobile app uses local JSON mock data.
> This document describes the intended future database design. See [`CPO_AND_STATIONS.md`](CPO_AND_STATIONS.md) for the current TypeScript data model.

## 1. Relational Entities (PostgreSQL)

```text
+-------------------+       +-----------------------+       +---------------------+
|      users        |       |       stations        |       |     connectors      |
+-------------------+       +-----------------------+       +---------------------+
| id (UUID, PK)     |       | id (UUID, PK)         |       | id (UUID, PK)       |
| phone (VARCHAR)   |       | name (VARCHAR)        |       | station_id (FK)     |
| email (VARCHAR)   |       | network_id (FK)       |       | connector_number    |
| created_at (TS)   |       | latitude (DECIMAL)    |       | type (VARCHAR)      |
+---------+---------+       | longitude (DECIMAL)   |       | max_power_kw (NUM)  |
          |                 | address (TEXT)        |       | status (VARCHAR)    |
          |                 +-----------+-----------+       +----------+----------+
          |                             |                              |
          +----------------------+      |      +-----------------------+
                                 |      |      |
                                 v      v      v
                           +------------------------+
                           |   charging_sessions    |
                           +------------------------+
                           | id (UUID, PK)          |
                           | user_id (FK)           |
                           | connector_id (FK)      |
                           | start_time (TIMESTAMP) |
                           | end_time (TIMESTAMP)   |
                           | total_kwh (DECIMAL)    |
                           | total_cost (DECIMAL)   |
                           | status (VARCHAR)       |
                           +-----------+------------+
                                       |
                                       v
                           +------------------------+
                           |  telemetry_readings    |
                           |  (TimescaleDB hyper)   |
                           +------------------------+
                           | session_id (FK)        |
                           | timestamp (TIMESTAMPTZ)|
                           | current_soc_pct (NUM)  |
                           | power_kw (DECIMAL)     |
                           | energy_kwh (DECIMAL)   |
                           | voltage_v (DECIMAL)    |
                           | current_a (DECIMAL)    |
                           +------------------------+
```

## 2. Redis Cache Keys
- `connector:status:{id}`: Current operational state (`Available`, `Occupied`, `Faulted`, `Unavailable`) TTL 30s.
- `session:live:{id}`: Latest cached telemetry snapshot for instantaneous API responses.
- `auth:session:{token}`: Authenticated user token session data.
