# ChargeMesh — Application & Charging Workflows

> **Status:** ⚠️ PLANNED — This describes the intended OCPP-connected charging flow.
> The current mobile app uses a simulated local mock flow. See [`SCREENS_AND_NAVIGATION.md`](SCREENS_AND_NAVIGATION.md) for the current implemented flow.

## 1. End-to-End Driver Charging Workflow

```text
[Driver Opens App]
        │
        ▼
[Discover Station on Map / Search] ──► [Select Station & Connector]
        │                                           │
        ├───────────────────────────────────────────┘
        ▼
[Scan Charger QR Code]
        │
        ▼
[Pre-Charge Configuration] (Select SoC / Energy / Price / Time Target)
        │
        ▼
[Authorize & Plug In Cable]
        │
        ▼
[Remote Start Transaction via OCPP]
        │
        ▼
[Live Charging Screen] ◄─── (Real-time Telemetry Stream: SoC, kW, kWh, Cost)
        │
        ▼
[Stop Charging / Target Reached]
        │
        ▼
[Session Summary & Payment Receipt]
```

## 2. OCPP Protocol Sequence (Remote Start)

```text
Mobile App                  Backend (CSMS)                  Charge Point
    │                             │                              │
    ├─── POST /session/start ────►│                              │
    │                             ├─── RemoteStartTransaction ──►│
    │                             │◄── CallResult (Accepted) ────┤
    │                             │                              │
    │                             │◄── StatusNotification(Occ.) ─┤
    │                             │◄── StartTransaction.req ─────┤
    │                             ├─── StartTransaction.conf ───►│
    │◄── Session Started Event ───┤                              │
    │                             │◄── MeterValues.req (stream) ─┤
    │◄── Live Telemetry Stream ───┤                              │
```
