# ChargeMesh Admin Dashboard — REST & WebSocket API Specification

All Admin endpoints require a valid Admin Bearer JWT token in the `Authorization` header (`Authorization: Bearer <token>`) and are governed by RBAC guards.

---

## 1. Authentication Endpoints

### `POST /api/v1/admin/auth/login`
- **Purpose**: Authenticates an administrator via email and secure credentials or OTP.
- **Request Body**:
  ```json
  {
    "email": "admin@chargemesh.com",
    "password": "SecurePassword123!"
  }
  ```
- **Response `200 OK`**:
  ```json
  {
    "success": true,
    "data": {
      "token": "eyJhbGciOiJIUzI1NiIsIn...",
      "admin": {
        "id": "adm-001",
        "name": "Operations Lead",
        "email": "admin@chargemesh.com",
        "role": "SUPER_ADMIN"
      }
    }
  }
  ```

---

## 2. Executive Dashboard Endpoints

### `GET /api/v1/admin/dashboard/stats`
- **Purpose**: Retrieves high-level network health, charging stats, and financial totals.
- **Response `200 OK`**:
  ```json
  {
    "success": true,
    "data": {
      "totalUsers": 12850,
      "activeDrivers24h": 940,
      "totalCpos": 12,
      "totalStations": 480,
      "chargers": {
        "available": 312,
        "inUse": 124,
        "unavailable": 18,
        "offline": 26,
        "stale": 8
      },
      "todayRevenueInr": 184500.0,
      "todayEnergyKwh": 9240.5,
      "todayCo2SavedKg": 6560.7,
      "activeLiveSessions": 42
    }
  }
  ```

---

## 3. User & Driver Management Endpoints

### `GET /api/v1/admin/users`
- **Query Parameters**: `search`, `status`, `tier`, `page` (default 1), `pageSize` (default 20).
- **Response `200 OK`**: Returns `PaginatedResponse<UserProfile>`.

### `PUT /api/v1/admin/users/:id/status`
- **Request Body**:
  ```json
  {
    "status": "SUSPENDED",
    "reason": "Suspicious charge activity investigation #TKT-8912"
  }
  ```

---

## 4. CPO & Station Management Endpoints

### `GET /api/v1/admin/cpos`
- **Response `200 OK`**: Returns list of all CPOs with sync status, station counts, and uptime percentages.

### `POST /api/v1/admin/cpos/:id/trigger-sync`
- **Purpose**: Manually triggers an OCPI module synchronization run (Locations/Tariffs/Sessions).

### `POST /api/v1/admin/chargers/:id/remote-command`
- **Request Body**:
  ```json
  {
    "command": "RemoteStopTransaction" | "Reset" | "UnlockConnector",
    "reason": "Driver emergency call #9912"
  }
  ```

---

## 5. Financial & Wallet Endpoints

### `GET /api/v1/admin/finance/transactions`
- **Query Parameters**: `startDate`, `endDate`, `type`, `status`, `minAmount`, `userId`.
- **Response `200 OK`**: Returns paginated transaction ledger.

### `POST /api/v1/admin/wallet/adjust-balance`
- **Request Body**:
  ```json
  {
    "userId": "usr-abhay-01",
    "amountRupees": 250.0,
    "isCredit": true,
    "reason": "Goodwill gesture for charger malfunction at Cyber Hub",
    "referenceTicketId": "TKT-8841"
  }
  ```

---

## 6. Audit Log Endpoints

### `GET /api/v1/admin/audit-logs`
- **Query Parameters**: `actorId`, `targetEntity`, `action`, `startDate`, `endDate`, `page`, `pageSize`.
- **Response `200 OK`**: Returns immutable audit trail entries with previous and new values.
