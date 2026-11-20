# CHARGEMESH — PHASE 04 WORKSTREAM 7: OCPP & CHARGING SESSION RELIABILITY AUDIT
**Version:** 1.0  
**Date:** 2026-11-20  
**Auditor:** Principal Software Architect, Senior EV Charging & OCPP Protocol Engineer  
**Repository:** `https://github.com/abhayksingh614/chargemesh-app`  
**Protocols Evaluated:** OCPP 1.6-J (JSON over WebSockets), OCPP 2.0.1  

---

## 1. Executive Protocol Assessment

An in-depth reliability, security, and protocol conformance audit was performed on the ChargeMesh Central System Management Service (CSMS) gateway (`apps/backend/src/modules/ocpp/`).

### Verification Verdict: CONDITIONALLY BLOCKED / CRITICAL DEFICIENCIES
While the gateway implements core OCPP-J RPC framing (`CALL`, `CALLRESULT`, `CALLERROR`) and supports standard action handlers (`BootNotification`, `Heartbeat`, `StatusNotification`, `MeterValues`, `RemoteStart/Stop`), the implementation has **critical security and persistence deficiencies**:
1. **Zero Charger Authentication (OCPP-001):** The WebSocket gateway at `/ocpp` accepts arbitrary WebSocket connections without Basic Authentication, HTTP Authorization headers, or mTLS certificates. Any attacker can spoof any charge point ID.
2. **Universal RFID Tag Authorization Bypass (OCPP-002):** `handleAuthorize` unconditionally returns `{ status: 'Accepted' }` with a 1-year validity for any `idTag` without validating user existence or balance in PostgreSQL.
3. **In-Memory Volatile Transaction State (OCPP-003):** Active charging transactions are stored solely in an in-memory `Map<number, ActiveTransaction>`. If the backend process restarts during charging, all active sessions are orphaned and unbilled.
4. **Zero Database Settlement on StopTransaction (OCPP-004):** When a charger transmits `StopTransaction`, the handler calculates energy and cost, logs it, and deletes the transaction from memory without saving to `charging_sessions` or charging the driver wallet.

---

## 2. Protocol Action Handlers Verification Matrix

| OCPP Action | Protocol Req. (1.6-J) | Implemented? | Database Persisted? | Conformance / Reliability Audit |
| :--- | :--- | :--- | :--- | :--- |
| `BootNotification` | Mandatory | **Yes** | In-Memory Only | Returns `Accepted` with 60s interval. Does not check `charging_stations` table. |
| `Heartbeat` | Mandatory | **Yes** | No | Returns current server ISO timestamp. |
| `StatusNotification` | Mandatory | **Yes** | No | Updates in-memory session status map. Does not update `connectors.status` in DB. |
| `Authorize` | Conditional | **Yes** | No | **Security Vulnerability:** Unconditionally accepts all RFID tags without DB lookup. |
| `StartTransaction` | Mandatory | **Yes** | No | Assigns volatile `transactionCounter` ID; stores in local Map. |
| `StopTransaction` | Mandatory | **Yes** | No | Computes energy from meter stop/start; logs output; **fails to persist or bill**. |
| `MeterValues` | Mandatory | **Yes** | No | Parses SoC, Power (kW), Voltage, Current; broadcasts to telemetry gateway. Does not persist to `meter_values` table. |
| `RemoteStartTransaction` | Optional | **Yes** | Triggered by REST | Sends CALL frame; tracks response with 30s timeout (`.unref()` timer). |
| `RemoteStopTransaction` | Optional | **Yes** | Triggered by REST | Sends CALL frame; tracks response with 30s timeout (`.unref()` timer). |

---

## 3. Failure Mode & Edge-Case Analysis

### 3.1 Backend Process Crash During Active Session
- **Scenario:** 50 chargers actively charging; backend container restarts or scales out.
- **Observed Behavior:**
  - `this.activeTransactions` map is wiped out.
  - Sockets disconnect; chargers attempt reconnection.
  - Chargers send periodic `MeterValues` with existing `transactionId`.
  - CSMS does not recognize `transactionId`, silently discards or uses default metrics.
  - When charger sends `StopTransaction`, CSMS logs `StopTransaction received for unknown tx #...` and discards billing data.
- **Remediation:** Store active transaction mappings in Redis (`chargemesh:ocpp:tx:<txId>`) with dual persistence in PostgreSQL `charging_sessions`.

### 3.2 Offline Charger Fallback & Mock Simulation
- **Source:** `SessionsService.startSession` [L153-L160](file:///c:/Users/aksde/Videos/My_Codex/Chargemesh_app/apps/backend/src/modules/sessions/sessions.service.ts#L153-L160):
  ```typescript
  catch (err: any) {
    this.logger.warn(`OCPP remoteStartTransaction failed or offline: ${err.message}. Defaulting to active simulation session.`);
    sessionData.status = 'CHARGING';
  }
  ```
- **Defect:** If physical charger is offline or rejects the start command, ChargeMesh treats the failure as a virtual success ("simulation session") and reports to the driver that charging has begun.
- **Remediation:** Strictly fail closed: throw `BadGatewayException('Charging hardware is offline or unreachable')`.

---

## 4. OCPP Security Hardening Roadmap (OCPP 1.6-J Security Whitepaper)
1. **Implement Security Profile 1 / 2:** Require HTTP Basic Authentication over TLS (`Authorization: Basic <base64(CP_ID:Password)>`). Validate against `charging_stations` credentials before accepting WebSocket upgrade.
2. **Authorize Validation:** Link `handleAuthorize(idTag)` to `UserEntity` or dedicated `RfidTagEntity`; check wallet balance and account status.
3. **Persist Meter Values:** Insert incoming `MeterValues` time-series samples into PostgreSQL `meter_values` table for legal auditability under Indian Legal Metrology standards.
