# Database & Geospatial Architecture

> **Component:** Data Persistence & Caching  
> **Source:** `docker-compose.yml`, `docker/postgres/init.sql`, and Canonical Domain Models (`@chargemesh/shared-types`)  

This document details the relational data model, geospatial indexing strategy, and caching layer designed for ChargeMesh.

> [!NOTE]
> **Implementation Status:** The Docker PostgreSQL 16 + PostGIS environment is active and configured via `init.sql`. The current backend development phase utilizes in-memory map repositories that conform strictly to these relational entities. Production database migration scripts (TypeORM/Prisma) are planned.

---

## 1. Entity-Relationship Model (PostgreSQL)

```mermaid
erDiagram
    CPOS ||--o{ STATIONS : operates
    STATIONS ||--|{ CONNECTORS : houses
    USERS ||--o{ VEHICLES : owns
    USERS ||--o{ CHARGING_SESSIONS : initiates
    CONNECTORS ||--o{ CHARGING_SESSIONS : supplies
    CHARGING_SESSIONS ||--o{ TELEMETRY_READINGS : records
    USERS ||--o{ WALLET_TRANSACTIONS : conducts
    ADMIN_USERS ||--o{ AUDIT_LOGS : performs

    CPOS {
        uuid id PK
        string party_id
        string name
        string country_code
        string protocol
        string status
        decimal revenue_share_pct
    }

    STATIONS {
        uuid id PK
        uuid cpo_id FK
        string charge_point_id
        string name
        geometry coordinates_point
        string address
        string city
        string district
        string state
        decimal rating
    }

    CONNECTORS {
        uuid id PK
        uuid station_id FK
        int connector_number
        string type
        decimal power_kw
        string status
        string freshness_state
        timestamp last_updated
    }

    USERS {
        uuid id PK
        string phone_number UK
        string name
        string email
        string status
        timestamp created_at
    }

    VEHICLES {
        uuid id PK
        uuid user_id FK
        string make
        string model
        string connector_type
        decimal battery_capacity_kwh
        decimal max_dc_power_kw
    }

    CHARGING_SESSIONS {
        uuid id PK
        uuid user_id FK
        uuid connector_id FK
        string status
        timestamp start_time
        timestamp end_time
        decimal energy_kwh
        decimal total_cost_inr
        decimal start_soc
        decimal end_soc
    }

    TELEMETRY_READINGS {
        uuid id PK
        uuid session_id FK
        timestamp timestamp
        decimal current_power_kw
        decimal soc_percent
        decimal voltage_v
        decimal current_a
    }

    WALLET_TRANSACTIONS {
        uuid id PK
        uuid user_id FK
        string type
        decimal amount_inr
        decimal balance_after_inr
        string payment_gateway_ref
        string status
        timestamp created_at
    }

    AUDIT_LOGS {
        uuid id PK
        uuid actor_id FK
        string action
        string target_entity
        string target_id
        text reason
        string ip_address
        timestamp timestamp
    }
```

---

## 2. Geospatial Query Pipeline (PostGIS)

Charging station discovery relies on PostGIS spatial functions:

1. **Point Definition:** Coordinates are stored as `GEOMETRY(Point, 4326)` representing `(longitude, latitude)`.
2. **Radial Search (`ST_DWithin`):** Station discovery calculates proximity against driver coordinates:
   ```sql
   SELECT id, name, ST_Distance(coordinates_point, ST_MakePoint(?, ?)::geography) AS distance_meters
   FROM stations
   WHERE ST_DWithin(coordinates_point, ST_MakePoint(?, ?)::geography, ?);
   ```
3. **Spatial Index:** PostGIS `GIST (coordinates_point)` ensures sub-millisecond bounding-box filtering across thousands of nationwide chargers.
4. **Fuzzy Search Index:** `pg_trgm` extension enables trigram GIN indexes on station names, district names, and addresses for instant typeahead search.

---

## 3. Ephemeral State & Caching Architecture (Redis 7)

Redis provides low-latency key-value operations:
- **Connector State Cache:** Key `cpo:{cpoId}:station:{stationId}:connector:{connectorId}:status` (TTL 300s).
- **Session Rate Limiter:** Key `ratelimit:{userId}:{endpoint}`.
- **WebSocket Socket Mapping:** Tracks connected charger sockets by `chargePointId` to active node instances.
