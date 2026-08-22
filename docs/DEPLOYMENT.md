# ChargeMesh — Local & Production Deployment Guide

## 1. Local Development Environment Setup

### Prerequisites
- Node.js >= 20.x
- Docker & Docker Compose
- React Native / Expo tooling (for mobile)
- PostgreSQL 16 + TimescaleDB extension (via Docker)
- Redis 7 (via Docker)

### 1.1 Starting Local Infrastructure
```bash
# Start PostgreSQL, TimescaleDB, and Redis containers
docker compose up -d postgres redis
```

### 1.2 Running the Backend & OCPP Server
```bash
cd apps/backend
npm install
npm run start:dev
```

### 1.3 Running the Mobile Client
```bash
cd apps/mobile
npm install
npm run start
```

### 1.4 Running the Admin Portal
```bash
cd apps/admin
npm install
npm run dev
```

---

## 2. Production Containerization

- Multi-stage Dockerfiles located in `docker/` for zero-overhead production builds.
- Kubernetes / ECS manifests configured with health checks:
  - `/healthz`: Liveness probe
  - `/readyz`: Database and Redis connectivity check
