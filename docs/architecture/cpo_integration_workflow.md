# Charge Point Operator (CPO) Integration Workflow

> **Component:** CPO Gateway & Protocol Interoperability  
> **Source:** `apps/backend/src/modules/ocpp` & `docs/CPO_AND_STATIONS.md`  

This document describes how ChargeMesh interfaces with third-party Charge Point Operators and hardware charging equipment via OCPP 1.6-J / 2.0.1 and roaming interfaces.

---

## 1. OCPP 1.6-J / 2.0.1 Direct CSMS Protocol Workflow

```mermaid
sequenceDiagram
    autonumber
    participant Charger as Physical EV Charger (Charge Point)
    participant OcppGateway as ChargeMesh CSMS (WebSocket)
    participant OcppService as OcppService
    participant Telemetry as TelemetryService

    Note over Charger, OcppGateway: 1. Charger Boot & Connection Handshake
    Charger->>OcppGateway: WSS Connect wss://backend/ocpp/CP-DELHI-001
    OcppGateway-->>Charger: WebSocket Connection Accepted
    Charger->>OcppGateway: [2, "call-1", "BootNotification", { chargePointVendor, chargePointModel }]
    OcppGateway->>OcppService: handleBootNotification(chargePointId, payload)
    OcppService-->>OcppGateway: { status: "Accepted", currentTime, interval: 300 }
    OcppGateway-->>Charger: [3, "call-1", { status: "Accepted", ... }]

    Note over Charger, OcppGateway: 2. Periodic Heartbeat & Status Updates
    loop Every 300 seconds
        Charger->>OcppGateway: [2, "call-2", "Heartbeat", {}]
        OcppGateway-->>Charger: [3, "call-2", { currentTime }]
    end

    Charger->>OcppGateway: [2, "call-3", "StatusNotification", { connectorId: 1, status: "Available" }]
    OcppGateway->>OcppService: handleStatusNotification(CP, 1, "Available")
    OcppService-->>OcppGateway: [3, "call-3", {}]

    Note over Charger, Telemetry: 3. Remote Start Transaction Flow
    OcppService->>OcppGateway: sendRemoteStart(chargePointId, connectorId, idTag)
    OcppGateway->>Charger: [2, "call-4", "RemoteStartTransaction", { idTag: "usr-01", connectorId: 1 }]
    Charger-->>OcppGateway: [3, "call-4", { status: "Accepted" }]

    Charger->>OcppGateway: [2, "call-5", "StartTransaction", { connectorId: 1, idTag: "usr-01", meterStart: 1200 }]
    OcppGateway->>OcppService: handleStartTransaction(...)
    OcppService-->>OcppGateway: [3, "call-5", { transactionId: 98421, idTagInfo: { status: "Accepted" } }]

    Note over Charger, Telemetry: 4. Real-Time Meter Values & Telemetry Stream
    loop Every 5-10 seconds during charging
        Charger->>OcppGateway: [2, "call-6", "MeterValues", { transactionId: 98421, meterValue: [{ sampledValue: [...] }] }]
        OcppGateway->>OcppService: handleMeterValues(...)
        OcppService->>Telemetry: broadcastTelemetry(CP, { powerKw, soc, voltage, current })
    end

    Note over Charger, OcppGateway: 5. Stop Transaction & Final Settlement
    Charger->>OcppGateway: [2, "call-7", "StopTransaction", { transactionId: 98421, meterStop: 1245, timestamp }]
    OcppGateway->>OcppService: handleStopTransaction(...)
    OcppService-->>OcppGateway: [3, "call-7", { idTagInfo: { status: "Accepted" } }]
```

---

## 2. Protocol Interoperability Model

ChargeMesh is designed to support two complementary CPO integration models:

```mermaid
flowchart LR
    subgraph NativeChargers["Direct OCPP Hardware Integration"]
        OCPPChargers["OCPP 1.6-J / 2.0.1 Chargers\n(Direct CSMS Gateway)"]
    end

    subgraph AggregatedNetworks["CPO Roaming Networks"]
        RoamingNetworks["Participating CPO Clouds\n(Tata Power, Jio-bp, Statiq, etc.)"]
    end

    subgraph ChargeMeshPlatform["ChargeMesh Core Engine"]
        OcppEngine["OCPP Protocol Engine\n(Active & Implemented)"]
        OcpiEngine["OCPI 2.2.1 / 2.3 Roaming Module\n(Planned Phase 3)"]
        Normalizer["Canonical Data Normalizer\n(@chargemesh/shared-types)"]
    end

    OCPPChargers <-->|"WebSocket (JSON-RPC)"| OcppEngine
    RoamingNetworks <-->|"REST API (Locations, Tariffs, Sessions)"| OcpiEngine

    OcppEngine --> Normalizer
    OcpiEngine --> Normalizer
    Normalizer --> UnifiedExperience["Unified Driver & Admin Experience"]
```
