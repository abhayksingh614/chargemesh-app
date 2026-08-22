# ChargeMesh — Project Overview

## 1. Product Summary
**ChargeMesh** is an interoperability and charging-experience platform for Electric Vehicles (EVs). It provides a unified driver-facing mobile interface and a robust backend integration layer that bridges fragmented Charge Point Operator (CPO) networks into a single, seamless charging journey.

## 2. Core Value Proposition
- **Unified Discovery**: One map and search interface covering multiple participating CPO networks.
- **Connector-Level Live Status**: Live status tracking at individual connector granularity (`Available`, `Occupied`, `Faulted`, `Unavailable`).
- **Standardized Payment & Charging**: Consistent QR scanning, pre-charge configuration, remote start/stop, and tariff billing.
- **Real-Time Telemetry**: Live session monitoring showing SoC (State of Charge), energy delivered (kWh), power rate (kW), duration, and accrued cost.

## 3. Product Stack Overview
| Component | Technology | Description |
| :--- | :--- | :--- |
| **Mobile App** | React Native / TypeScript | Cross-platform iOS & Android driver app |
| **Backend API** | NestJS / TypeScript / Node.js | REST, GraphQL, and OCPP-J protocol handlers |
| **Admin Portal** | Next.js / React | Web portal for operations, station monitoring, and analytics |
| **Database** | PostgreSQL / TimescaleDB & Redis | Transactional data, telemetry time-series, and live cache |
| **Protocols** | OCPP 1.6-J & OCPP 2.0.1 | Open Charge Point Protocol over WebSockets |
