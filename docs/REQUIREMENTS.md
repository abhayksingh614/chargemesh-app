# ChargeMesh — Requirements Specification

> **Status:** ⚠️ HISTORICAL — This is a pre-development requirements document from the planning phase.
> For the current implemented feature status, see [`PRODUCT_FEATURES.md`](PRODUCT_FEATURES.md).

## 1. Functional Requirements (FR)

### FR-01: Station Discovery & Navigation
- System shall display nearby charging stations with location, distance, and connector availability on a map.
- System shall support filtering stations by connector type (CCS2, Type 2, CHAdeMO, GB/T), minimum charging speed (kW), and network operator.

### FR-02: QR Scan & Charger Activation
- Driver app shall scan physical station QR codes to instantly identify station ID and connector ID.
- App shall validate connector state and prompt user to configure pre-charge parameters.

### FR-03: Charging Session Control
- System shall support configuring charging target by:
  - Full Charge (100% SoC)
  - Target Energy (kWh)
  - Target Amount (INR)
  - Target Time Duration (Minutes)
- System shall issue remote start/stop commands via OCPP Central System.

### FR-04: Live Telemetry & Session Monitoring
- During an active session, system shall stream live metrics at high frequency:
  - Current SoC (%)
  - Instantaneous power (kW)
  - Delivered energy (kWh)
  - Elapsed time & estimated time remaining
  - Current session cost
- Driver shall receive real-time push notifications on milestone completion or unexpected session termination.

### FR-05: Payment & Receipt Generation
- System shall calculate billing based on active tariff (energy rate, parking fee, base fee).
- System shall generate a detailed receipt and store the session record in driver charging history.

---

## 2. Non-Functional Requirements (NFR)

- **Performance**: Mobile app map rendering under 2 seconds; telemetry updates under 1 second latency.
- **Reliability & Availability**: Backend OCPP handler availability ≥ 99.9%.
- **Data Freshness**: Connector status refreshed within 5 seconds of CPO state change.
- **Security**: End-to-end TLS 1.3 encryption, JWT auth, role-based access control, PCI-DSS compliant payment processing.
