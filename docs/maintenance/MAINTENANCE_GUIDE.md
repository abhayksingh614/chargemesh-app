# ChargeMesh — System Maintenance & Operations Guide

This document defines standard operating procedures for database maintenance, backups, secret rotations, and dependency management.

---

## 1. Database Backup & Disaster Recovery

The repository includes battle-tested automated backup and restore scripts located in [docker/scripts/](file:///c:/Users/aksde/Videos/My_Codex/Chargemesh_app/docker/scripts):

### 1.1 Performing an Automated Backup
```bash
# On Linux / macOS
bash docker/scripts/backup-database.sh

# On Windows (PowerShell)
powershell -ExecutionPolicy Bypass -File docker/scripts/backup-database.ps1
```
Backups are archived into compressed `.sql.gz` files with timestamped tags and stored in the dedicated backup volume.

### 1.2 Restoring from a Backup
```bash
# On Linux / macOS
bash docker/scripts/restore-database.sh <path-to-backup.sql.gz>

# On Windows (PowerShell)
powershell -ExecutionPolicy Bypass -File docker/scripts/restore-database.ps1 -BackupFile <path-to-backup.sql.gz>
```

---

## 2. Dependency Management & Security Upgrades

- **Dependabot Configuration:** Automated weekly dependency auditing is defined in [.github/dependabot.yml](file:///c:/Users/aksde/Videos/My_Codex/Chargemesh_app/.github/dependabot.yml).
- **Audit Verification:**
  ```bash
  # Check for known CVEs
  npm audit
  ```
- **Monorepo Lockfile Integrity:** Do not run blind `npm audit fix --force` across monorepo boundaries as React Native peer dependencies require pinned React 18.2.0 compatibility.

---

## 3. Scheduled Secret Rotation Schedule

| Secret Category | Rotation Interval | Impact & Procedure |
| :--- | :--- | :--- |
| **Stateless JWT Secret** | 90 Days | Invalidates active user sessions; requires driver re-login. |
| **PostgreSQL Password** | 180 Days | Update in Vault / `.env` and restart database container. |
| **Redis Server Password** | 180 Days | Update in Redis config and CSMS backend environment. |
| **Razorpay Webhook Secret** | 180 Days | Update in Razorpay Dashboard and backend configuration. |

---

## 4. Log Rotation & Audit Archive Retention

- `AuditLogEntity` entries are append-only and immutable.
- In production, audit logs older than 365 days should be exported to cold cloud storage (AWS S3 Glacier) for legal and tax compliance (18% GST audit requirements).
