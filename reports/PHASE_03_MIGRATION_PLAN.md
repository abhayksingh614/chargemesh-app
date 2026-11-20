# ChargeMesh — Phase 03 Migration & Disaster Recovery Plan
**Document Reference:** `CM-MIG-DATA-001`  
**Version:** 1.0.0 | Production Release Standard  
**Target Environment:** PostgreSQL 16 + PostGIS  
**Migration Tool:** TypeORM CLI (`typeorm-ts-node-commonjs`)  

---

## 1. Migration Strategy Overview

ChargeMesh uses version-controlled TypeScript migrations stored in `apps/backend/src/database/migrations/`.
- Schema changes are strictly decoupled from application runtime DDL modification (`synchronize: false` in production).
- Each migration implements both `up(queryRunner: QueryRunner)` and `down(queryRunner: QueryRunner)`.
- The TypeORM `migrations` table in PostgreSQL tracks executed migrations by timestamp and class name.

### Migration Inventory
| Migration Version | Description | Up Actions | Down Actions | State |
| :--- | :--- | :--- | :--- | :--- |
| `1710000000000-InitialChargeMeshSchema.ts` | Initial schema for all 9 entities | Creates extensions (`uuid-ossp`, `postgis`), 9 tables, foreign keys, and 12 indexes | Drops all 9 tables in reverse dependency order | `EXECUTED` |

---

## 2. CLI Migration Operations

### 2.1. Inspect Migration Status
To check which migrations have been executed against the active database:
```bash
npm run migration:show --workspace=apps/backend
```
Expected output:
```
[X] 1 InitialChargeMeshSchema1710000000000
```

### 2.2. Execute Pending Migrations
To run all new migrations up to current HEAD:
```bash
npm run migration:run --workspace=apps/backend
```

### 2.3. Rollback the Last Migration
To revert the most recent migration batch:
```bash
npm run migration:revert --workspace=apps/backend
```

### 2.4. Generate New Migration from Entity Changes
When modifying TypeORM entities in `src/database/entities/`:
```bash
npm run typeorm -- migration:generate src/database/migrations/<DescriptiveMigrationName> -d src/database/data-source.ts --workspace=apps/backend
```

---

## 3. Zero-Downtime Deployment (Expand / Contract Pattern)

In production high-availability environments (Kubernetes / ECS / Docker Swarm):

```
Phase 1 (Expand)        Phase 2 (Deploy)         Phase 3 (Contract)
+------------------+     +------------------+     +------------------+
| Add new columns  | --> | Rolling update   | --> | Drop old columns |
| (nullable/default|     | backend pods     |     | in subsequent    |
| Keep old columns |     | traffic switches |     | release          |
+------------------+     +------------------+     +------------------+
```

### Protocol Guidelines
1. **Never drop or rename active columns in a single release:** Add new columns as nullable or with defaults.
2. **Backwards Compatibility:** Ensure running containers (v1.0) continue to operate cleanly while v1.1 containers are booted.
3. **Automated Migration Hook:** Production containers can execute migrations on entrypoint or via a Kubernetes `Job` prior to deployment rollout.

---

## 4. Backup & Disaster Recovery Standard

### 4.1. Automated Daily Snapshots
The automated backup script creates consistent, compressed SQL dumps:
- **Linux / Docker:** `bash docker/scripts/backup-database.sh`
- **Windows / PowerShell:** `powershell -ExecutionPolicy Bypass -File ./docker/scripts/backup-database.ps1`

### 4.2. Recovery Point Objective (RPO) & Recovery Time Objective (RTO)
- **RPO:** $\le 1$ hour (Point-in-Time Recovery via WAL archiving in production cloud PostgreSQL RDS/CloudSQL).
- **RTO:** $\le 15$ minutes (Automated restore via `restore-database.sh`).

### 4.3. Verified Restore Procedure
To restore from a backup archive:
```bash
# Linux
./docker/scripts/restore-database.sh ./backups/postgres/chargemesh_chargemesh_dev_20261120_034137.sql.gz

# Windows
powershell -ExecutionPolicy Bypass -File ./docker/scripts/restore-database.ps1 -BackupFile ./backups/postgres/chargemesh_chargemesh_dev_20261120_034137.sql
```
