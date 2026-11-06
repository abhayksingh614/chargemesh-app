# End-to-End Data Flow Architecture

> **Component:** End-to-End System Data Flow  
> **Source:** Mobile Client, Backend REST & OCPP Gateways, Telemetry Broadcaster  

This diagram traces the complete lifecycle of an EV charging session, from QR scan at the physical charger to live telemetry rendering and final financial ledger debit.

---

## 1. End-to-End Session Data Flow

```mermaid
sequenceDiagram
    autonumber
    actor Driver as EV Driver
    participant Mobile as Mobile App (CameraX / UI)
    participant RestApi as Backend REST API
    participant Sessions as SessionsService
    participant Ocpp as OcppService / Gateway
    participant Charger as Physical EV Charger
    participant Telemetry as TelemetryGateway
    participant Ledger as Fast Wallet / Ledger

    Driver->>Mobile: Scans QR code on charging gun (CameraX + ML Kit)
    Mobile->>Mobile: Resolves `chargePointId` & `connectorId`
    Mobile->>Driver: Opens PreChargeScreen (Sets target limit: 80% SoC or ₹500)
    
    Driver->>Mobile: Taps "Start Charging"
    Mobile->>RestApi: POST /api/v1/sessions/start { stationId, connectorId, target }
    RestApi->>Sessions: startSession(userId, dto)
    Sessions->>Ocpp: sendRemoteStart(chargePointId, connectorId, idTag)
    Ocpp->>Charger: OCPP RemoteStartTransaction [2, "id", "RemoteStartTransaction", ...]
    Charger-->>Ocpp: [3, "id", { status: "Accepted" }]
    Charger->>Ocpp: OCPP StartTransaction [2, "id2", "StartTransaction", ...]
    Ocpp-->>Charger: [3, "id2", { transactionId: 5501, ... }]
    
    Sessions-->>RestApi: Session State: "CHARGING" (session.id: "sess-101")
    RestApi-->>Mobile: 201 Created + Session Entity
    Mobile->>Mobile: Navigates to LiveChargingScreen
    Mobile->>Telemetry: WSS Connect ws://backend/telemetry?sessionId=sess-101

    Note over Charger, Mobile: Live Telemetry Stream During Charging
    loop Every 5 seconds
        Charger->>Ocpp: OCPP MeterValues (Power: 48.5 kW, SoC: 52%, Voltage: 395 V, Current: 122 A)
        Ocpp->>Telemetry: broadcastTelemetry(sessionId, metrics)
        Telemetry-->>Mobile: WSS Message { currentPowerKw: 48.5, soc: 52, costInr: 142.50 }
        Mobile->>Mobile: Re-renders Radial Gauge & Live Graph
    end

    Note over Driver, Ledger: Session Termination & Ledger Settlement
    Driver->>Mobile: Taps "Stop Charging"
    Mobile->>RestApi: POST /api/v1/sessions/sess-101/stop
    RestApi->>Sessions: stopSession("sess-101")
    Sessions->>Ocpp: sendRemoteStop(chargePointId, transactionId)
    Ocpp->>Charger: OCPP RemoteStopTransaction
    Charger->>Ocpp: OCPP StopTransaction (meterStop: 18.4 kWh)
    Ocpp-->>Charger: Accepted
    
    Sessions->>Ledger: debitWallet(userId, totalCostInr: ₹312.80 including 18% GST)
    Ledger-->>Sessions: Wallet Updated (New Balance: ₹687.20)
    Sessions-->>RestApi: Session Summary (Energy: 18.4 kWh, Total: ₹312.80)
    RestApi-->>Mobile: 200 OK + Completed Session Payload
    Mobile->>Mobile: Navigates to SessionCompleteScreen (Shows Invoice & Eco CO₂ Saved)
```
