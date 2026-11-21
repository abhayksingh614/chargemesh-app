# ChargeMesh — CPO & Station Data Model

> **Version:** 1.2.5 | **Updated:** 2026-08-24  
> **Canonical Source:** `apps/mobile/src/services/mockData.ts` + `packages/shared-types/index.ts`

---

## 1. Overview

ChargeMesh aggregates multiple Charge Point Operators (CPOs) into a unified interface. This document describes the data model for CPOs and charging stations as implemented in the current mobile app.

> **Current status:** All CPO and station data comes from `mockData.ts` (local mock). Backend API integration is planned for Phase 2.

---

## 2. CPO (Charge Point Operator)

### 2.1 Data Model

```typescript
interface Cpo {
  id: string;                      // Unique CPO identifier
  name: string;                    // Display name
  partyId: string;                 // 2-character OCPI party ID
  countryCode: string;             // ISO 3166-1 alpha-2 (e.g., 'IN')
  protocol: CpoProtocol;          // Integration protocol
  integrationStatus: CpoIntegrationStatus;
  supportPhone: string;            // Customer support number
  createdAt: string;               // ISO timestamp
  updatedAt: string;               // ISO timestamp
}
```

### 2.2 Enums

```typescript
enum CpoProtocol {
  OCPI_2_3 = 'OCPI_2_3',         // OCPI 2.3.0 (current standard)
  OCPI_2_1_1 = 'OCPI_2_1_1',     // Older OCPI version
  PROPRIETARY = 'PROPRIETARY',    // Proprietary/custom adapter
}

enum CpoIntegrationStatus {
  ACTIVE = 'ACTIVE',              // Live and integrated
  PENDING = 'PENDING',            // In onboarding/testing
  SUSPENDED = 'SUSPENDED',        // Temporarily inactive
  INACTIVE = 'INACTIVE',          // Not connected
}
```

### 2.3 Mock CPOs (6 networks)

| CPO ID | Name | Party ID | Support |
|--------|------|----------|---------|
| `cpo-tata` | Tata Power EZ Charge | TP | 1800-209-5161 |
| `cpo-jiobp` | Jio-bp pulse | JB | 1800-891-9023 |
| `cpo-statiq` | Statiq Grid | SQ | +91-9876543210 |
| `cpo-chargezone` | ChargeZone | CZ | 1800-120-2223 |
| `cpo-ather` | Ather Grid | AG | 1800-103-0055 |
| `cpo-zeon` | Zeon Charging | ZC | 1800-572-8888 |

---

## 3. Location (Charging Station)

### 3.1 Data Model

```typescript
interface Location {
  id: string;                      // Unique station identifier
  cpoId: string;                   // Reference to owning CPO
  name: string;                    // Station display name
  address: string;                 // Street address
  city: string;                    // City
  state: string;                   // State/UT name
  coordinates: {
    latitude: number;
    longitude: number;
  };
  amenities: string[];             // Available amenities
  images: string[];                // Image URLs (future use)
  connectors: Connector[];         // Array of charge points/bays
  createdAt: string;
  updatedAt: string;
}
```

### 3.2 Mock Stations (20 stations)

The mock data includes 20 stations spread across major Indian cities. Each station belongs to one of the 6 mock CPOs.

| Stations | Coverage |
|----------|---------|
| 20 mock stations | Delhi NCR, Mumbai, Bangalore, Hyderabad, Chennai, Pune |
| 6 CPO networks | Tata Power, Jio-bp, Statiq, ChargeZone, Ather, Zeon |
| Multiple connector types | CCS2, CHAdeMO, AC Type-2, Bharat AC, Bharat DC |

---

## 4. Connector (Charge Point Bay)

### 4.1 Data Model

```typescript
interface Connector {
  id: string;                      // Unique connector ID within station
  locationId: string;              // Parent station ID
  connectorType: ConnectorType;    // Physical connector standard
  powerType: PowerType;            // AC or DC
  maxPowerKw: number;              // Maximum power output
  status: ConnectorStatus;         // Live status
  freshnessState: FreshnessState;  // Telemetry freshness
  pricePerKwh: number;             // Tariff in ₹/kWh
  lastStatusAt: string;            // ISO timestamp of last status update
}
```

### 4.2 Connector Type Enum

```typescript
enum ConnectorType {
  CCS2 = 'CCS2',                  // Combined Charging System 2 (DC)
  CHADEMO = 'CHADEMO',            // CHAdeMO (DC, legacy)
  TYPE2 = 'TYPE2',                // IEC 62196 Type 2 Mennekes (AC)
  BHARAT_AC001 = 'BHARAT_AC001',  // Bharat AC-001 (India, 3.3 kW)
  BHARAT_DC001 = 'BHARAT_DC001',  // Bharat DC-001 (India, 15 kW)
}
```

### 4.3 Power Type Enum

```typescript
enum PowerType {
  AC_1_PHASE = 'AC_1_PHASE',      // Single-phase AC
  AC_3_PHASE = 'AC_3_PHASE',      // Three-phase AC
  DC = 'DC',                       // Direct current
}
```

### 4.4 Connector Status Enum

```typescript
enum ConnectorStatus {
  AVAILABLE = 'AVAILABLE',          // Ready to charge
  OCCUPIED = 'OCCUPIED',            // Currently charging a vehicle
  RESERVED = 'RESERVED',            // Booked/reserved
  UNAVAILABLE = 'UNAVAILABLE',      // Out of service
  FAULTED = 'FAULTED',              // Hardware fault
  UNKNOWN = 'UNKNOWN',              // No telemetry (never shown as Available)
}
```

### 4.5 Freshness State Enum

```typescript
enum FreshnessState {
  FRESH = 'FRESH',                  // Status updated < 5 minutes ago
  STALE = 'STALE',                  // Status updated 5–60 minutes ago
  VERY_STALE = 'VERY_STALE',        // Status updated > 60 minutes ago
}
```

---

## 5. Status Display Rules

These rules are enforced across all station cards, connector cards, and map markers:

| ConnectorStatus | Display Label | Map Pin Colour | App Behaviour |
|----------------|--------------|---------------|---------------|
| `AVAILABLE` | Available | Green `#16A34A` | Show "Charge Now" CTA |
| `OCCUPIED` | In Use | Orange `#EA580C` | Show estimated wait |
| `RESERVED` | Reserved | Blue `#2563EB` | Show reservation info |
| `UNAVAILABLE` | Unavailable | Red `#DC2626` | Suppress CTA |
| `FAULTED` | Unavailable | Red `#DC2626` | Suppress CTA |
| `UNKNOWN` | Unknown | Grey `#6B7280` | **Never display as Available** |
| `STALE` (freshness) | ⚠️ Data may be outdated | — | Show freshness warning |

> ⚠️ **Critical rule:** `UNKNOWN` status must never be displayed as or implied to be `AVAILABLE`. This is a core data integrity requirement.

---

## 6. Amenities

Stations in the mock data include the following amenity codes:

| Code | Description |
|------|-------------|
| `parking` | Dedicated parking bays |
| `restrooms` | Accessible toilets |
| `cafe` / `food` | On-site café or food |
| `wifi` | Free Wi-Fi |
| `shopping` | Adjacent retail/mall |
| `covered` | Covered/indoor charging |
| `24x7` | 24-hour availability |
| `security` | CCTV or security guard |

---

## 7. Charging Session Model

```typescript
interface ChargingSession {
  id: string;
  locationId: string;
  connectorId: string;
  userId: string;
  vehicleId: string;
  status: SessionStatus;
  target: ChargeTarget;
  startTime: string;
  endTime?: string;
  energyKwh: number;               // Energy delivered
  costInr: number;                 // Total cost in ₹
  socStartPercent: number;         // Battery % at session start
  socEndPercent?: number;          // Battery % at session end
}

enum SessionStatus {
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  STOPPED = 'STOPPED',
  FAILED = 'FAILED',
}

enum ChargeTarget {
  AMOUNT = 'AMOUNT',               // Target: ₹ amount
  ENERGY = 'ENERGY',               // Target: kWh energy
  TIME = 'TIME',                   // Target: minutes duration
  FULL = 'FULL',                   // Target: full battery
}
```

---

## 8. Mock Data File Reference

| File | Content | Size |
|------|---------|------|
| `apps/mobile/src/services/mockData.ts` | 20 stations, 6 CPOs, mock sessions | ~41 KB |
| `apps/mobile/src/services/walletData.ts` | Wallet transaction history | — |

---

## 9. Future: Backend Integration

When the backend is connected (Phase 2), mock data will be replaced by:
- **REST API** calls to NestJS station/CPO endpoints
- **Real-time WebSocket** telemetry from OCPP CSMS
- **OCPI 2.3.0** roaming hub for live CPO data

The TypeScript interfaces above are shared via `@chargemesh/shared-types` and will continue to be used — only the data source changes (mock → live API).
