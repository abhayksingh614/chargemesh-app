# ChargeMesh — Environment & Configuration Reference

This document provides a comprehensive specification of all environment variables used across the ChargeMesh platform.

---

## 1. Security & Hygiene Principles

1. **Never Commit `.env` Files:** All `.env`, `.env.local`, and `.env.production` files are strictly excluded from version control via `.gitignore`.
2. **Template Synchronization:** Every workspace maintains an `.env.example` file containing safe placeholder values and descriptive annotations.
3. **Production Validation:** The NestJS backend enforces fail-closed startup validation (`env.validation.ts`). In production, missing or default development secrets immediately halt process execution.

---

## 2. Root & Docker Environment Variables (`.env.example`)

| Variable | Type | Default / Example | Description |
| :--- | :--- | :--- | :--- |
| `NODE_ENV` | String | `development` | Runtime environment (`development`, `test`, `production`) |
| `DB_HOST` | String | `localhost` | PostgreSQL host |
| `DB_PORT` | Number | `5434` | PostgreSQL port |
| `DB_NAME` | String | `chargemesh_dev` | Database name |
| `DB_USER` | String | `chargemesh` | Database username |
| `DB_PASSWORD` | String | `chargemesh_dev_password` | Database password |
| `REDIS_HOST` | String | `localhost` | Redis server host |
| `REDIS_PORT` | Number | `6379` | Redis server port |
| `REDIS_PASSWORD` | String | *(empty)* | Redis password (required in production) |
| `JWT_SECRET` | String | `your_jwt_secret_here_min_64_chars` | Stateless JWT HMAC secret (min 32 chars) |
| `JWT_EXPIRES_IN` | String | `15m` | Access token lifespan |
| `RAZORPAY_KEY_ID` | String | `rzp_test_xxxxxxxxxxxx` | Razorpay sandbox API key ID |
| `RAZORPAY_KEY_SECRET` | String | `your_razorpay_key_secret_here` | Razorpay webhook verification secret |

---

## 3. Backend Gateway Configuration (`apps/backend/.env.example`)

| Variable | Default Value | Description |
| :--- | :--- | :--- |
| `PORT` | `3000` | HTTP and WebSocket listener port |
| `DB_SYNCHRONIZE` | `false` | TypeORM auto-sync (disabled in production) |
| `DB_MIGRATIONS_RUN` | `true` | Automatically execute database migrations |
| `CORS_ORIGINS` | `http://localhost:3000,http://localhost:3001` | Permitted origins for administrative access |
| `OCPP_HEARTBEAT_INTERVAL` | `60` | OCPP Heartbeat interval in seconds |

---

## 4. Admin Portal Configuration (`apps/admin/.env.example`)

| Variable | Default Value | Description |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_ADMIN_API_URL` | `http://localhost:3000/api/v1/admin` | Backend administrative REST API base URL |
| `NEXT_PUBLIC_API_URL` | `http://localhost:3000/api/v1` | Backend public REST API base URL |
| `NEXTAUTH_SECRET` | `your_nextauth_secret_min_32_chars` | Session encryption secret |

---

## 5. Driver Mobile App Configuration (`apps/mobile/.env.example`)

| Variable | Default Value | Description |
| :--- | :--- | :--- |
| `EXPO_PUBLIC_API_URL` | `http://10.0.2.2:3000/api/v1` | Backend API URL (use local IP for physical devices) |
| `RAZORPAY_KEY_ID` | `rzp_test_xxxxxxxxxxxx` | Razorpay client key ID (Public only) |
