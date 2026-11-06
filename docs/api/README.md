# ChargeMesh — API & Gateway Specifications

This directory serves as the documentation hub for all ChargeMesh APIs and communication protocols.

---

## Documentation Index

- [**Complete API Documentation (`docs/API_DOCUMENTATION.md`)**](../API_DOCUMENTATION.md): Full REST endpoint specifications, request/response JSON schemas, authentication headers, error codes, and query parameters.
- [**CPO & Protocol Handlers (`docs/CPO_AND_STATIONS.md`)**](../CPO_AND_STATIONS.md): Data contracts for Charge Point Operators, connectors, and tariff models.
- [**OCPP Architecture & Workflow (`docs/architecture/cpo_integration_workflow.md`)**](../architecture/cpo_integration_workflow.md): Message sequences for OCPP 1.6-J and 2.0.1 (`BootNotification`, `StatusNotification`, `StartTransaction`, `StopTransaction`, `MeterValues`).

---

## Protocols Supported

1. **REST API (`/api/v1`):** HTTP endpoints for driver authentication, geospatial station discovery, session management, and administrative moderation.
2. **OCPP WebSocket Gateway (`/ocpp`):** Standard CSMS WebSocket server for physical charger connections.
3. **Telemetry WebSocket Gateway (`/telemetry`):** Low-latency push notifications for live session metrics.
