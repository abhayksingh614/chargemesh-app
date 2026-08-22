---
name: ocpp-backend
description: >-
  Architecture patterns, OCPP 1.6/2.0.1 charge point protocol handlers,
  WebSocket communication, and backend service development in apps/backend.
---

# Chargemesh Backend & OCPP Service Skill

This skill provides standards and patterns for backend microservices, OCPP protocol handlers, and real-time charging session orchestration (`apps/backend`).

## 1. Core Architecture

- **Protocol Engine**: Handles OCPP-J (OCPP over WebSockets) for version 1.6-J and 2.0.1.
- **REST & GraphQL API**: Serves driver mobile apps and admin dashboard clients.
- **Message Broker & Events**: Decouples charge point telemetry and status notifications from database writes and push alerts.
- **Database & Persistence**: Manages entities for Stations, Connectors, Sessions, Tariffs, Users, and Transactions.

## 2. OCPP Protocol Guidelines

- **Message Types**:
  - `CALL` (Type 2): Central System -> Charge Point or Charge Point -> Central System requests.
  - `CALLRESULT` (Type 3): Successful response with payload.
  - `CALLERROR` (Type 4): Error response with error code and description.
- **Core Operations to Support**:
  - `BootNotification`: Station registration and heartbeat setup.
  - `Heartbeat`: Liveness tracking.
  - `StatusNotification`: Connector state updates (Available, Preparing, Charging, Faulted).
  - `Authorize`: RFID / ID tag validation.
  - `StartTransaction` / `StopTransaction`: Meter value recording and session lifecycles.
  - `MeterValues`: Periodic energy, power, voltage, and SoC telemetry stream.
  - `RemoteStartTransaction` / `RemoteStopTransaction`: Mobile app remote command dispatch.

## 3. Security & Validation

- Validate all incoming payloads against JSON schemas.
- Authenticate charge points via Basic Auth / TLS client certificates.
- Sanitize and rate-limit API and WebSocket requests.
