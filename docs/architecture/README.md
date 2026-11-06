# ChargeMesh — System Architecture Documentation

This directory contains the canonical system architecture specifications and Mermaid diagrams for ChargeMesh.

---

## Architecture Diagrams Index

| Document | Focus Area | Description |
| :--- | :--- | :--- |
| [**System Architecture**](system_architecture.md) | High-Level System | Complete topology spanning Mobile Client, Admin Portal, Backend Gateways, Docker PostGIS/Redis, and EV Chargers. |
| [**Mobile Architecture**](mobile_architecture.md) | Mobile Client (`apps/mobile`) | React Native 0.74 screen navigators, 7 context providers, CameraX & Biometric hardware bridges, and local cache. |
| [**Backend Architecture**](backend_architecture.md) | Gateway Platform (`apps/backend`) | NestJS 10 modular layout, HTTP REST controllers, WebSocket OCPP & Telemetry gateways, guards, and services. |
| [**Database Architecture**](database_architecture.md) | Persistence & Caching | PostgreSQL 16 + PostGIS spatial entity-relationship model, `ST_DWithin` radial queries, and Redis 7 key structure. |
| [**Authentication Workflow**](auth_workflow.md) | Security & Identity | Driver password/OTP verification, JWT access/refresh token issuance, Passport strategy, and Android BiometricPrompt. |
| [**Station Discovery Workflow**](station_discovery_workflow.md) | Search & Freshness | Geospatial query pipeline, connector filtering, vehicle garage compatibility, and status freshness rules. |
| [**CPO Integration Workflow**](cpo_integration_workflow.md) | Interoperability & CSMS | OCPP 1.6-J / 2.0.1 protocol message exchange (Boot, Heartbeat, Status, MeterValues) and roaming protocol roadmap. |
| [**Data Flow Architecture**](data_flow.md) | End-to-End Lifecycle | Complete session trace from QR barcode scan to live telemetry radial gauge rendering and wallet ledger settlement. |

---

## Diagram Standards

All diagrams are written in standard GitHub-flavored [Mermaid](https://mermaid.js.org/) syntax. They render natively within GitHub, Antigravity markdown previewers, and documentation generators.
