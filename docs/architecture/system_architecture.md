# Overall System Architecture

> **Component:** End-to-End System Context  
> **Source:** ChargeMesh Monorepo Architecture Specification  

This diagram illustrates the high-level architecture of ChargeMesh, mapping user and hardware touchpoints to core services, gateways, and data stores.

```mermaid
flowchart TD
    subgraph Drivers["EV Drivers & Mobile Fleet"]
        MobileApp["ChargeMesh Mobile Driver App (React Native)\n- 22 Native Screens\n- CameraX QR Scanner & ML Kit\n- AndroidX Biometrics Lock\n- Local-First Mock Layer"]
    end

    subgraph Operations["CPO & Administrative Operations"]
        AdminWeb["ChargeMesh Operations Portal (Next.js 14)\n- 14 Management Views\n- MapLibre GL Visualizer\n- Financial Ledger & Audit Trail"]
    end

    subgraph ChargingInfrastructure["EV Charging Hardware"]
        EVChargers["Charge Point Hardware (OCPP 1.6-J / 2.0.1)\nPhysical Chargers & CPO Hubs"]
    end

    subgraph BackendGateway["ChargeMesh Backend Platform (NestJS 10)"]
        RestGateway["REST API Gateway (/api/v1)"]
        OcppGateway["OCPP WebSocket Gateway (/ocpp)"]
        TelemetryGateway["Telemetry WebSocket Gateway (/telemetry)"]
        
        subgraph CoreModules["Core Application Modules"]
            AuthMod["AuthModule\n- Passport JWT\n- bcrypt hashing"]
            StationsMod["StationsModule\n- Haversine Spatial Query\n- Connector Filters"]
            SessionsMod["SessionsModule\n- State Machine\n- Remote Start/Stop"]
            AdminMod["AdminModule\n- RBAC RolesGuard\n- Dashboard Metrics"]
            OcppService["OcppService\n- CSMS Handlers\n- Meter Values Engine"]
        end
    end

    subgraph PersistenceAndState["Storage & Caching (Docker)"]
        PostgresDB[("PostgreSQL 16 + PostGIS\n- Spatial Indexes (GIST)\n- Relational Schema\n- init.sql")]
        RedisCache[("Redis 7 In-Memory Cache\n- Session States\n- Rate Limiting")]
    end

    MobileApp -->|"HTTPS REST (Port 3001)"| RestGateway
    MobileApp -->|"WSS Live Telemetry"| TelemetryGateway
    AdminWeb -->|"HTTPS REST API"| RestGateway
    EVChargers <-->|"Bidirectional WSS (OCPP 1.6-J/2.0.1)"| OcppGateway

    RestGateway --> CoreModules
    OcppGateway --> OcppService
    OcppService --> SessionsMod
    OcppService --> TelemetryGateway

    CoreModules -.->|"Planned Entity ORM"| PostgresDB
    CoreModules -.->|"Planned Cache Key Store"| RedisCache
```
