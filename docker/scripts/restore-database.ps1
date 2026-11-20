# ==============================================================================
# ChargeMesh Database Restore Script (PowerShell)
# Restores an uncompressed SQL dump into PostgreSQL
# ==============================================================================
param (
    [Parameter(Mandatory=$true)]
    [string]$BackupFile,
    [string]$ContainerName = $(if ($env:DB_CONTAINER) { $env:DB_CONTAINER } else { "chargemesh_postgres" }),
    [string]$Database = $(if ($env:DB_DATABASE) { $env:DB_DATABASE } else { "chargemesh_dev" }),
    [string]$User = $(if ($env:DB_USERNAME) { $env:DB_USERNAME } else { "chargemesh" })
)

$ErrorActionPreference = "Stop"

if (-not (Test-Path $BackupFile)) {
    Write-Error "Backup file '$BackupFile' does not exist."
    exit 1
}

Write-Host "==> Restoring '$BackupFile' to database '$Database' on container '$ContainerName'..." -ForegroundColor Cyan

Get-Content -Path $BackupFile -Raw | docker exec -i $ContainerName psql -U $User -d $Database

Write-Host "==> Database restore completed successfully!" -ForegroundColor Green
