#!/usr/bin/env bash
# ==============================================================================
# ChargeMesh Production Database Backup Script
# PostgreSQL 16 + PostGIS Automated Snapshot
# ==============================================================================
set -euo pipefail

BACKUP_DIR="${BACKUP_DIR:-./backups/postgres}"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
CONTAINER_NAME="${DB_CONTAINER:-chargemesh_postgres}"
DB_NAME="${DB_DATABASE:-chargemesh_dev}"
DB_USER="${DB_USERNAME:-chargemesh}"
OUTPUT_FILE="${BACKUP_DIR}/chargemesh_${DB_NAME}_${TIMESTAMP}.sql.gz"

mkdir -p "${BACKUP_DIR}"

echo "==> [$(date)] Starting backup for database '${DB_NAME}' from container '${CONTAINER_NAME}'..."

docker exec -t "${CONTAINER_NAME}" pg_dump -U "${DB_USER}" -d "${DB_NAME}" --clean --if-exists --no-owner --no-privileges | gzip > "${OUTPUT_FILE}"

FILE_SIZE=$(du -h "${OUTPUT_FILE}" | cut -f1)
echo "==> [$(date)] Backup completed successfully!"
echo "    Archive: ${OUTPUT_FILE} (${FILE_SIZE})"

# Retention: Delete backups older than 14 days
echo "==> Pruning backups older than 14 days..."
find "${BACKUP_DIR}" -name "chargemesh_*.sql.gz" -mtime +14 -exec rm -f {} +
echo "==> Retention cleanup complete."
