---
name: deployment
description: >-
  Procedures for managing local Docker Compose orchestration, container builds,
  and environment validation.
---

# Local Deployment & Container Skill

This skill defines instructions for managing local containers and orchestrating ChargeMesh infrastructure.

## 1. Local Container Management

```bash
# Start required databases (PostgreSQL/TimescaleDB & Redis)
docker compose up -d postgres redis

# Check container health status
docker compose ps

# View container logs
docker compose logs -f
```

## 2. Service Port Allocation

| Service | Port | Protocol | Purpose |
| :--- | :--- | :--- | :--- |
| **PostgreSQL / TimescaleDB** | `5432` | TCP | Relational and time-series database |
| **Redis** | `6379` | TCP | Cache and connector state pub/sub |
| **Backend REST / GraphQL** | `3000` | HTTP | Client API |
| **OCPP CSMS Gateway** | `9000` | WS/WSS | Charge point WebSocket server |
| **Admin Web Portal** | `3001` | HTTP | Operations dashboard |
| **Mobile Metro Bundler** | `8081` | HTTP | React Native development bundler |
