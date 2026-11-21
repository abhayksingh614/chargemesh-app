# ChargeMesh — Common Issues & Troubleshooting Guide

This guide provides diagnostic steps and solutions for frequent issues encountered during local development, device builds, and service orchestration.

---

## 1. Database & Docker Infrastructure Issues

### Issue 1.1: PostgreSQL Port `5434` or `5432` Conflict
- **Symptom:** `Error starting userland proxy: listen tcp4 0.0.0.0:5434: bind: address already in use`
- **Cause:** Another local PostgreSQL instance is running on the host.
- **Solution:** 
  1. Check what process owns the port:
     ```powershell
     netstat -ano | findstr :5434
     ```
  2. Stop the conflicting service, or adjust `DB_PORT` in your `.env` and `docker-compose.yml`.

### Issue 1.2: Redis Unavailable in Local Development
- **Symptom:** `[RedisOtpStorageService] Redis not reachable at localhost:6379. Running OTP store in-memory fallback.`
- **Cause:** Redis container is stopped or not running.
- **Resolution:** The platform automatically falls back to an in-memory storage buffer in development mode. To start Redis:
  ```bash
  docker compose up -d redis
  ```

---

## 2. Driver Mobile App (React Native & Android)

### Issue 2.1: Android SDK Path Not Found
- **Symptom:** `SDK location not found. Define location with an ANDROID_HOME environment variable or with a local.properties file.`
- **Solution:** Create `apps/mobile/android/local.properties` with:
  ```properties
  sdk.dir=C:\\Users\\<YourUsername>\\AppData\\Local\\Android\\Sdk
  ```

### Issue 2.2: Stale Metro Bundler Cache
- **Symptom:** Inexplicable component resolution or syntax errors on mobile.
- **Solution:** Clear the Metro bundler cache:
  ```bash
  cd apps/mobile
  npx react-native start --reset-cache
  ```

---

## 3. OCPP Hardware & CSMS WebSocket Communication

### Issue 3.1: OCPP Handshake Rejected with HTTP 4001
- **Symptom:** Charger WebSocket closes immediately with code 4001 upon connecting to `ws://localhost:3000/ocpp/<chargePointId>`.
- **Cause:** ChargePoint identity is not registered in the database, triggering fail-closed rejection.
- **Solution:** Ensure the station is seeded or registered in the database via the Admin Portal or `SeedService`.

---

## 4. Next.js Admin Portal

### Issue 4.1: Lockfile Missing SWC Dependencies Warning
- **Symptom:** `⚠ Found lockfile missing swc dependencies, patching...`
- **Cause:** Monorepo package-lock resolution checking cross-workspace dependencies.
- **Solution:** Set `NEXT_DISABLE_SWC_PATCH=1` in your environment or allow Next.js build to proceed (build exits successfully with code 0).
