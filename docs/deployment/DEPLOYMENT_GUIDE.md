# ChargeMesh — Local & Production Deployment Guide

This guide details deployment procedures for development, staging, and production environments.

---

## 1. Local Development Orchestration

During development, infrastructure dependencies are orchestrated via Docker Compose while Node.js application services run with hot-reloading:

```bash
# 1. Start database and cache services
docker compose up -d postgres redis

# 2. Run backend service with hot-reload
npm --workspace=@chargemesh/backend run dev

# 3. Run admin portal with Next.js Fast Refresh
npm --workspace=@chargemesh/admin run dev
```

---

## 2. Production Containerized Deployment (`docker-compose.prod.yml`)

In staging and production, the entire stack runs containerized with resource constraints, health probes, and restart policies:

```bash
# Launch full production cluster
docker compose -f docker-compose.prod.yml up -d --build

# Inspect running container health
docker compose -f docker-compose.prod.yml ps
```

### Production Security & Resource Limits
- **PostgreSQL 16:** PostGIS enabled, automated daily volume backups, 2.0 CPUs / 2048MB memory limit.
- **Redis 7:** Password protected (`--requirepass`), volatile-LRU eviction, 1.0 CPU / 512MB memory limit.
- **Backend CSMS:** Multi-stage Alpine container, running as non-root user `nodejs`, 2.0 CPUs / 1024MB memory limit.
- **Admin Portal:** Static HTML/JS export served over high-performance CDN / Nginx container.

---

## 3. Production Health Probes & Readiness Checks

Kubernetes, AWS ECS, and load balancers utilize the following endpoints for traffic routing:

- **Liveness Probe:** `GET /health` (Verifies process is responsive)
- **Readiness Probe:** `GET /health/ready` (Verifies PostgreSQL connection pool and Redis reachability)
- **Startup Probe:** `GET /health/live` (Ensures TypeORM entities and seed tasks have completed)

---

## 4. Secret Provisioning & Key Rotation

Production environments MUST NEVER use `.env` files stored on disk:
1. Inject environment variables via **AWS Secrets Manager**, **HashiCorp Vault**, or **Kubernetes Secrets**.
2. Rotate JWT secrets and administrative passwords on a scheduled 90-day cycle.
3. Keep database credentials isolated in an internal VPC network (`chargemesh_internal`).
