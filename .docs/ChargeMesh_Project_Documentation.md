# ChargeMesh — Project Documentation

> **Document:** CM-PROJ-DOC-01 | **Version:** 1.0 | **Date:** August 2026
> **Status:** Pre-MVP / Planning & Design Phase
> **Audience:** Developers, QA, Project Managers, Business Stakeholders, Future Contributors

---

## Table of Contents

1. [Product Overview](#1-product-overview)
2. [One-Line Concept & Product Promise](#2-one-line-concept--product-promise)
3. [Problem Statement](#3-problem-statement)
4. [Solution Overview](#4-solution-overview)
5. [Core Product Loop](#5-core-product-loop)
6. [What ChargeMesh Is — and Is Not](#6-what-chargemesh-is--and-is-not)
7. [Target Users & Market](#7-target-users--market)
8. [Current Project Status](#8-current-project-status)
9. [Feature Overview by Status](#9-feature-overview-by-status)
10. [Consumer App Modules](#10-consumer-app-modules)
11. [Admin Platform Modules](#11-admin-platform-modules)
12. [User Flows](#12-user-flows)
13. [Charger Status Model](#13-charger-status-model)
14. [Data Freshness Model](#14-data-freshness-model)
15. [Vehicle Compatibility](#15-vehicle-compatibility)
16. [Charging Targets](#16-charging-targets)
17. [Payment Model](#17-payment-model)
18. [CPO Interoperability Strategy](#18-cpo-interoperability-strategy)
19. [Business Model](#19-business-model)
20. [Product Roadmap](#20-product-roadmap)
21. [MVP Definition & Acceptance Criteria](#21-mvp-definition--acceptance-criteria)
22. [Key KPIs](#22-key-kpis)
23. [Major Risks & Mitigation](#23-major-risks--mitigation)
24. [Governance Gates](#24-governance-gates)
25. [Product Principles — Non-Negotiable](#25-product-principles--non-negotiable)
26. [Suggested Team Structure](#26-suggested-team-structure)

---

## 1. Product Overview

**ChargeMesh** is a cross-platform EV charging interoperability platform that solves a fundamental driver problem: an EV driver should not need to understand the charging-network ownership of a charger before using it.

Today, EV drivers discover chargers on a map but encounter different CPOs (Charge Point Operators), different apps, different wallets, different payment processes, different QR flows, inconsistent availability information, and fragmented charging history. ChargeMesh addresses this fragmentation by creating a **unified driver-facing layer** over participating CPO networks.

ChargeMesh is better described as an **interoperability and charging-experience layer** than as another charger-map application.

| Field | Details |
|-------|---------|
| Product | ChargeMesh |
| Product Type | EV charging interoperability / e-mobility platform |
| Consumer Platforms | Android + iOS (one cross-platform application) |
| Operations Platform | Web-only Admin |
| Primary Market | India; initial pilot recommended in Delhi NCR |
| Primary Users | EV drivers |
| Business Partners | CPOs, payment partners, roaming/integration partners |
| Document Version | 3.0 (August 2026) |

---

## 2. One-Line Concept & Product Promise

**Concept:**
> *ChargeMesh = one intelligent EV charging experience across multiple participating charging networks.*

**Product Promise:**
> *Find a compatible charger. Verify its real availability. Understand speed and price. Pay once through a consistent experience. Start charging. Track everything.*

**Tagline:** ONE APP. MULTIPLE NETWORKS. VERIFIED CHARGERS. ONE CHARGING EXPERIENCE. ⚡

**Brand Slogan:** "Charge Green. Drive Smart." / "Charge • Connect • Explore"

---

## 3. Problem Statement

The EV charging ecosystem is fragmented across CPO networks. Drivers may need multiple applications and payment experiences to access charging infrastructure, while charger availability, connector status, tariff, and operational reliability can be inconsistent or difficult to interpret. As a result, finding a charger does not always mean finding a charger that is compatible, available, affordable, and likely to start successfully.

### 3.1 The 10 Core Problems

| # | Problem | Why It Happens | ChargeMesh Response |
|---|---------|---------------|---------------------|
| 1 | Multiple Charging Apps | A driver may need a different app for each CPO | One ChargeMesh app discovers and accesses participating networks |
| 2 | Separate Payment Experiences | Money/payment methods fragmented across apps | One consistent payment experience |
| 3 | Station Available ≠ Connector Available | A station can exist with no usable connector | Show connector-level availability |
| 4 | Status Can Be Unknown or Stale | Third-party data may not be live or complete | Never convert Unknown or stale data into Available |
| 5 | Price Is Not Enough | Users need price + speed + distance | Compare tariff, power, distance and estimated cost |
| 6 | Vehicle Compatibility Is Not Obvious | Different EVs support different connectors | Store vehicle profile and filter/rank compatible chargers |
| 7 | Charger Reliability Is Unknown | A charger can be listed but operationally unreliable | Build a reliability/confidence layer from operational data |
| 8 | Starting Charging Is Inconsistent | CPOs may use app start, QR, or other flows | Provide consistent Find & Charge and Scan & Charge journeys |
| 9 | Charging Targets Differ | Users may want to control spend, time, or energy | Support Amount, Time, and kWh targets where supported |
| 10 | History Is Fragmented | Records live in different apps | Unified ChargeMesh charging history and transaction view |

---

## 4. Solution Overview

ChargeMesh creates a single digital layer between EV drivers and participating charging networks. The platform normalizes charger data, status, tariff, and session information, while keeping CPO-specific complexity inside backend integration adapters.

### 4.1 Consumer Solution
- One Android + iOS app
- One user identity
- One vehicle profile
- One charger discovery experience (map + list + search + filters)
- One connector-level availability model
- One charging session interface
- One charging history
- One support entry point
- One consistent payment experience

### 4.2 Partner Solution
- CPO gets incremental customer reach
- CPO retains operational control of its chargers
- ChargeMesh handles aggregation, normalization, and customer-facing experience
- Settlement remains auditable through sessions/CDRs/payment references

---

## 5. Core Product Loop

| Step | User Question | ChargeMesh Answer |
|------|--------------|-------------------|
| 1. Find | Where can I charge? | Nearby participating chargers on map/list |
| 2. Verify | Can I actually charge there? | Connector-level status + freshness |
| 3. Choose | Which charger is best? | Compatibility + power + price + distance + reliability |
| 4. Pay | How do I pay? | One consistent payment experience |
| 5. Charge | Did charging really start? | Session confirmation + live status |
| 6. Track | What did I spend? | Unified history + invoice + session data |

---

## 6. What ChargeMesh Is — and Is Not

| ChargeMesh **Is** | ChargeMesh **Is Not** |
|-------------------|-----------------------|
| An interoperability layer | A replacement for a CPO's CSMS |
| A driver-facing charging experience | The owner of every physical charger |
| A multi-network discovery platform | A guarantee that every CPO can be integrated |
| A payment orchestration layer | Automatically a regulated wallet issuer |
| A session and reconciliation platform | A substitute for electricity-grid regulation |
| A data-confidence and decision layer | A promise that live data is always perfect |

---

## 7. Target Users & Market

### 7.1 B2C Consumers
- Private EV owners
- Daily city EV drivers
- Highway EV travellers
- New EV owners (confused about compatibility)
- Price-conscious drivers seeking cost control

### 7.2 B2B
- Fleet operators
- Corporate mobility programs
- Leasing/rental operators
- EV dealerships and OEM ecosystems

### 7.3 Infrastructure Partners
- Charge Point Operators (CPOs)
- Charging hardware operators
- Roaming/integration hubs
- Parking operators

### 7.4 Primary Market
- **India** — initial pilot: **Delhi NCR**
- Pilot scope: 3–5 CPO partners, limited controlled station set
- Objective: prove cross-network charging reliability, not maximize station count

---

## 8. Current Project Status

> [!IMPORTANT]
> ChargeMesh is currently in the **Pre-MVP / Planning & Design Phase** (August 2026). No production code has been released. All features described are **planned** unless explicitly noted.

| Phase | Status |
|-------|--------|
| Concept & Product Definition | Complete (v3.0 documents finalized) |
| UI/UX Specification | Complete (v3.0) |
| Technical Architecture | Complete (v3.1) |
| CPO Integration Specification | Complete (v3.0) |
| Legal & Compliance Framework | Complete (v3.0) |
| Development (Mobile App) | Not Started |
| Development (Admin Portal) | Not Started |
| Development (Backend/API) | Not Started |
| CPO Partner Outreach | Not Started |
| Payment Provider Agreement | Not Started |
| Pilot (Delhi NCR) | Not Started |

---

## 9. Feature Overview by Status

### Implemented
*None — project is pre-development*

### Planned for MVP

**Consumer App (Android + iOS):**
- User registration/login (OTP/phone/email)
- Vehicle profile management
- Map-based charger discovery
- List view of nearby chargers
- Search (by location, station name, CPO)
- Availability & connector-level status filters
- Data freshness display
- Station detail view
- Connector detail with compatibility
- QR code scanning to start charging
- Remote start/stop (where CPO supports it)
- Pre-charge confirmation screen
- Payment orchestration (regulated payment provider)
- Live charging session display
- Stop charging
- Session completion & invoice
- Refund and exception state handling
- Charging history (unified across CPOs)
- Invoice/receipt download
- Saved/favourite stations
- Notifications (start, complete, payment, refund)
- Support entry from app

**Admin Portal (Web-only):**
- Dashboard (sessions, payments, CPO health, KPIs)
- CPO management (credentials, protocol, capabilities)
- Station/EVSE/connector mapping & monitoring
- Integration health & sync logs
- Session monitoring (active + failed)
- Payment exceptions & reconciliation
- Refund management
- CDR matching & reconciliation
- Customer support management
- Audit logs
- Role-based access control (RBAC)

### Planned for Post-MVP
- ChargeMesh stored-value wallet (requires legal/regulatory structure)
- Universal reservations across CPOs
- Smart charging optimization
- Fleet accounts & corporate billing
- Vehicle battery telemetry (SOC)
- Battery-% charging target
- Route planning integration
- Eco rewards system

### Explicitly Out of MVP
- Operating a proprietary stored-value wallet without required regulatory/partner structure
- Smart charging optimization
- Vehicle battery telemetry for all OEMs
- Automatic battery-% control across all EVs
- Universal reservation across all CPOs
- Hardware ownership / charging station operation by ChargeMesh
- Guaranteed real-time status for CPOs that cannot provide it
- Charging by voltage as a billing target

---

## 10. Consumer App Modules

| Module | Description | MVP Priority |
|--------|-------------|-------------|
| Splash / Launch | App entry, session restoration | P0 |
| Onboarding | Value proposition, location permission, vehicle setup | P0 |
| Authentication | Phone/email login, OTP, secure sessions | P0 |
| Home / Map | Map-first charger discovery, quick filters | P0 |
| Search | Location, station name, CPO, address | P0 |
| Filter Sheet | Availability, connector, power, price, CPO, vehicle, distance, reliability | P0 |
| Station Detail | Full station information, CPO, connectors, tariff, freshness | P0 |
| Connector Detail | Connector-level status, compatibility, power, tariff | P0 |
| QR Scanner | Scan & Charge journey entry | P0 |
| Charging Target Selection | Amount / Time / Energy targets (where supported) | P0 |
| Pre-Charge Confirmation | Final review before payment authorization | P0 |
| Payment | Regulated payment orchestration | P0 |
| Starting Charging | Async start confirmation display | P0 |
| Live Charging | Real-time energy, cost, power, duration | P0 |
| Stop Charging | Stop command, pending confirmation | P0 |
| Session Complete | Summary, final amount, receipt | P0 |
| Payment/Refund Status | Exception states | P0 |
| Charging History | Unified cross-CPO session history | P0 |
| History Detail | Full session details + invoice | P0 |
| Profile | User account management | P0 |
| Vehicle Management | Add/edit/switch vehicle profiles | P0/P1 |
| Saved Chargers | Favourite stations list | P1 |
| Notifications | Push notifications for charging events | P1 |
| Support | In-app support with automatic session context | P0 |
| Settings / Privacy | Privacy controls, preferences | P0 |
| Eco Impact | CO2 avoided estimates | Post-MVP |
| Wallet | If legally approved payment architecture | Post-MVP |

---

## 11. Admin Platform Modules

| Module | Description | Priority |
|--------|-------------|---------|
| Dashboard | Active sessions, CPO health, payment success, KPIs | P0 |
| CPO Management | CPO profile, credentials, protocol, capabilities, integration health | P0 |
| Station Management | Location -> EVSE -> Connector drill-down | P0 |
| Availability Monitoring | Live connector status across all CPOs | P0 |
| Tariff Management | Tariff synchronization monitoring | P0 |
| Integration Logs | API/webhook/sync error log | P0 |
| Session Monitoring | Active and failed sessions | P0 |
| Payment Monitoring | Transaction states, exceptions | P0 |
| CDR Reconciliation | Match sessions, CDRs, payments | P0 |
| Refund Management | Review/approve refund exceptions | P0 |
| Support Tickets | Customer support case management | P0 |
| Audit Logs | Privileged action audit trail | P0 |
| RBAC / Roles | Role and permission management | P0 |
| Reports & Analytics | Operational and business reports | P0 |
| System Health | API uptime, queue health, infrastructure | P0 |
| User Management | Consumer account management | P0 |

### Admin Roles

| Role | Access |
|------|--------|
| Super Admin | All configuration and privileged controls |
| Operations | CPO/station/session monitoring |
| Finance | Payments/refunds/reconciliation |
| Support | User/session/support information |
| Technical Integration | CPO APIs, logs, mappings |
| Read-only Analyst | Dashboards and reports |

---

## 12. User Flows

### 12.1 Charging Journey A — Find & Charge

```
Open ChargeMesh
-> Location detected / user enters destination
-> Compatible chargers appear on map/list
-> User filters (Available + Fast + compatible connector)
-> User opens a station
-> ChargeMesh shows station, CPO, connector availability, freshness, tariff, power and reliability
-> User selects a connector
-> User selects charging target (Amount / Time / kWh if supported)
-> Payment is authorized
-> ChargeMesh requests authorization/start from CPO
-> ChargeMesh confirms actual session state
-> UI changes to Charging
-> Live session metrics appear
-> User stops or session completes
-> Final session/CDR and payment reconciled
-> Invoice/history generated
```

### 12.2 Charging Journey B — Scan & Charge

```
User arrives physically at a station
-> User taps "Scan QR"
-> ChargeMesh resolves station/CPO/EVSE/connector from QR
-> User confirms the connector
-> ChargeMesh displays applicable tariff and expected payment handling
-> Payment authorization completed
-> Start command sent where supported
-> Actual session state confirmed
-> Charging screen opens
-> Session completed and recorded
```

### 12.3 Session State Machine

```
REQUESTED -> AUTHORIZING -> STARTING -> CHARGING -> STOPPING -> COMPLETED -> RECONCILED

Exception states:
AUTH_FAILED | START_FAILED | INTERRUPTED | STOP_FAILED | RECONCILIATION_REQUIRED | REFUND_REQUIRED | MANUAL_REVIEW
```

### 12.4 Payment State Machine

```
PAYMENT_PENDING -> AUTHORIZED -> CHARGING -> FINALIZING -> CAPTURED -> (RECONCILED)

Exception states:
PAYMENT_FAILED | REFUND_PENDING | REFUNDED | MANUAL_REVIEW
```

---

## 13. Charger Status Model

| Status | Meaning | User Message | Charging Action |
|--------|---------|-------------|----------------|
| AVAILABLE | Source indicates connector can be used | Available | Allow |
| IN_USE | Connector currently occupied | In use | Block |
| UNAVAILABLE | Connector cannot be used | Unavailable | Block |
| RESERVED | Connector reserved | Reserved | Block/conditional |
| OFFLINE | Source says equipment/network offline | Offline | Block |
| UNKNOWN | Current state cannot be confirmed | Status unknown | Policy-controlled warning |
| STALE | Data exists but exceeds freshness threshold | Data delayed | Policy-controlled warning |

> [!IMPORTANT]
> **Golden Rule: UNKNOWN does not equal AVAILABLE. STALE does not equal LIVE.**
> Transparency about uncertainty is a core product feature. If ChargeMesh sends a driver to a charger based on stale data and the charger is unavailable, the product loses trust.

---

## 14. Data Freshness Model

| Field | Purpose |
|-------|---------|
| source_status_timestamp | When the CPO says the status was observed |
| ingested_timestamp | When ChargeMesh received the record |
| last_successful_sync | When the integration last communicated successfully |
| data_age_seconds | Calculated freshness value |
| freshness_state | LIVE / DELAYED / UNKNOWN |

**Consumer Language Examples:**
- "Live — updated 20 sec ago"
- "Updated 2 min ago"
- "Data delayed — updated 14 min ago"
- "Status unknown — live availability could not be confirmed"

---

## 15. Vehicle Compatibility

ChargeMesh stores a vehicle profile and translates technical charger attributes into a simple recommendation.

**Vehicle Profile Fields:** Make / Model / Variant / Connector type(s) / AC capability / DC capability / Max supported power

**Compatibility Badges:** Compatible | Best match | Limited by vehicle | Not compatible

---

## 16. Charging Targets

| Target | Use Case | MVP Status |
|--------|----------|-----------|
| Amount (INR) | Spend a fixed amount | P0 (where supported) |
| Time (min) | Charge for a chosen duration | P1 (where CPO supports session control) |
| Energy (kWh) | Receive a chosen amount of energy | P1 (where CPO exposes control) |
| Battery % | Reach a target SOC | P2 (only where reliable integration exists) |
| Voltage | N/A — voltage is technical data, not a billing target | Never offered as billing target |

---

## 17. Payment Model

### MVP — Payment Orchestration (Model A)
1. User adds a preferred payment method
2. ChargeMesh creates payment authorization for a session
3. Payment processed by a regulated payment provider/partner
4. ChargeMesh records payment and session references
5. Final amount reconciled after CDR/session is received

### Post-MVP — Stored-Value Wallet (Model B)
Requires separate regulatory authorization under RBI's PPI directions. Not assumed for MVP.

### Payment/Session Reconciliation Chain
```
Payment Intent -> Authorization -> Charging Session -> CDR -> Final Tariff -> Capture/Refund -> Settlement
```

---

## 18. CPO Interoperability Strategy

**Preferred Protocol:** OCPI 2.3.0 (current official release)
- Supported modules: Locations, Tariffs, Tokens, Commands, Sessions, CDRs, Payments (optional), Bookings (optional)

**Fallback:** Proprietary CPO API adapter (isolated from mobile app)

**Architecture Rule:** Mobile app must never connect directly to individual CPO APIs. All CPO communication passes through the ChargeMesh CPO Integration Hub.

### CPO Capability Matrix (MVP Requirements)

| Capability | MVP Required | Why |
|-----------|-------------|-----|
| Location data | Yes | Discovery |
| EVSE/connector data | Yes | Connector-level UI |
| Availability/status | Yes | Decision making |
| Tariff | Yes | Price transparency |
| Authorization | Yes (for remote charging) | User access |
| Sessions | Yes | Live state |
| CDRs | Yes | Final billing/reconciliation |
| Start/Stop | Yes (where supported) | Charging control |
| Booking | No / Later | Reservation feature |
| Smart charging | Later | Advanced capability |

---

## 19. Business Model

| Model | Description | Best Fit |
|-------|-------------|---------|
| Per-session fee | ChargeMesh earns a fee per completed session | MVP |
| Revenue share | Agreed share with CPO | Strategic CPO partners |
| Wholesale | Commercial charging rate + ChargeMesh margin | Large CPO agreements |
| Enterprise/fleet | Charging management and analytics | Phase 2/3 |
| Premium user | Advanced features | Later |
| Integration fee | Technical onboarding fee | Enterprise CPOs |

---

## 20. Product Roadmap

| Phase | Focus | Key Outcomes |
|-------|-------|-------------|
| Phase 0 | Research + CPO outreach | Validate integration and commercial assumptions |
| Phase 1 — MVP | 3-5 CPO pilot + core charging journey | Cross-network charging works reliably in Delhi NCR |
| Phase 2 — Scale | More CPOs + reliability + better payments | Expand network, improve data quality |
| Phase 3 — B2B/Fleet | Fleet controls + corporate billing | Fleet and enterprise customers |
| Phase 4 — Advanced | Reservations, smart charging, deeper vehicle integrations | Full-featured platform |

---

## 21. MVP Definition & Acceptance Criteria

### Consumer App — P0 MVP Features
Login/onboarding | Vehicle setup | Map | Search | Filters | Station detail | Connector detail | Availability | Freshness | Navigation | QR scan | Payment | Start/stop where supported | Live charging | History | Invoice | Support

### Admin — P0 MVP Features
Dashboard | CPO management | Station/EVSE/connector mapping | Integration health | Session monitoring | Payment monitoring | CDR/reconciliation | Support | Audit

### Acceptance Criteria
- User can create/login to an account
- User can add a vehicle
- User can locate nearby participating chargers
- Map and list both work
- User can filter by availability and compatibility
- Station detail shows CPO and connector information
- Connector status is shown separately from station status
- Unknown and stale status are visibly different
- Tariff and power are visible before charging
- User can navigate to a station
- User can scan a supported QR
- User can complete supported payment flow
- System confirms charging before showing active session
- Live session displays supported metrics
- User can stop charging where supported
- Final session is recorded
- Payment and CDR/session are reconciled or placed in exception state
- History and invoice/receipt are available
- Admin can see integration/session/payment health

---

## 22. Key KPIs

| KPI | Meaning | Target Direction |
|-----|---------|----------------|
| Search -> station open | Discovery usefulness | Increase |
| Station -> connector select | Detail usefulness | Increase |
| Connector -> start attempt | Action intent | Increase |
| Start success rate | Operational success | Increase |
| Session completion rate | End-to-end quality | Increase |
| Payment success rate | Payment reliability | Increase |
| Unknown exposure rate | Data quality problem | Decrease |
| Stale exposure rate | Freshness problem | Decrease |
| Refund rate | Failure/financial quality | Decrease |
| Repeat charging rate | Retention | Increase |
| Support contacts/session | Friction | Decrease |
| CDR reconciliation rate | Financial integrity | Increase |

---

## 23. Major Risks & Mitigation

| Risk | Impact | Mitigation |
|------|--------|-----------|
| CPO integration inconsistency | High | OCPI-first + adapter architecture |
| Stale availability data | High | Freshness engine + Unknown/Stale states |
| Charging start failure | High | Confirm actual session state + reconciliation |
| Payment mismatch | High | Payment/session/CDR correlation + idempotency |
| Wallet regulation | High | PSP-led MVP; regulatory review before stored-value wallet |
| Low CPO participation | High | Strong partner value proposition + pilot |
| Low user adoption | High | Solve reliability, not just aggregation |
| Incorrect compatibility data | High | Vehicle capability database + clear caveats |
| Data privacy breach | High | DPDP-aligned privacy/security design |
| Support complexity | Medium | Clear CPO responsibility matrix |

---

## 24. Governance Gates

| Gate | Decision |
|------|---------|
| G0 | Problem validated |
| G1 | CPO partner feasibility validated |
| G2 | Payment model legally/technically validated |
| G3 | Prototype UX validated |
| G4 | Sandbox integrations validated |
| G5 | Pilot readiness |
| G6 | Pilot success / scale decision |

---

## 25. Product Principles — Non-Negotiable

1. Unknown must remain Unknown
2. Station availability must not hide connector availability
3. A successful API response does not automatically mean physical charging started
4. Voltage is technical data, not a normal billing target
5. Payment and charging session must be reconciled
6. CPO failures must be isolated
7. CPO-specific logic stays in the backend
8. User should not need to understand CPO ownership to find a charger
9. Reliability information must be transparent and explainable
10. The product must never promise more data freshness than the CPO actually provides

---

## 26. Suggested Team Structure

| Role | Initial Need |
|------|-------------|
| Product/Founder | 1 |
| Mobile Engineers | 2-3 |
| Backend/Integration Engineers | 2-3 |
| UI/UX Designer | 1 |
| QA/API/Performance | 1-2 |
| DevOps/Cloud | 0.5-1 |
| CPO Partnership Lead | 1 |
| Operations/Support | 1-2 |
| Legal/Payment Advisor | External/part-time |

---

*Document prepared from ChargeMesh source documents CM-DOC-01 through CM-DOC-06 and UI/UX Design Notes v1.0, August 2026.*
