# ==============================================================================
# ChargeMesh Production Database Backup Script (PowerShell)
# PostgreSQL 16 + PostGIS Automated Snapshot
# ==============================================================================
param (
    [string]$ContainerName = $(if ($env:DB_CONTAINER) { $env:DB_CONTAINER } else { "chargemesh_postgres" }),
    [string]$Database = $(if ($env:DB_DATABASE) { $env:DB_DATABASE } else { "chargemesh_dev" }),
    [string]$User = $(if ($env:DB_USERNAME) { $env:DB_USERNAME } else { "chargemesh" }),
    [string]$BackupDir = "./backups/postgres"
)

$ErrorActionPreference = "Stop"

if (-not (Test-Path $BackupDir)) {
    New-Item -ItemType Directory -Path $BackupDir -Force | Out-Null
}

$Timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$OutputFile = Join-Path $BackupDir "chargemesh_${Database}_${Timestamp}.sql"

Write-Host "==> Starting backup for database '$Database' from container '$ContainerName'..." -ForegroundColor Cyan

docker exec -t $ContainerName pg_dump -U $User -d $Database --clean --if-exists --no-owner --no-privileges | Out-File -FilePath $OutputFile -Encoding utf8

$FileSize = (Get-Item $OutputFile).Length / 1MB
Write-Host ("==> Backup completed successfully: {0} ({1:N2} MB)" -f $OutputFile, $FileSize) -ForegroundColor Green

# Retention policy: Prune backups older than 14 days
$Cutoff = (Get-Date).AddDays(-14)
Get-ChildItem -Path $BackupDir -Filter "chargemesh_*.sql" | Where-Object { $_.LastWriteTime -lt $Cutoff } | Remove-Item -Force
Write-Host "==> Retention check complete." -ForegroundColor Cyan
