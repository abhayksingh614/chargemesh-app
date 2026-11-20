# ChargeMesh — Phase 03 Infrastructure & Container Security Audit
**Document Reference:** `CM-INFRA-AUDIT-001`  
**Audit Standard:** CIS Docker Benchmark v1.6.0, Cloud-Native SRE Standards  
**Evaluation Date:** 2026-11-20  
**Target Scope:** Multi-Stage Dockerfiles, Docker Compose (Dev/Prod), Health Probes, Network Topology  

---

## 1. Container Infrastructure Evaluation

| Component | Target File | Security Profile | Health Probing | Resource Limits | Audit Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Backend Service** | `apps/backend/Dockerfile` | Non-root `node` (UID 1000), `dumb-init` | `curl -f /health/live` | CPU: 2.0, Mem: 1024M | **VERIFIED PASS** |
| **Admin Web Portal** | `apps/admin/Dockerfile` | Non-root `nextjs` (UID 1001), `dumb-init`| `curl -f http://localhost:3001`| CPU: 1.0, Mem: 1024M | **VERIFIED PASS** |
| **PostgreSQL 16** | `docker-compose.prod.yml` | Dedicated alpine container | `pg_isready -U chargemesh` | CPU: 2.0, Mem: 2048M | **VERIFIED PASS** |
| **Redis 7** | `docker-compose.prod.yml` | Protected mode with password | `redis-cli ping` | CPU: 1.0, Mem: 512M | **VERIFIED PASS** |
| **MQTT / Mosquitto** | Monorepo root | N/A (WebSockets utilized) | N/A | N/A | **NOT APPLICABLE** |

---

## 2. Dockerfile Hardening Audit

### 2.1. Backend Service (`apps/backend/Dockerfile`)
1. **Multi-Stage Build:**
   - Stage 1 (`builder`): Compiles TypeScript, prunes devDependencies via `npm prune --production`.
   - Stage 2 (`runner`): Minimal Alpine Linux runner image.
2. **PID 1 Signal Handling:**
   - Installs and wraps entrypoint with `/usr/bin/dumb-init`.
   - Ensures POSIX signals (`SIGTERM`, `SIGINT`) are properly forwarded to Node.js for graceful WebSocket client teardown and database connection pool draining.
3. **Least Privilege Execution:**
   - Switched to unprivileged user `USER node` prior to exposing port 3000.
4. **Embedded Healthcheck:**
   - Defines `HEALTHCHECK --interval=30s --timeout=5s --retries=3 CMD curl -f http://localhost:3000/health/live || exit 1`.

### 2.2. Admin Portal (`apps/admin/Dockerfile`)
1. **Multi-Stage Build:**
   - Builds Next.js App Router static and SSR bundles with `NEXT_TELEMETRY_DISABLED=1`.
2. **User Isolation:**
   - Creates dedicated system group and user: `addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs`.
   - Sets `USER nextjs`.
3. **Observation:**
   - During Next.js compilation, Next.js outputs a warning attempting to patch its lockfile: `npm error code ENOWORKSPACES`.
   - While the build succeeds and generates 19 static routes, setting `ENV NEXT_TELEMETRY_DISABLED=1` and ensuring clean workspace isolation prevents unnecessary lockfile mutation warnings.

---

## 3. Production Compose Topology (`docker-compose.prod.yml`)

1. **Network Boundary Isolation:**
   - Creates an internal bridge network `chargemesh_internal`.
   - PostgreSQL and Redis containers do NOT map ports to the host interface in production, preventing direct internet access to database and cache ports.
   - Only `backend` (Port 3000) and `admin` (Port 3001) expose network ports.
2. **Dependency Health Gating:**
   - `backend` specifies:
     ```yaml
     depends_on:
       postgres:
         condition: service_healthy
       redis:
         condition: service_healthy
     ```
   - Prevents backend crash loops by delaying container startup until PostgreSQL accepts connections and Redis responds with `PONG`.
3. **Secrets Isolation:**
   - Credentials are not hardcoded; values require injection via environment variables (`${JWT_SECRET:?JWT_SECRET must be provided}`, `${DB_PASSWORD}`, `${REDIS_PASSWORD}`).
