#!/usr/bin/env bash
# ==============================================================================
# ChargeMesh Database Restore Script
# Restores a compressed SQL dump into PostgreSQL
# ==============================================================================
set -euo pipefail

if [ "$#" -ne 1 ]; then
    echo "Usage: $0 <path_to_backup_archive.sql.gz>"
    exit 1
fi

BACKUP_FILE="$1"
CONTAINER_NAME="${DB_CONTAINER:-chargemesh_postgres}"
DB_NAME="${DB_DATABASE:-chargemesh_dev}"
DB_USER="${DB_USERNAME:-chargemesh}"

if [ ! -f "${BACKUP_FILE}" ]; then
    echo "Error: Backup file '${BACKUP_FILE}' not found."
    exit 1
fi

echo "==> Restoring '${BACKUP_FILE}' to database '${DB_NAME}' in container '${CONTAINER_NAME}'..."
gunzip -c "${BACKUP_FILE}" | docker exec -i "${CONTAINER_NAME}" psql -U "${DB_USER}" -d "${DB_NAME}"

echo "==> Database restore completed successfully!"
