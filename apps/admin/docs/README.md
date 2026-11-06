# ChargeMesh Admin Dashboard — Documentation Hub

Welcome to the **ChargeMesh Admin Dashboard Documentation Hub**. This directory contains the complete technical specifications, architectural blueprints, API contracts, RBAC matrices, and UX guidelines for the ChargeMesh CPO & Operations Admin Web Portal (`@chargemesh/admin`).

---

## 📚 Documentation Index

| Document | Description |
| :--- | :--- |
| [**ARCHITECTURE.md**](./ARCHITECTURE.md) | High-level system architecture, monorepo integration, data flow, WebSocket telemetry stream, and technology stack. |
| [**REQUIREMENTS.md**](./REQUIREMENTS.md) | Comprehensive functional and non-functional requirements across all 14 Admin operational modules. |
| [**DATA_MODELS_AND_SCHEMA.md**](./DATA_MODELS_AND_SCHEMA.md) | Authoritative entity definitions, relations, audit log schemas, and extensions to `@chargemesh/shared-types`. |
| [**API_SPECIFICATION.md**](./API_SPECIFICATION.md) | Detailed REST & WebSocket API specification for all Admin endpoints, payloads, query filters, and response contracts. |
| [**RBAC_AND_SECURITY.md**](./RBAC_AND_SECURITY.md) | Role-Based Access Control (RBAC) permission matrix, authentication guards, sensitive data masking, and audit logging. |
| [**UI_UX_DESIGN_SYSTEM.md**](./UI_UX_DESIGN_SYSTEM.md) | Desktop-first enterprise layout, navigation tree, dark/light theme color tokens, charts, and component guidelines. |
| [**IMPLEMENTATION_ROADMAP.md**](./IMPLEMENTATION_ROADMAP.md) | Phased execution roadmap (Phases 1–11), task breakdowns, milestone criteria, and testing protocol. |

---

## 🎯 Core Engineering Principles

1. **Single Source of Truth**: The Admin Dashboard connects directly to the same underlying backend databases, OCPP CSMS gateways, and canonical schemas as the ChargeMesh Driver mobile application.
2. **Financial Ledger Integrity**: Wallet balance adjustments are never executed as raw mutations; every action is written as an immutable, audited double-entry ledger transaction.
3. **Data Freshness & Transparency**: Charger status follows strict freshness thresholds (`STATUS_STALE_THRESHOLD_SECONDS = 300s`); stale data is highlighted with warnings and never presented as live availability.
4. **Auditability & Traceability**: Every sensitive administrative action (status changes, balance adjustments, remote stop commands, CPO credential updates) is permanently logged with actor metadata and before/after diffs.
