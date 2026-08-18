# ChargeMesh — Technical Documentation

> **Document:** CM-TECH-DOC-01 | **Version:** 1.0 | **Date:** August 2026
> **Status:** Pre-Development / Architecture Defined
> **Audience:** Engineers, Architects, DevOps, QA, Security Teams, Future Contributors

---

## Table of Contents

1. [Platform Overview](#1-platform-overview)
2. [Critical Platform Decision](#2-critical-platform-decision)
3. [Technology Stack](#3-technology-stack)
4. [High-Level Architecture](#4-high-level-architecture)
5. [Customer Mobile Application](#5-customer-mobile-application)
6. [Admin Web Application](#6-admin-web-application)
7. [Backend Services Architecture](#7-backend-services-architecture)
8. [CPO Integration Hub](#8-cpo-integration-hub)
9. [Canonical Data Model](#9-canonical-data-model)
10. [Availability & Status Model](#10-availability--status-model)
11. [Database Architecture](#11-database-architecture)
12. [API Architecture](#12-api-architecture)
13. [Real-Time Data Strategy](#13-real-time-data-strategy)
14. [Event-Driven Processing](#14-event-driven-processing)
15. [Charging Session State Machine](#15-charging-session-state-machine)
16. [Payment Architecture](#16-payment-architecture)
17. [Security Architecture](#17-security-architecture)
18. [Observability](#18-observability)
19. [Deployment Architecture](#19-deployment-architecture)
20. [CI/CD Pipelines](#20-cicd-pipelines)
21. [Testing Strategy](#21-testing-strategy)
22. [Scalability & Reliability](#22-scalability--reliability)
23. [Backup & Disaster Recovery](#23-backup--disaster-recovery)
24. [Environment Configuration](#24-environment-configuration)
25. [Repository Structure](#25-repository-structure)
26. [API & Integration Rules](#26-api--integration-rules)
27. [Development Handoff Checklist](#27-development-handoff-checklist)
28. [Analytics Events](#28-analytics-events)
29. [CPO Onboarding Technical Flow](#29-cpo-onboarding-technical-flow)
30. [Future Technical Scope](#30-future-technical-scope)

---

## 1. Platform Overview

ChargeMesh is built as a **cross-platform EV charging customer application for Android and iOS**, supported by a centralized cloud backend and CPO Integration Hub. A separate **web-only Admin Portal** provides operational, CPO, charging, payment, support, reporting, and system-management capabilities.

```
CUSTOMER: ANDROID + iOS -> CHARGEMESH BACKEND -> CPO INTEGRATION HUB -> CPO NETWORKS
ADMIN: WEB BROWSER -> ADMIN/BACKEND APIs -> SAME CORE PLATFORM
```

| Field | Details |
|-------|---------|
| Document ID | CM-DOC-04 |
| Version | 3.1 |
| Customer Platform | One cross-platform mobile application for Android and iOS |
| Admin Platform | Web application only |
| Backend | Centralized cloud backend/API platform |
| CPO Integration | Central CPO Integration Hub |
| Primary Protocol | OCPI 2.3.0 where supported; proprietary APIs/adapters where required |
| Architecture Style | API-driven, modular, event-enabled, cloud-ready |

---

## 2. Critical Platform Decision

> [!IMPORTANT]
> ChargeMesh will have exactly TWO client-side experiences. This is a non-negotiable architectural decision.

| Experience | Platform | Scope |
|-----------|----------|-------|
| Customer App | Android + iOS ONLY | Cross-platform mobile application for EV users |
| Admin Portal | Web ONLY | Browser-based operational/admin platform |

**What this means:**
- There will be NO separate native Android codebase and NO separate native iOS codebase for the customer app
- The customer application will be developed as one cross-platform mobile codebase released to both Google Play and Apple App Store
- The Admin Portal will NOT be packaged as the customer mobile application
- It will be a dedicated web application accessible through modern browsers

### Platform Boundary

| Component | Android | iOS | Web |
|-----------|---------|-----|-----|
| Customer App | YES | YES | NO |
| Admin Portal | NO | NO | YES |
| CPO Operations | NO | NO | YES |
| User Management | NO | NO | YES |
| Station Management | NO | NO | YES |
| CPO Integration Monitoring | NO | NO | YES |
| Reports & Analytics | NO | NO | YES |
| System Configuration | NO | NO | YES |

---

## 3. Technology Stack

| Layer | Recommended Direction | Status |
|-------|----------------------|--------|
| Customer Mobile | Flutter or React Native — select one and standardize | Decision Required |
| Admin Web | React/Next.js or equivalent web framework | Decision Required |
| Backend | Node.js/NestJS, Java/Spring Boot, or equivalent enterprise backend | Decision Required |
| Database | PostgreSQL + PostGIS | Defined |
| Cache | Redis | Defined |
| Queue/Events | Managed queue/event broker (e.g., RabbitMQ, Kafka, AWS SQS) | Decision Required |
| Object Storage | Cloud object storage (invoices, documents, assets) | Decision Required |
| Analytics Store | Optional reporting/analytics workload (e.g., ClickHouse, BigQuery) | Post-MVP |
| Cloud | AWS / Azure / GCP — standardize one provider | Decision Required |
| Monitoring | Central logs + metrics + traces (e.g., Datadog, Grafana, OpenTelemetry) | Decision Required |
| Map Provider | Backend-configured map/geospatial provider | Decision Required |
| Notification | Push/SMS/email provider (FCM, APNs, SMS gateway) | Decision Required |

> [!NOTE]
> The framework choice should be finalized during technical spike/POC. The non-negotiable requirement is one cross-platform customer codebase serving Android and iOS, while Admin remains web-only.

---

## 4. High-Level Architecture

```
                    CUSTOMER ANDROID / iOS
                           |
                  CHARGEMESH MOBILE API / API GATEWAY
                           |
          AUTH • USER • VEHICLE • STATION • SEARCH •
          CHARGING • PAYMENT • WALLET • HISTORY
                           |
                  CPO INTEGRATION HUB
                           |
          OCPI / CPO APIs / Adapter Services
                           |
              CPO NETWORKS / CHARGING STATIONS

                      ADMIN WEB
                           |
              ADMIN API / AUTHORIZATION
                           |
          SAME CHARGEMESH BACKEND SERVICES + ADMIN SERVICES
```

---

## 5. Customer Mobile Application

The customer product is a single cross-platform mobile application. The same business logic, API contracts, design system, and feature set are shared across Android and iOS, with only platform-specific integrations implemented where necessary.

### 5.1 Customer Modules

| Module | Description |
|--------|-------------|
| Splash and onboarding | App entry, value proposition |
| Login / registration / OTP | Secure authentication |
| Home and charger map | Map-first discovery |
| Search and filters | Location/CPO/connector/vehicle search |
| Station details | Station information display |
| Connector details | Connector-level status, compatibility, tariff |
| Availability and status | Live + freshness display |
| CPO information | Operator branding and identity |
| QR scanner | Scan & Charge journey |
| Charging target selection | Amount/Time/Energy targets |
| Payment flow | Regulated payment orchestration |
| Charging session | Start/stop/live monitoring |
| Live charging status | Real-time metrics display |
| Charging completion | Session summary and receipt |
| Charging history | Unified cross-CPO history |
| Invoices/receipts | Document generation and display |
| Wallet/payment methods | Subject to approved payment architecture |
| Saved/favourite stations | Station bookmarking |
| Vehicle management | Vehicle profile management |
| Eco impact | CO2 avoided estimates (future) |
| Notifications | Push notifications for session events |
| Help and support | In-app support with session context |
| Profile and settings | Account management and privacy |

### 5.2 Cross-Platform Requirements

- Single mobile source codebase
- Shared UI component library
- Shared API client and data models
- Shared authentication/session logic
- Shared business rules
- Shared analytics event definitions
- Shared error handling
- Shared charging-state machine
- Platform-specific native bridges only when required by OS capability

### 5.3 Android Requirements

- Google Play release pipeline
- Android location permissions
- Camera/QR scanning
- Push notifications (FCM)
- Secure credential/token storage (Keystore)
- Network state handling
- Deep links

### 5.4 iOS Requirements

- Apple App Store release pipeline
- iOS location permissions
- Camera/QR scanning
- Push notifications (APNs)
- Keychain-based secure storage
- Network state handling
- Universal/deep links

---

## 6. Admin Web Application

The Admin Portal is a web-only operational control centre. It is not part of the customer mobile application.

### 6.1 Admin Modules

| Module | Description |
|--------|-------------|
| Admin login and MFA | Secure admin authentication with MFA |
| Dashboard | Network-wide KPI overview |
| User management | Consumer account management |
| Vehicle management | Vehicle profile management |
| CPO management | CPO configuration and partner management |
| CPO credentials/configuration | Secure credential storage and management |
| Station management | Location/station configuration |
| EVSE/connector management | Equipment-level management |
| Availability/status monitoring | Live connector status monitoring |
| Tariff management | Tariff synchronization and validation |
| Charging-session monitoring | Active and historical session view |
| Payment monitoring | Transaction state monitoring |
| Refund/adjustment workflow | Manual exception handling |
| CDR reconciliation | CDR-to-session-to-payment matching |
| Support/ticket management | Customer support case handling |
| Notifications | System notifications |
| Content/configuration management | App configuration management |
| Reports and analytics | Operational and business reports |
| Audit logs | Privileged action audit trail |
| Role and permission management | RBAC configuration |
| System health | Infrastructure health monitoring |
| Integration health | CPO integration status monitoring |

### 6.2 Admin Web Browser Support

| Browser | Support Level |
|---------|-------------|
| Chrome/Edge | Primary support |
| Safari | Supported for modern versions |
| Firefox | Supported where required |
| Responsive | Desktop-first; tablet support where useful |
| Mobile browser | Not the primary admin experience |

### 6.3 Admin Security Requirements

- MFA mandatory for privileged accounts
- Role-Based Access Control (RBAC)
- Least-privilege permissions
- Session timeout
- IP/device controls where appropriate
- Audit logging for all privileged actions
- Sensitive CPO credentials never shown in plaintext
- Separate admin authentication domain/route
- No shared admin accounts
- Credential rotation
- Sensitive actions require re-authentication where appropriate

---

## 7. Backend Services Architecture

| Service | Responsibilities |
|---------|----------------|
| API Gateway | Routing, authentication integration, throttling, rate limiting |
| Identity Service | Customer/admin authentication and sessions |
| User Service | Customer profile and preferences |
| Vehicle Service | Vehicle metadata and compatibility |
| Location Service | Stations, geospatial search |
| CPO Service | CPO metadata and partner configuration |
| Station/EVSE Service | Location -> EVSE -> Connector model |
| Availability Service | Normalized real-time status |
| Charging Service | Start/stop/session state management |
| Payment Service | Payment orchestration and transaction references |
| Wallet Service | Only approved wallet/payment architecture |
| CDR Service | Charging detail records and reconciliation |
| Notification Service | Push/SMS/email as configured |
| Support Service | Tickets and issue tracking |
| Analytics Service | Product and operational analytics |
| Admin Service | Administrative operations and audit |

---

## 8. CPO Integration Hub

The CPO Integration Hub is the central integration boundary.

> [!IMPORTANT]
> The mobile app must NEVER connect directly to individual CPO APIs. All CPO communication must pass through the CPO Integration Hub.

```
Android/iOS -> ChargeMesh Backend -> CPO Integration Hub -> CPO
```

### 8.1 Hub Responsibilities

- OCPI 2.3.0 integration where supported
- Dedicated adapter for proprietary CPO APIs
- Credential isolation
- Rate-limit management
- Retry and timeout policy
- Schema validation
- Data normalization
- Webhook/event ingestion
- Integration health monitoring
- Per-CPO logging and metrics

### 8.2 Integration Models

**Preferred:**
```
CPO OCPI 2.3.0 <-> ChargeMesh OCPI Hub / Adapter Layer
```

**Fallback:**
```
CPO Proprietary API <-> ChargeMesh CPO Adapter <-> Canonical Model
```

### 8.3 CPO Capability Matrix (Per Integration)

Each CPO must have a documented capability matrix before production enablement:

| Capability | Direction | Required for MVP |
|-----------|-----------|----------------|
| Credentials/Registration | Both | Required |
| Locations | CPO -> ChargeMesh | Required |
| EVSE/Connectors | CPO -> ChargeMesh | Required |
| Status | CPO -> ChargeMesh | Required |
| Tariffs | CPO -> ChargeMesh | Required |
| Tokens | ChargeMesh <-> CPO | Required |
| Commands (Start/Stop) | ChargeMesh -> CPO | Required where app-start promised |
| Sessions | CPO <-> ChargeMesh | Required |
| CDRs | CPO -> ChargeMesh | Required |
| Bookings | Both | Later |
| Charging Profiles | Both | Later |
| Payments | Both | Conditional |

---

## 9. Canonical Data Model

The canonical hierarchy is:

```
CPO -> Location -> EVSE -> Connector
```

### 9.1 Entity Definitions

| Entity | Key Information |
|--------|---------------|
| CPO | id, name, logo, support, integration status, contract status |
| Location | id, CPO ID, name, address, coordinates, access type, hours |
| EVSE | id, external ID, status, capabilities, physical reference |
| Connector | id, external ID, type, power, voltage, amperage, status, timestamps, tariff reference |
| Tariff | id, currency, energy price, time price, flat fee, taxes/fees, restrictions, effective period |
| Session | id, CPO session ID, EVSE, connector, start/end, meter values, cost, status |
| CDR | id, session reference, energy, duration, tariff, final amount |
| Payment | id, provider reference, amount, state, refund state, idempotency key |

### 9.2 Mapping Table

ChargeMesh maintains a mapping table:
```
CPO ID -> Location ID -> EVSE UID -> Connector ID -> ChargeMesh IDs
```

| Field | Purpose |
|-------|---------|
| CPO Party ID | Identifies operator |
| CPO Location ID | Source location |
| CPO EVSE UID | Source EVSE |
| CPO Connector ID | Source connector |
| ChargeMesh Location ID | Canonical location |
| ChargeMesh EVSE ID | Canonical EVSE |
| ChargeMesh Connector ID | Canonical connector |
| Mapping status | Verified / Pending / Conflict |

---

## 10. Availability & Status Model

| Status | Meaning |
|--------|---------|
| AVAILABLE | Confirmed available from authoritative source |
| CHARGING / IN_USE | Connector currently occupied |
| RESERVED | Reserved where supported |
| UNAVAILABLE | Confirmed unavailable |
| OFFLINE | Source/device offline |
| UNKNOWN | Status cannot be reliably confirmed |
| STALE | Status exists but is older than configured freshness threshold |

### Business Rules

| Rule | Definition |
|------|-----------|
| STATUS-001 | AVAILABLE means source reports connector as usable; not a physical guarantee |
| STATUS-002 | IN_USE means connector currently occupied according to source |
| STATUS-003 | UNAVAILABLE means connector cannot be selected |
| STATUS-004 | OFFLINE means source reports equipment/network offline |
| STATUS-005 | UNKNOWN means ChargeMesh cannot confirm current status |
| STATUS-006 | STALE means status older than configured freshness threshold |
| STATUS-007 | UNKNOWN must never be displayed as AVAILABLE |
| STATUS-008 | STALE must show a freshness warning |
| STATUS-009 | Every status record must retain source timestamp and ingestion timestamp |
| STATUS-010 | Starting from UNKNOWN/STALE requires explicit user warning |

### Stale Data Handling

- Define per-CPO freshness thresholds
- Mark stale records as STALE/UNKNOWN instead of silently presenting as live
- Show last updated information to customers where useful
- Admin dashboard must show integration freshness
- CPO adapter records source timestamp AND ChargeMesh ingestion timestamp

---

## 11. Database Architecture

### 11.1 Database/Store Breakdown

| Database/Store | Purpose |
|---------------|---------|
| PostgreSQL | Core transactional data |
| PostGIS | Geospatial station queries |
| Redis | Caching, short-lived state, rate limiting |
| Object Storage | Invoices, documents, and selected assets |
| Analytics Store | Optional reporting/analytics workload |

### 11.2 Core Tables / Entities

```
users
admin_users
roles
vehicles
cpos
cpo_credentials
locations
evses
connectors
tariffs
availability_events
charging_sessions
cdrs
payment_transactions
refunds
wallet_ledger (only if legally approved)
favourites
notifications
support_tickets
audit_logs
```

### 11.3 Search & Location Architecture

- Use PostgreSQL/PostGIS for geospatial station queries
- Caching layer (Redis) for frequently requested station data
- Support radius-based search
- Support current location and manual location entry
- Backend-configured map provider keys (not in mobile app)
- Support route-oriented future expansion

---

## 12. API Architecture

### 12.1 API Groups

| API Group | Responsibilities |
|-----------|----------------|
| Auth API | Login, OTP, refresh, logout |
| User API | Profile, preferences |
| Vehicle API | Add/update/select vehicle |
| Station API | Nearby/search/detail |
| Connector API | Connector/status/tariff |
| Charging API | Start/stop/status |
| Payment API | Create/verify/reconcile |
| History API | Sessions, invoices |
| Support API | Create/track tickets |
| Admin API | Operational controls |
| CPO API (Internal) | CPO integration management |

### 12.2 API Standards

- API versioning is mandatory: `/api/v1/...`
- Backward-compatible migration strategy required
- REST/JSON primary; selected real-time channels (WebSocket/SSE) for live session updates
- All financial and session API calls must use idempotency keys
- Rate limiting applied at API gateway level

---

## 13. Real-Time Data Strategy

- CPO push/webhook events where supported
- Scheduled polling where push is unavailable
- Queue-based processing for CPO data ingestion
- Redis for short-lived cache and session state
- WebSocket/SSE/polling to mobile based on product need
- Do not poll every CPO directly from every mobile device

---

## 14. Event-Driven Processing

| Event | Consumer(s) |
|-------|-------------|
| CPO_STATUS_UPDATED | Availability Service + cache + mobile notification |
| CHARGING_STARTED | Charging Service + notification + analytics |
| CHARGING_STOPPED | CDR Service + payment reconciliation |
| PAYMENT_AUTHORIZED | Charging authorization flow |
| PAYMENT_FAILED | Charging workflow + support ticket |
| CDR_RECEIVED | Billing + reconciliation |
| REFUND_CREATED | Payment Service + notification |

---

## 15. Charging Session State Machine

### 15.1 State Transitions

```
DISCOVERED -> SELECTED -> AUTHORIZED -> STARTING -> CHARGING -> STOPPING -> COMPLETED

Failure states: AUTH_FAILED | START_FAILED | INTERRUPTED | PAYMENT_FAILED | CPO_ERROR | UNKNOWN
```

### 15.2 State Machine Rules

- Backend is the source of truth for session state
- Mobile UI subscribes/polls for session changes
- Start/stop requests must be idempotent (use correlation/idempotency keys)
- Every session must have a unique ChargeMesh session ID
- CPO transaction/EVSE identifiers must be mapped to the internal session
- A successful start API response is NOT sufficient to mark session CHARGING
- The platform must confirm the operational session state through CPO/session data
- App kill/network loss does not complete session — recover from backend/CPO state

### 15.3 Start Command Flow

```
1. ChargeMesh creates session intent
2. Validate connector/status/capability
3. Authorize payment
4. Send start command to CPO via Integration Hub
5. Receive immediate/asynchronous command result
6. Observe CPO session state (asynchronously)
7. Confirm actual charging
8. Return CHARGING state to user UI
```

### 15.4 Session Data Requirements

| Data Field | Purpose |
|-----------|---------|
| ChargeMesh session ID | Internal identity |
| CPO session ID | Operational identity |
| EVSE/connector | Physical endpoint |
| Start time | Duration calculation |
| End time | Finalization |
| kWh delivered | Usage |
| Status | Live state |
| Authorization reference | Identity |
| Meter values (if supplied) | Live monitoring |

---

## 16. Payment Architecture

### 16.1 Payment Flow

```
Customer -> ChargeMesh Payment Service -> Approved Payment Provider -> Settlement / CPO flow
```

### 16.2 Payment Architecture Rules

- Customer mobile app does not directly integrate with each CPO's payment system
- Payment provider handles sensitive payment credentials
- ChargeMesh stores transaction references, NOT raw card credentials
- Payment authorization and final charging amount must be reconciled
- Failed starts require defined reversal/refund handling
- CDR and payment reconciliation must be auditable
- Never store CVV; use provider tokenization
- Do not assume a cross-CPO stored-value wallet can be implemented without regulatory review

### 16.3 Payment/Session State Matrix

| Payment State | Session State | User Experience |
|--------------|--------------|----------------|
| PENDING | NOT_STARTED | Payment processing; do not start until policy allows |
| AUTHORIZED | STARTING | Starting charging |
| AUTHORIZED | START_FAILED | Release/reverse authorization |
| AUTHORIZED | CHARGING | Charging active |
| CAPTURE_PENDING | COMPLETED | Finalizing amount |
| CAPTURED | COMPLETED | Payment complete |
| REFUND_PENDING | START_FAILED | Refund processing |
| REFUNDED | START_FAILED | Refund completed |
| MANUAL_REVIEW | UNKNOWN/FAILED | Support/reconciliation required |

### 16.4 Required Payment References

- ChargeMesh session ID
- CPO ID / Location ID / EVSE ID / Connector ID
- CPO session ID
- CDR ID where available
- Payment provider transaction ID
- Idempotency key
- Refund reference where applicable

---

## 17. Security Architecture

### 17.1 General Security

- TLS for all network traffic (no exceptions)
- Encryption at rest for sensitive data
- Secure mobile token storage (Keychain/Keystore)
- Short-lived access tokens with refresh mechanism
- Admin MFA mandatory for privileged roles
- RBAC across all services
- Secrets manager for CPO credentials and API keys
- Credential rotation procedures
- API rate limiting
- WAF/API protection where appropriate
- Audit logs for all privileged actions
- Dependency and container scanning in CI/CD
- Regular penetration testing before major production releases

### 17.2 Mobile Security

- No CPO credentials in the mobile application
- No direct CPO API keys in Android/iOS builds
- Secure token storage (platform-native)
- Certificate/network protections as appropriate
- Root/jailbreak detection only where justified
- Obfuscation for release builds where appropriate
- Disable verbose production logs

### 17.3 Admin Security

- Separate admin authentication domain/route
- MFA mandatory for privileged roles
- RBAC with least-privilege permissions
- Audit trail for all changes
- No shared admin accounts
- Credential rotation
- Session expiration
- Sensitive actions require re-authentication

### 17.4 CPO Integration Security

| Requirement | Implementation |
|-------------|---------------|
| Unique credentials | Per-environment CPO credentials |
| No credentials in plaintext | Secrets manager |
| TLS | Required for all CPO connections |
| Least-privilege API access | Scoped CPO tokens |
| Credential rotation | Process defined |
| Webhook authentication | Signed webhooks where available |
| IP restrictions | Where appropriate |
| Audit logs | Per-CPO integration logs |

---

## 18. Observability

| Area | Metrics |
|------|---------|
| API | Latency, errors, throughput |
| CPO Integration | Success rate, latency, stale status, failures |
| Charging | Start success, stop success, interrupted sessions |
| Payments | Authorization success, failures, refunds |
| Mobile | Crashes, API failures, screen performance |
| Admin | Login failures, privileged actions |
| Infrastructure | CPU, memory, storage, queues |

### Admin Dashboard KPIs

| Dashboard | KPIs |
|-----------|------|
| Business | Users, sessions, revenue/GMV where applicable |
| Charging | Sessions, kWh, completion rate |
| Network | Stations, EVSEs, connectors |
| Availability | Available/In-use/Unknown ratio |
| CPO | Integration health, data freshness |
| Payments | Success/failure/refund |
| Support | Open/closed/SLA |
| System | API uptime, error rate, queue health |

---

## 19. Deployment Architecture

### 19.1 Recommended Production Flow

```
Mobile Android/iOS + Admin Web
        |
     CDN / WAF
        |
  Load Balancer / API Gateway
        |
   Backend Services
        |
  Database / Cache / Queue
        |
  CPO Integration Hub
        |
      CPOs
```

### 19.2 Environment Strategy

| Environment | Purpose |
|-------------|---------|
| Development | Feature development |
| Test | Automated + manual testing |
| Staging/Sandbox | CPO/payment sandbox certification |
| Pilot | Limited real users/CPOs |
| Production | Full controlled launch |

### 19.3 Environment Rules

- Separate development, staging, and production environments
- Secrets separated by environment
- Database migration controls required
- Rollback strategy defined before production deployment
- CI/CD pipelines for all deployment targets

---

## 20. CI/CD Pipelines

| Pipeline | Minimum Controls |
|---------|----------------|
| Mobile Android | Build -> unit test -> security checks -> QA -> Play release |
| Mobile iOS | Build -> unit test -> security checks -> QA -> App Store release |
| Admin Web | Build -> test -> security checks -> deploy |
| Backend | Build -> unit/integration tests -> security scan -> deploy |
| CPO Adapters | Contract tests -> integration tests -> deploy |

### Production Gate Requirements
- Critical security issues closed
- Payment flows certified
- CPO integrations certified
- Start/stop reconciliation tested
- CDR/payment reconciliation tested
- Monitoring enabled
- Support escalation active
- Rollback/disable plan tested

---

## 21. Testing Strategy

### 21.1 Test Categories

| Category | What Is Tested |
|----------|---------------|
| Unit testing | Individual functions/components |
| Widget/component testing | UI components |
| API testing | Backend endpoint contracts |
| Integration testing | Service-to-service interactions |
| CPO contract testing | CPO adapter behaviors |
| Payment testing | Payment flow scenarios |
| End-to-end charging flow | Complete user journey |
| Performance/load testing | Scale and throughput |
| Security testing | Vulnerability and penetration tests |
| Android device testing | Physical/emulator Android |
| iOS device testing | Physical/simulator iOS |
| Browser compatibility | Admin Web across browsers |
| UAT | With real charging partners before launch |

### 21.2 CPO Integration Test Suite

| Test | Expected Result |
|------|----------------|
| TC-01 Credentials | Connection established |
| TC-02 Versions | Supported version identified |
| TC-03 Location | Station visible |
| TC-04 EVSE | Equipment mapped |
| TC-05 Connector | Connector mapped |
| TC-06 Available | Correct Available state |
| TC-07 In use | Correct In Use state |
| TC-08 Unknown | Unknown not converted to Available |
| TC-09 Stale | Freshness warning appears |
| TC-10 Tariff | Correct pre-charge price |
| TC-11 Authorization | Valid user authorized |
| TC-12 Start | Charging confirmed |
| TC-13 Start fail | Failure reconciled |
| TC-14 Stop | Session stopped |
| TC-15 Session | Live state received |
| TC-16 CDR | Final record received |
| TC-17 Duplicate webhook | No duplicate transaction |
| TC-18 CDR mismatch | Exception created |
| TC-19 CPO outage | Graceful degradation |
| TC-20 Credential rotation | Integration remains secure |

### 21.3 Failure Testing

- CPO unavailable
- Payment provider unavailable
- Network timeout
- Duplicate webhook
- Stale status
- Session interruption
- App termination during charging
- CDR delay
- Payment/session mismatch

---

## 22. Scalability & Reliability

### 22.1 Scalability Patterns

- Stateless API services where possible
- Horizontal scaling
- Caching layer (Redis)
- Queue-based CPO data processing
- Database indexing and read optimization
- Connection pooling
- Separate heavy analytics workloads
- Per-CPO rate limiting

### 22.2 Reliability Controls

| Risk | Control |
|------|---------|
| CPO API outage | Retry, timeout, circuit breaker, Unknown status |
| Payment provider outage | Graceful failure and clear user message |
| Database failure | Backups and managed HA where selected |
| Queue failure | Durable queue + retry |
| Mobile network loss | State recovery from backend |
| Duplicate start/stop | Idempotency keys |
| Stale data | Freshness metadata + Unknown state |

### 22.3 Non-Functional Requirements

| Area | Requirement |
|------|-----------|
| Availability | Core API target 99.9% monthly, excluding agreed maintenance |
| Performance | Common read APIs target <500ms under normal load |
| Mobile | Smooth map/list interaction on supported devices |
| Scalability | Horizontal scaling for discovery/session/integration services |
| Security | TLS, encryption, secrets management, RBAC, MFA for privileged users |
| Privacy | Purpose limitation, retention controls, access control, applicable DPDP processes |
| Observability | Logs, metrics, traces and CPO health |
| Resilience | Retries for safe operations, circuit breakers, dead-letter handling |
| Auditability | Financial and privileged actions traceable |

---

## 23. Backup & Disaster Recovery

- Automated database backups
- Point-in-time recovery where supported
- Cross-zone redundancy where required
- Recovery runbooks documented
- Regular restore tests conducted
- Document RPO/RTO targets before production launch

---

## 24. Environment Configuration

All secrets and configuration must be managed per environment. No secrets should be committed to source control.

| Category | Management Approach |
|----------|-------------------|
| CPO API credentials | Secrets manager (per environment) |
| Payment provider keys | Secrets manager (per environment) |
| Database connection strings | Environment-specific secrets |
| Map provider keys | Backend-managed, not in mobile builds |
| Push notification keys | Platform-specific secure config |
| Admin credentials | Identity provider + MFA |
| Signing keys (mobile) | Secure CI/CD secret store |

### Mobile App Configuration Rules
- No CPO API credentials in mobile builds
- No payment provider secret keys in mobile builds
- No direct CPO API endpoints in mobile builds
- Backend-provided configuration where dynamic values are needed

---

## 25. Repository Structure

Recommended project repository layout:

| Project | Purpose |
|---------|---------|
| chargemesh-mobile | Android + iOS cross-platform customer app |
| chargemesh-admin-web | Web-only administration portal |
| chargemesh-api | Core backend APIs |
| chargemesh-cpo-hub | CPO/OCPI integrations and adapters |
| chargemesh-worker | Async jobs and events |
| chargemesh-infra | Infrastructure and deployment (IaC) |
| chargemesh-shared | Shared API contracts/models where appropriate |

---

## 26. API & Integration Rules

1. Mobile never stores CPO API credentials
2. Mobile never calls CPO APIs directly
3. Admin never bypasses the backend to call CPOs directly unless an isolated internal integration tool is explicitly designed
4. All CPO communication passes through the Integration Hub
5. All payment actions pass through the Payment Service
6. All charging sessions are owned by the ChargeMesh backend state machine
7. All financial actions must be traceable by immutable IDs
8. All remote commands must have a correlation/idempotency key
9. CPO-specific failures must be isolated from other CPOs
10. CPO data must never be silently overwritten without source traceability
11. Admin changes to financial or integration settings must be audited

---

## 27. Development Handoff Checklist

- [ ] Freeze platform architecture
- [ ] Select Flutter or React Native for the customer app
- [ ] Select web framework for Admin
- [ ] Define API contracts
- [ ] Define canonical CPO schema
- [ ] Define availability/status rules
- [ ] Define charging state machine
- [ ] Define payment flow
- [ ] Define security model
- [ ] Create development/staging/production environments
- [ ] Create CI/CD pipelines for Android, iOS, Admin Web, and Backend
- [ ] Create CPO integration test harness
- [ ] Create observability dashboards
- [ ] Create disaster-recovery runbook
- [ ] CPO sandbox credentials available for pilot CPOs
- [ ] Payment provider sandbox account configured
- [ ] Admin RBAC roles defined and documented

---

## 28. Analytics Events

| Event | Key Attributes |
|-------|---------------|
| app_opened | user/device/session |
| location_permission_result | result |
| station_search | query, result count |
| station_viewed | station, CPO, distance |
| connector_viewed | EVSE, connector, status |
| filter_applied | filter type/value |
| qr_scanned | QR outcome |
| charging_target_selected | target type/value |
| payment_started | session, amount |
| payment_success | session, amount, provider |
| payment_failed | reason |
| charge_start_requested | CPO, connector |
| charge_started | session |
| charge_interrupted | reason |
| charge_completed | energy, duration, amount |
| refund_created | amount, reason |
| support_ticket_created | category |
| unknown_status_viewed | connector, age |
| stale_status_viewed | connector, age |

---

## 29. CPO Onboarding Technical Flow

| Stage | Owner | Output | Gate |
|-------|-------|--------|------|
| 1. Lead qualification | BD | CPO profile | Commercial interest |
| 2. Discovery | BD/Product/Tech | Capability assessment | Fit confirmed |
| 3. Commercial discussion | BD/Legal | Commercial terms | Commercial approval |
| 4. Technical kickoff | Integration/Tech | Integration plan | Sandbox access |
| 5. Credential exchange | Tech/Security | Secure credentials | Connectivity |
| 6. Data certification | Integration | Location/EVSE/connector mapping | Pass |
| 7. Charging certification | Integration/CPO | Start/stop/session proof | Pass |
| 8. Financial certification | Finance/Tech | Payment/CDR reconciliation | Pass |
| 9. Pilot | Ops/CPO | Limited production | Pass |
| 10. Go-live | All | Production launch | Approval |
| 11. Continuous monitoring | Ops/Tech | SLA reports | Ongoing |

---

## 30. Future Technical Scope

Features outside MVP technical scope:

- Reservation system integration
- Route planning integration
- Smart charging / OCPP charging profiles
- Vehicle telematics integration
- Battery-aware recommendations
- Advanced eco analytics
- Fleet account management system
- Corporate billing and reporting
- Dynamic offers and pricing engine
- Additional CPO integration patterns
- Plug & Charge (ISO 15118) readiness

---

*Document prepared from ChargeMesh Technical Architecture document CM-DOC-04 v3.1 and related product/integration specifications, August 2026.*
