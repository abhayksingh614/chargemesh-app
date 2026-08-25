# ChargeMesh — REST & Telemetry API Documentation

> **Status:** ⚠️ PLANNED — Not yet implemented or connected to the mobile app.
> The backend NestJS API is scaffolded only. The mobile app currently uses local mock data.
> This document describes the intended future API. See [`ARCHITECTURE.md`](ARCHITECTURE.md) for current state.

## 1. Authentication Endpoints

### `POST /api/v1/auth/register`
- **Description**: Registers a new driver profile with phone number & vehicle details.
- **Request Body**:
  ```json
  {
    "phoneNumber": "+919876543210",
    "name": "Rahul",
    "vehicle": {
      "make": "Tata",
      "model": "Nexon EV Max",
      "connectorType": "CCS2",
      "batteryCapacity": 40.5
    }
  }
  ```
- **Response**: `201 Created` with JWT token.

### `POST /api/v1/auth/login`
- **Description**: Driver login via OTP or credentials.

---

## 2. Station & Connector Endpoints

### `GET /api/v1/stations`
- **Description**: Retrieves charging stations in geographic bounding box or radius.
- **Query Parameters**: `lat`, `lng`, `radiusKm`, `connectorType`, `minPowerKw`
- **Response**:
  ```json
  [
    {
      "id": "st-001",
      "name": "Connaught Place Fast Charging Hub",
      "network": "Tata Power EZ Charge",
      "latitude": 28.6315,
      "longitude": 77.2167,
      "distance": "1.2 km",
      "rating": 4.8,
      "connectors": [
        {
          "id": "conn-01",
          "type": "CCS2",
          "powerKw": 60,
          "status": "Available",
          "pricePerKwh": 18.50
        }
      ]
    }
  ]
  ```

---

## 3. Session Control Endpoints

### `POST /api/v1/sessions/start`
- **Description**: Initiates remote charging session on target connector.
- **Request Body**:
  ```json
  {
    "stationId": "st-001",
    "connectorId": "conn-01",
    "target": {
      "type": "SOC",
      "value": 85
    }
  }
  ```

### `POST /api/v1/sessions/:id/stop`
- **Description**: Stops an active charging session.

### `GET /api/v1/sessions/:id/telemetry`
- **Description**: WebSocket stream endpoint for live charging metrics (`SoC`, `kW`, `kWh`, `Cost`).
