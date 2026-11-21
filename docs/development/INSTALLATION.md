# ChargeMesh — Local Installation & Setup Guide

This guide provides step-by-step instructions to configure, run, and verify the complete ChargeMesh platform across all workspaces.

---

## 1. System Prerequisites

Before beginning, ensure your host environment meets the following specifications:

| Component | Minimum Version | Recommended Version | Purpose |
| :--- | :--- | :--- | :--- |
| **Node.js** | `>= 20.11.0 LTS` | `20.18.0 LTS` | Monorepo runtime |
| **npm** | `>= 10.2.0` | `10.8.2` | Workspace package management |
| **Docker** | `>= 24.0.0` | `26.1.0` | PostgreSQL and Redis containers |
| **Docker Compose** | `>= 2.20.0` | `2.27.0` | Multi-container orchestration |
| **Java JDK** | `17 LTS` | `OpenJDK 17` | Android Gradle compilation |
| **Android Studio** | Hedgehog (2023.1.1) | Koala (2024.1.1) | Android SDK, NDK, Platform-tools |
| **Xcode (macOS only)** | `15.0+` | `15.4+` | iOS CocoaPods & simulator |

---

## 2. Monorepo Installation

Clone the repository and install dependencies across all workspaces from the project root:

```bash
# 1. Clone repository
git clone https://github.com/abhayksingh614/chargemesh-app.git
cd chargemesh-app

# 2. Install monorepo dependencies
npm install

# 3. Verify type safety across all 5 workspaces
npm run typecheck
```

---

## 3. Infrastructure Initialization (PostgreSQL & Redis)

Start the local database and cache services using Docker Compose:

```bash
# Launch PostgreSQL 16 (with PostGIS) and Redis 7 in detached mode
docker compose up -d postgres redis

# Verify service health status
docker compose ps
```

Default local service ports:
- **PostgreSQL 16:** `localhost:5434` (mapped from container 5432)
- **Redis 7:** `localhost:6379`

The database automatically initializes schema and PostGIS extensions via [docker/postgres/init.sql](file:///c:/Users/aksde/Videos/My_Codex/Chargemesh_app/docker/postgres/init.sql).

---

## 4. Starting Platform Services

### Step 4.1: Start the Backend CSMS Gateway
```bash
# In terminal 1 (from repository root)
npm --workspace=@chargemesh/backend run dev
```
- **REST API:** `http://localhost:3000/api/v1`
- **OCPP 1.6-J / 2.0.1 WebSocket:** `ws://localhost:3000/ocpp/:chargePointId`
- **Live Telemetry WebSocket:** `ws://localhost:3000/telemetry`
- **Health Checks:** `http://localhost:3000/api/v1/health`

### Step 4.2: Start the Operations Admin Portal
```bash
# In terminal 2 (from repository root)
npm --workspace=@chargemesh/admin run dev
```
- Open browser at: `http://localhost:3001`
- **Default Super Admin:** `admin@chargemesh.com` / `Dev@ChargeMesh2026!`

### Step 4.3: Start the Driver Mobile App (React Native)
```bash
# In terminal 3 (Start Metro Bundler)
npm --workspace=@chargemesh/mobile run start

# In terminal 4 (Launch on connected Android device / emulator)
npm --workspace=@chargemesh/mobile run android

# Or on macOS for iOS:
# cd apps/mobile/ios && pod install && cd ../../..
# npm --workspace=@chargemesh/mobile run ios
```

---

## 5. Verification & Testing

Verify that your installation is fully functional by executing the automated test suite:

```bash
# Execute unit & integration test suites (115 tests across 19 suites)
npm run test

# Validate production builds
npm run build:backend
npm run build:admin
```
