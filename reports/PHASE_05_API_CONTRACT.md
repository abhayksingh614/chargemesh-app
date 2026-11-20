# CHARGEMESH — PHASE 05 API CONTRACT SPECIFICATION
**Author:** Principal Software Architect | Staff API Engineer  
**Date:** 2026-11-20  
**Repository Baseline:** `b9b28481236cf6c7706955ba0de44a415ccaa1f7`  
**Scope:** Workstream N — Central System REST & WebSocket API Contract Specification

---

## 1. Global API Conventions

- **Base URL:** `/api/v1`
- **Payload Format:** JSON (`application/json; charset=utf-8`)
- **Authentication:** HTTP Bearer JWT (`Authorization: Bearer <token>`)
- **Standard Success Response Envelope:**
  ```json
  {
    "success": true,
    "data": { ... },
    "message": "Optional human-readable confirmation"
  }
  ```
- **Standard Error Response Envelope:**
  ```json
  {
    "success": false,
    "error": "Error message description",
    "statusCode": 400,
    "timestamp": "2026-11-20T12:00:00.000Z",
    "path": "/api/v1/endpoint"
  }
  ```

---

## 2. API Endpoint Matrix

### 2.1 Driver Authentication & Session Management (`/api/v1/auth`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/auth/otp/send` | Public | Request single-use 6-digit SMS OTP (rate-limited). |
| `POST` | `/auth/register` | Public | Register new driver profile with phone and vehicle. |
| `POST` | `/auth/login` | Public | Verify OTP and obtain driver JWT token. |
| `POST` | `/auth/logout` | Authenticated | Revoke current JWT token via Redis blacklist. |
| `POST` | `/auth/refresh` | Public | Rotate/refresh JWT authentication token. |
| `GET` | `/auth/me` | Driver | Retrieve authenticated driver profile and vehicle. |

### 2.2 Charging Station Discovery (`/api/v1/stations`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/stations` | Public | PostGIS spatial search (`lat`, `lng`, `radiusKm`). |
| `GET` | `/stations/:id` | Public | Retrieve station detail, connector status, and tariffs. |

### 2.3 Charging Session Control (`/api/v1/sessions`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/sessions/start` | Driver | Reserve ₹200 hold and dispatch OCPP RemoteStart. |
| `POST` | `/sessions/:id/stop` | Driver / Admin | Enforce ownership, halt charging, settle wallet. |
| `GET` | `/sessions/:id` | Driver / Admin | Retrieve charging session telemetry and metrics. |
| `GET` | `/sessions/active` | Driver | Query driver's currently ongoing session. |

### 2.4 Financial Wallet & Razorpay (`/api/v1/wallet`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/wallet/balance` | Driver | Query `walletBalancePaise`, `walletHeldPaise`, available. |
| `GET` | `/wallet/transactions` | Driver | Paginated immutable driver transaction ledger. |
| `POST` | `/wallet/order` | Driver | Create server-side Razorpay INR order. |
| `POST` | `/wallet/verify` | Driver | Verify HMAC SHA256 payment signature and credit funds. |
| `POST` | `/wallet/webhook` | Gateway | Webhook signature verified payment event receiver. |

### 2.5 Administrative & CPO Grid APIs (`/api/v1/admin`)
| Method | Endpoint | Required Role | Description |
|---|---|---|---|
| `POST` | `/admin/auth/login` | Public | Admin login with email and Bcrypt password. |
| `GET` | `/admin/auth/profile` | Any Admin | Retrieve admin profile and role. |
| `POST` | `/admin/auth/change-password` | Any Admin | Change password enforcing complexity. |
| `GET` | `/admin/auth/users` | `SUPER_ADMIN` | List all provisioned administrative users. |
| `GET` | `/admin/dashboard` | Any Admin | Real-time grid KPIs, energy, revenue, sessions. |
| `GET` | `/admin/users/drivers` | Super/Ops/Support | Query persisted drivers and account statuses. |
| `GET` | `/admin/cpos` | Super/Ops | List CPO network partners and OCPI protocols. |
| `GET` | `/admin/finance/ledger` | Super/Finance | Query authoritative platform finance ledger. |
| `GET` | `/admin/audit` | Super/Ops/Finance | Query immutable administrative audit trails. |

### 2.6 Health & DevOps (`/health`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/health` | Public | Liveness probe (process up). |
| `GET` | `/health/ready` | Public | Readiness probe (PostgreSQL & Redis connected). |

### 2.7 WebSocket Protocol Gateways
| Protocol | Path | Subprotocol | Description |
|---|---|---|---|
| `WSS` | `/ocpp` | `ocpp1.6` | OCPP 1.6-J Charge Point connection gateway. |
| `WSS` | `/telemetry` | `json` | Live driver telemetry event broadcasting stream. |

---

## 3. Contract Compliance Verdict
- Contract is fully implemented, strictly typed, and backed by automated tests.
- **Contract Status:** **LOCKED & VERIFIED**.
