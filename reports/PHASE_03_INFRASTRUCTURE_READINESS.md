# ChargeMesh — Phase 03 Infrastructure & DevOps Readiness Report
**Document Reference:** `CM-INFRA-OPS-001`  
**Version:** 1.0.0 | Enterprise Deployment Standard  
**Container Engine:** Docker Engine 24+ / Docker Compose v2  
**Target Architecture:** Linux x86_64 / arm64  

---

## 1. Container Infrastructure Architecture

The ChargeMesh production topology enforces network isolation, least privilege execution, and horizontal scalability:

```
                                [ Internet / Mobile / Web Clients ]
                                                |
                                                v
                                  [ Reverse Proxy (Nginx / ALB) ]
                                      |                     |
                   (Port 3001)        v                     v        (Port 3000)
                +--------------------------+   +------------------------------------+
                | chargemesh_admin_prod    |   | chargemesh_backend_prod            |
                | Next.js App Router       |   | NestJS REST & OCPP 1.6-J / 2.0.1  |
                | Non-root user: nextjs    |   | Non-root user: node                |
                +-------------+------------+   +-----------------+------------------+
                              |                                  |
==============================|==================================|=========================
chargemesh_internal Network   |                                  |
==============================|==================================|=========================
                              |                                  v
                              |                     +-------------------------------+
                              |                     | chargemesh_redis_prod         |
                              |                     | Redis 7 (Protected Mode + Auth)|
                              |                     | Atomic Distributed Rate Limit |
                              |                     +-------------------------------+
                              |                                  |
                              v                                  v
                +-------------------------------------------------------------------+
                | chargemesh_postgres_prod                                          |
                | PostgreSQL 16.3 + PostGIS 3.4 Alpine                              |
                | Persistent Volume: chargemesh_pgdata_prod                         |
                +-------------------------------------------------------------------+
```

---

## 2. Multi-Stage Container Hardening

### 2.1. Backend Dockerfile (`apps/backend/Dockerfile`)
- **Stage 1 (Builder):** Alpine Node.js 20 with build tools (`python3`, `make`, `g++`), installs dependencies via `npm ci`, compiles TypeScript, and runs `npm prune --production`.
- **Stage 2 (Runner):** Minimal Alpine image.
- **PID 1 Signal Handling:** Uses `/usr/bin/dumb-init` to ensure POSIX signals (`SIGTERM`, `SIGINT`) are gracefully routed to Node.js, ensuring clean WebSocket client termination and connection pool drainage.
- **Least Privilege:** Executes under unprivileged user `node` (UID 1000).
- **Health Probing:** Embedded `HEALTHCHECK` running `curl -f http://localhost:3000/health/live`.

### 2.2. Admin Portal Dockerfile (`apps/admin/Dockerfile`)
- **Stage 1 (Builder):** Next.js production build (`npm run build:admin`) generating optimized static and SSR assets.
- **Stage 2 (Runner):** Unprivileged dedicated `nextjs:nodejs` system user (UID/GID 1001).
- **Telemetry Disabled:** `NEXT_TELEMETRY_DISABLED=1` set across all stages.
- **Health Probing:** Embedded `HEALTHCHECK` checking `http://localhost:3001`.

---

## 3. Orchestration & Production Configuration

### 3.1. Development vs. Production Compose Matrix
| Service | Development (`docker-compose.yml`) | Production (`docker-compose.prod.yml`) |
| :--- | :--- | :--- |
| **PostgreSQL** | Host port `5434:5432`, `chargemesh_dev` | Internal only, `chargemesh_prod`, CPU/Memory limits |
| **Redis** | Host port `6379:6379`, no password | Protected mode, requirepass, maxmemory 512mb volatile-lru |
| **Backend** | Local Node process / dev server | Multi-stage container, healthchecks, automatic restart |
| **Admin** | Next.js dev server on port 3001 | Standalone multi-stage container, non-root nextjs |
| **Network** | Host-bridged default | Isolated `chargemesh_internal` bridge network |

---

## 4. Health Probing & Observability Standards

| Endpoint | Protocol | Target Consumer | Success Criteria | Failure Action |
| :--- | :--- | :--- | :--- | :--- |
| `/health/live` | HTTP GET | Kubernetes / Docker Engine | Returns HTTP 200 `{ status: "ok" }` | Container restart (crash loop) |
| `/health/ready` | HTTP GET | Kubernetes / Load Balancer | `SELECT 1` on PostgreSQL and `redis.ping()` succeed | Remove from traffic routing pool |
| `/health` | HTTP GET | Monitoring dashboards / SRE | HTTP 200 with uptime and version | Alert SRE on degraded state |

---

## 5. Automated Backup & Recovery Validation

- **Backup Execution:** `docker/scripts/backup-database.ps1` (or `.sh` on Linux) dumps PostgreSQL state via `pg_dump`, creating timestamped snapshots.
- **Retention:** Automatically prunes snapshots older than 14 days.
- **Verification:** Backup script tested live against running PostgreSQL container:
  ```
  ==> Starting backup for database 'chargemesh_dev' from container 'chargemesh_postgres'...
  ==> Backup completed successfully: .\backups\postgres\chargemesh_chargemesh_dev_20261120_034137.sql (0.03 MB)
  ==> Retention check complete.
  ```
