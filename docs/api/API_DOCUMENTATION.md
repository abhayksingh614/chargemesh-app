# ChargeMesh — REST & WebSocket API Specification

**Base URL:** `http://localhost:3000/api/v1`  
**WebSocket Base:** `ws://localhost:3000`  
**Authentication Scheme:** Bearer JWT in `Authorization` header  

---

## 1. Authentication & Driver Identity (`/auth`)

### 1.1 Dispatch OTP
- **Endpoint:** `POST /api/v1/auth/otp/send`
- **Rate Limit:** 5 requests / minute
- **Request Body:**
  ```json
  { "phoneNumber": "+919876543210" }
  ```
- **Response (`200 OK`):**
  ```json
  { "success": true, "message": "OTP dispatched successfully" }
  ```

### 1.2 Driver Login
- **Endpoint:** `POST /api/v1/auth/login`
- **Request Body:**
  ```json
  { "phoneNumber": "+919876543210", "otp": "123456" }
  ```
- **Response (`200 OK`):**
  ```json
  {
    "success": true,
    "data": {
      "token": "eyJhbGciOiJIUzI1NiIsIn...",
      "user": {
        "id": "usr-abhay-01",
        "name": "Abhay Singh",
        "phoneNumber": "+919876543210",
        "walletBalancePaise": 204000
      }
    }
  }
  ```

### 1.3 Driver Profile
- **Endpoint:** `GET /api/v1/auth/me`
- **Headers:** `Authorization: Bearer <token>`
- **Response (`200 OK`):** Full UserProfile entity including vehicle metadata.

---

## 2. Charging Stations & Discovery (`/stations`)

### 2.1 Geospatial Station Discovery
- **Endpoint:** `GET /api/v1/stations`
- **Query Parameters:** `lat`, `lng`, `radiusKm`, `connectorType`, `minPowerKw`
- **Response (`200 OK`):**
  ```json
  [
    {
      "id": "st-delhi-001",
      "chargePointId": "CP-DELHI-001",
      "name": "Connaught Place Supercharge Hub",
      "operator": "Tata Power EZ Charge",
      "latitude": 28.6315,
      "longitude": 77.2167,
      "distance": "1.2 km",
      "rating": 4.8,
      "connectors": [
        {
          "id": "conn-01",
          "connectorNumber": 1,
          "type": "CCS2",
          "powerKw": 60,
          "status": "AVAILABLE",
          "pricePerKwh": 18.5
        }
      ]
    }
  ]
  ```

### 2.2 Update Station Tariff (Admin)
- **Endpoint:** `PUT /api/v1/stations/:id/tariff`
- **Request Body:** `{ "tariffPerKwh": 19.5 }`
- **Response (`200 OK`):** `{ "success": true, "tariffPerKwh": 19.5 }`

---

## 3. Charging Sessions (`/sessions`)

### 3.1 Start Charging Session
- **Endpoint:** `POST /api/v1/sessions/start`
- **Request Body:**
  ```json
  {
    "stationId": "st-delhi-001",
    "connectorId": "conn-01",
    "target": { "type": "SOC", "value": 80 }
  }
  ```
- **Response (`201 Created`):**
  ```json
  {
    "id": "ses-1795200",
    "status": "CHARGING",
    "startTime": "2026-11-21T02:00:00.000Z",
    "powerKw": 60,
    "pricePerKwh": 18.5
  }
  ```

### 3.2 Stop Charging Session
- **Endpoint:** `POST /api/v1/sessions/:id/stop`
- **Request Body:** `{ "reason": "USER_STOPPED" }`
- **Response (`200 OK`):** Settles energy consumption and returns final invoice total.

---

## 4. Wallet & Financial Ledger (`/wallet`)

### 4.1 Get Wallet Balance
- **Endpoint:** `GET /api/v1/wallet/balance`
- **Response (`200 OK`):**
  ```json
  {
    "walletBalancePaise": 204000,
    "walletHeldPaise": 0,
    "availableBalancePaise": 204000,
    "balanceRupees": 2040.0
  }
  ```

### 4.2 Create Top-Up Order
- **Endpoint:** `POST /api/v1/wallet/order`
- **Request Body:** `{ "amountRupees": 500 }`
- **Response (`201 Created`):** `{ "orderId": "order_Hj3...", "amountPaise": 50000, "keyId": "rzp_test_..." }`

### 4.3 Verify Payment Webhook / Order
- **Endpoint:** `POST /api/v1/wallet/verify`
- **Verification:** Cryptographic signature verified against Razorpay secret.

---

## 5. Operations & Administration (`/admin`)

- `POST /api/v1/admin/auth/login`: Administrator authentication
- `GET /api/v1/admin/dashboard/stats`: Platform-wide KPI counters
- `GET /api/v1/admin/dashboard/sessions`: Network live and historical charging sessions
- `GET /api/v1/admin/users`: Driver directory with pagination
- `PUT /api/v1/admin/users/:id/status`: Account activation / suspension
- `GET /api/v1/admin/finance/transactions`: Full double-entry financial ledger
- `POST /api/v1/admin/finance/wallet/adjust`: Administrative goodwill credits / debits
- `GET /api/v1/admin/cpos`: CPO partner status and metrics
- `POST /api/v1/admin/cpos/:id/trigger-sync`: Trigger OCPI synchronization
- `GET /api/v1/admin/audit-logs`: Immutable platform audit trail

---

## 6. Protocols & Gateways

- **OCPP 1.6-J / 2.0.1 WebSocket:** `ws://localhost:3000/ocpp/:chargePointId`
- **Live Driver Telemetry:** `ws://localhost:3000/telemetry`
- **Health & Readiness:** `GET /health`, `GET /health/ready`, `GET /health/live`
