-- =============================================================================
-- ChargeMesh — Supabase Cloud Database Schema
-- Run this script in: Supabase Dashboard -> SQL Editor -> New query -> Run
-- =============================================================================

-- 1. Enable Required Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- 2. Users (EV Drivers)
CREATE TABLE IF NOT EXISTS public.users (
    id VARCHAR(64) PRIMARY KEY,
    "phoneNumber" VARCHAR(20) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150),
    vehicle JSONB,
    "walletBalancePaise" BIGINT NOT NULL DEFAULT 0,
    "totalKwhCharged" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "co2SavedKg" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "totalSessions" INTEGER NOT NULL DEFAULT 0,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT now(),
    "updatedAt" TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT now()
);

-- 3. Admin Users (CPO Admins & Operators)
CREATE TABLE IF NOT EXISTS public.admin_users (
    id VARCHAR(64) PRIMARY KEY,
    email VARCHAR(150) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    "passwordHash" VARCHAR(255) NOT NULL,
    role VARCHAR(32) NOT NULL DEFAULT 'OPERATOR',
    status VARCHAR(32) NOT NULL DEFAULT 'ACTIVE',
    department VARCHAR(128),
    "createdAt" TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT now(),
    "updatedAt" TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT now()
);

-- 4. CPOs (Charge Point Operators)
CREATE TABLE IF NOT EXISTS public.cpos (
    id VARCHAR(64) PRIMARY KEY,
    "partyId" VARCHAR(10) NOT NULL,
    "countryCode" VARCHAR(5) NOT NULL,
    name VARCHAR(150) NOT NULL,
    protocol VARCHAR(20) NOT NULL,
    "integrationStatus" VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    "supportPhone" VARCHAR(30),
    "supportEmail" VARCHAR(100),
    website VARCHAR(255),
    "revenueSharePercent" DOUBLE PRECISION NOT NULL DEFAULT 85.00,
    "uptimePercent30d" DOUBLE PRECISION NOT NULL DEFAULT 99.00,
    "syncFrequencySeconds" INTEGER NOT NULL DEFAULT 300,
    endpoints JSONB,
    credentials JSONB,
    "lastSyncAt" TIMESTAMP WITHOUT TIME ZONE,
    "createdAt" TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT now(),
    "updatedAt" TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT now(),
    CONSTRAINT "UQ_cpos_party_country" UNIQUE ("partyId", "countryCode")
);

-- 5. Charging Stations
CREATE TABLE IF NOT EXISTS public.charging_stations (
    id VARCHAR(64) PRIMARY KEY,
    "cpoId" VARCHAR(64) NOT NULL,
    name VARCHAR(150) NOT NULL,
    address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    pincode VARCHAR(20) NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'AVAILABLE',
    "ocppIdentity" VARCHAR(100) UNIQUE,
    "ocppVersion" VARCHAR(20) DEFAULT 'ocpp1.6',
    "ocppProtocol" VARCHAR(20) DEFAULT 'ocpp1.6',
    "firmwareVersion" VARCHAR(50),
    "chargePointVendor" VARCHAR(100),
    "chargePointModel" VARCHAR(100),
    "heartbeatIntervalSeconds" INTEGER NOT NULL DEFAULT 60,
    "lastHeartbeat" TIMESTAMP WITHOUT TIME ZONE,
    "isOnline" BOOLEAN NOT NULL DEFAULT false,
    "supportContact" VARCHAR(50),
    "powerOutputKw" DOUBLE PRECISION NOT NULL DEFAULT 3.3,
    amenities JSONB,
    pricing JSONB,
    "pricingPerKwhPaise" BIGINT NOT NULL DEFAULT 1200,
    "ratingAverage" DOUBLE PRECISION NOT NULL DEFAULT 4.5,
    "ratingCount" INTEGER NOT NULL DEFAULT 0,
    "operatingHours" VARCHAR(100) DEFAULT '24x7',
    "parkingType" VARCHAR(50) DEFAULT 'PUBLIC',
    "createdAt" TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT now(),
    "updatedAt" TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT now(),
    CONSTRAINT "FK_stations_cpo" FOREIGN KEY ("cpoId") REFERENCES public.cpos(id) ON DELETE RESTRICT
);

-- 6. Connectors
CREATE TABLE IF NOT EXISTS public.connectors (
    id VARCHAR(64) PRIMARY KEY,
    "stationId" VARCHAR(64) NOT NULL,
    "connectorId" INTEGER NOT NULL,
    type VARCHAR(32) NOT NULL,
    "maxPowerKw" DOUBLE PRECISION NOT NULL,
    "currentType" VARCHAR(10) NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'AVAILABLE',
    "lastStatusChange" TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT now(),
    tariff JSONB,
    "pricePerKwhPaise" BIGINT NOT NULL DEFAULT 1200,
    "createdAt" TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT now(),
    "updatedAt" TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT now(),
    CONSTRAINT "UQ_station_connector" UNIQUE ("stationId", "connectorId"),
    CONSTRAINT "FK_connectors_station" FOREIGN KEY ("stationId") REFERENCES public.charging_stations(id) ON DELETE CASCADE
);

-- 7. Charging Sessions
CREATE TABLE IF NOT EXISTS public.charging_sessions (
    id VARCHAR(64) PRIMARY KEY,
    "userId" VARCHAR(64) NOT NULL,
    "stationId" VARCHAR(64) NOT NULL,
    "stationName" VARCHAR(128) NOT NULL,
    "connectorId" VARCHAR(64) NOT NULL,
    "connectorType" VARCHAR(32) NOT NULL,
    "chargePointId" VARCHAR(64) NOT NULL,
    "transactionId" INTEGER,
    status VARCHAR(32) NOT NULL DEFAULT 'REQUESTED',
    target JSONB,
    "startTime" TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    "endTime" TIMESTAMP WITHOUT TIME ZONE,
    "initialSocPercent" INTEGER,
    "currentSocPercent" INTEGER,
    "targetSocPercent" INTEGER,
    "currentPowerKw" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalEnergyKwh" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "energyDeliveredKwh" NUMERIC(10,4) NOT NULL DEFAULT 0.0000,
    "totalCostPaise" BIGINT NOT NULL DEFAULT 0,
    "costBreakdown" JSONB,
    "stopReason" VARCHAR(64),
    "lastTelemetryAt" TIMESTAMP WITHOUT TIME ZONE,
    "createdAt" TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT now(),
    "updatedAt" TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT now(),
    CONSTRAINT "FK_sessions_user" FOREIGN KEY ("userId") REFERENCES public.users(id) ON DELETE RESTRICT,
    CONSTRAINT "FK_sessions_station" FOREIGN KEY ("stationId") REFERENCES public.charging_stations(id) ON DELETE RESTRICT
);

-- 8. Meter Values (OCPP Telemetry)
CREATE TABLE IF NOT EXISTS public.meter_values (
    id VARCHAR(64) PRIMARY KEY,
    "sessionId" VARCHAR(64) NOT NULL,
    "chargePointId" VARCHAR(64) NOT NULL,
    "connectorId" INTEGER NOT NULL,
    "timestamp" TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    "energyActiveImportRegister" NUMERIC(12,4) NOT NULL,
    "powerActiveImport" NUMERIC(10,2),
    "socPercent" INTEGER,
    voltage NUMERIC(8,2),
    current NUMERIC(8,2),
    temperature NUMERIC(6,2),
    "rawPayload" JSONB,
    "createdAt" TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT now(),
    CONSTRAINT "FK_meter_values_session" FOREIGN KEY ("sessionId") REFERENCES public.charging_sessions(id) ON DELETE CASCADE
);

-- 9. Finance Ledger (Double-Entry Financial Accounting)
CREATE TABLE IF NOT EXISTS public.finance_ledger (
    id VARCHAR(64) PRIMARY KEY,
    "userId" VARCHAR(64) NOT NULL,
    type VARCHAR(32) NOT NULL,
    amount NUMERIC(14,2) NOT NULL,
    currency VARCHAR(8) NOT NULL DEFAULT 'INR',
    "balanceAfter" NUMERIC(14,2) NOT NULL,
    "referenceType" VARCHAR(32) NOT NULL,
    "referenceId" VARCHAR(128) NOT NULL UNIQUE,
    description TEXT NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'COMPLETED',
    metadata JSONB,
    "createdAt" TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT now(),
    CONSTRAINT "FK_ledger_user" FOREIGN KEY ("userId") REFERENCES public.users(id) ON DELETE RESTRICT
);

-- 10. Audit Logs (Security & Compliance)
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id VARCHAR(64) PRIMARY KEY,
    "actorId" VARCHAR(64) NOT NULL,
    "actorName" VARCHAR(128) NOT NULL,
    "actorRole" VARCHAR(64) NOT NULL,
    action VARCHAR(64) NOT NULL,
    "targetEntity" VARCHAR(64) NOT NULL,
    "targetId" VARCHAR(64) NOT NULL,
    "previousValue" JSONB,
    "newValue" JSONB,
    reason TEXT,
    "ipAddress" VARCHAR(64),
    "timestamp" TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT now()
);

-- =============================================================================
-- Performance & Spatial Indexes
-- =============================================================================
CREATE INDEX IF NOT EXISTS "IDX_stations_spatial" ON public.charging_stations USING gist (
    ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)::geography
);
CREATE INDEX IF NOT EXISTS "IDX_stations_city" ON public.charging_stations (city);
CREATE INDEX IF NOT EXISTS "IDX_stations_status" ON public.charging_stations (status);

CREATE INDEX IF NOT EXISTS "IDX_connectors_stationId" ON public.connectors ("stationId");
CREATE INDEX IF NOT EXISTS "IDX_connectors_status" ON public.connectors (status);

CREATE INDEX IF NOT EXISTS "IDX_sessions_userId" ON public.charging_sessions ("userId");
CREATE INDEX IF NOT EXISTS "IDX_sessions_stationId" ON public.charging_sessions ("stationId");
CREATE INDEX IF NOT EXISTS "IDX_sessions_status" ON public.charging_sessions (status);

CREATE INDEX IF NOT EXISTS "IDX_meter_values_sessionId" ON public.meter_values ("sessionId");
CREATE INDEX IF NOT EXISTS "IDX_meter_values_timestamp" ON public.meter_values ("timestamp" DESC);

CREATE INDEX IF NOT EXISTS "IDX_finance_ledger_userId" ON public.finance_ledger ("userId");
CREATE INDEX IF NOT EXISTS "IDX_audit_logs_actorId" ON public.audit_logs ("actorId");
CREATE INDEX IF NOT EXISTS "IDX_audit_logs_timestamp" ON public.audit_logs ("timestamp" DESC);

-- =============================================================================
-- Initial Admin Seed (Default Superadmin)
-- Password Hash below is for: Admin@12345 (BCrypt hash)
-- =============================================================================
INSERT INTO public.admin_users (id, email, name, "passwordHash", role, status, department)
VALUES (
    'admin_super_001',
    'admin@chargemesh.com',
    'Super Admin',
    '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW',
    'SUPER_ADMIN',
    'ACTIVE',
    'Operations'
)
ON CONFLICT (email) DO NOTHING;
