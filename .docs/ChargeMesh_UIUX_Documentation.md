# ChargeMesh — UI/UX Documentation

> **Document:** CM-UIUX-DOC-01 | **Version:** 1.0 | **Date:** August 2026
> **Status:** Specification Complete — Design & Prototype Phase
> **Audience:** UI/UX Designers, Frontend Engineers, QA, Product Managers

---

## Table of Contents

1. [Design Vision & Philosophy](#1-design-vision--philosophy)
2. [Brand Identity](#2-brand-identity)
3. [Logo Assets](#3-logo-assets)
4. [Color System](#4-color-system)
5. [Typography](#5-typography)
6. [Design System Foundation](#6-design-system-foundation)
7. [Status Design Language](#7-status-design-language)
8. [Navigation Architecture](#8-navigation-architecture)
9. [Screen Inventory](#9-screen-inventory)
10. [Screen Specifications — Consumer App](#10-screen-specifications--consumer-app)
11. [Map Experience](#11-map-experience)
12. [Station & Connector Experience](#12-station--connector-experience)
13. [Charging Flow UX](#13-charging-flow-ux)
14. [Payment UX](#14-payment-ux)
15. [QR Scanner UX](#15-qr-scanner-ux)
16. [Error & Unknown State UX](#16-error--unknown-state-ux)
17. [Charging History & Profile UX](#17-charging-history--profile-ux)
18. [Admin Web UX](#18-admin-web-ux)
19. [Component Library](#19-component-library)
20. [Accessibility](#20-accessibility)
21. [Motion & Interaction Guidelines](#21-motion--interaction-guidelines)
22. [UX Copy Rules](#22-ux-copy-rules)
23. [Loading / Empty / Error Patterns](#23-loading--empty--error-patterns)
24. [Figma File Structure](#24-figma-file-structure)
25. [Core Prototype Flows](#25-core-prototype-flows)
26. [UX Metrics](#26-ux-metrics)
27. [Designer Handoff Rules](#27-designer-handoff-rules)
28. [Designer Handoff Checklist](#28-designer-handoff-checklist)
29. [UX Acceptance Checklist](#29-ux-acceptance-checklist)

---

## 1. Design Vision & Philosophy

### 1.1 Design Vision

ChargeMesh should look like a **premium mobility platform first** and an eco-friendly product second. Sustainability should be visible through calm visual language, impact insights, and responsible interaction — not through excessive green graphics.

> One-Line Design Brief: *Design ChargeMesh as a premium, calm and trustworthy EV mobility platform where sustainability is embedded into the experience — not painted on top of it.*

### 1.2 Core Design Personality

| Attribute | Direction |
|-----------|-----------|
| Primary feel | Clean, premium, intelligent |
| Secondary feel | Eco-friendly, calm, trustworthy |
| UX character | Fast, simple, transparent |
| Visual inspiration | Premium mobility + maps + fintech + clean energy |
| Avoid | Overly green, cartoonish, cluttered utility-app appearance |

### 1.3 Design Keywords

Clean • Sustainable • Premium • Intelligent • Minimal • Trustworthy • Modern • Calm

### 1.4 UX Vision

ChargeMesh should feel like a normal consumer mobility app even though its backend is an interoperability platform. The user should never have to understand OCPI, EVSE identifiers, CPO APIs, roaming agreements, or CDRs.

### 1.5 UX Principles

| Principle | Design Rule |
|-----------|------------|
| Trust | Never present Unknown/Stale as Available |
| Clarity | Use plain language before technical terminology |
| Connector-first | Show the exact connector the driver will use |
| Freshness | Show when operational data was last updated |
| Action-oriented | Every important screen has one clear primary action |
| CPO-neutral | CPO branding is visible but does not fragment the experience |
| Progressive disclosure | Show essential information first; technical detail on demand |
| Error honesty | Explain uncertainty and failure without blaming the user |
| Payment confidence | Always show what is being authorized and what happens next |
| Recovery | Every failure state provides a useful next action |

---

## 2. Brand Identity

### 2.1 Brand Direction
- Modern mobility
- Clean and premium but practical
- Trustworthy
- Minimal visual noise
- High readability in outdoor conditions (critical for a charging app used outside)

### 2.2 Core Design Principles (FIND -> VERIFY -> SELECT -> PAY -> CHARGE -> TRACK -> IMPACT)

1. **Find** — locate the right charger quickly
2. **Verify** — show real availability and data freshness
3. **Select** — make connector, power, and price comparison easy
4. **Pay** — make payment simple and transparent
5. **Charge** — provide clear live session information
6. **Track** — maintain charging and payment history
7. **Impact** — show sustainability without distracting from charging

### 2.3 Brand Slogans
- "Charge Green. Drive Smart."
- "Charge • Connect • Explore"
- "ONE APP. MULTIPLE NETWORKS. VERIFIED CHARGERS. ONE CHARGING EXPERIENCE."

---

## 3. Logo Assets

The following logo files are available in the project source:

| File | Use Case |
|------|----------|
| cm_logo.png | Primary full logo (charger station + leaf motif + "ChargeMesh" wordmark + "Charge • Connect • Explore" tagline) |
| cm_web_logo.png | Web header / admin portal logo |
| cm_web_logo_trans.png | Web logo with transparent background |
| cm_fevicon_logo.png | Favicon / app icon |
| cm_fevicon_logo_trans.png | Favicon / icon with transparent background |

### 3.1 Logo Description
The ChargeMesh logo features:
- A 3D-style EV charging station unit in dark/grey
- A green lightning bolt on the charging screen
- Green leaf motifs (eco/sustainability signal)
- Dark green circular base platform
- EV charging cable/connector element
- Bold wordmark: "ChargeMesh" ("Charge" in dark/navy, "Mesh" in brand green)
- Subtitle tagline in small caps: "CHARGE • CONNECT • EXPLORE"

### 3.2 Logo Usage Rules
- Use official logo files only — do not recreate from screenshots
- Maintain minimum clear space around the logo
- Do not distort, recolor, or modify logo proportions
- Use transparent version on colored backgrounds
- Use web logo in admin portal header
- Use favicon/icon in app icon contexts

---

## 4. Color System

### 4.1 Primary Palette

| Role | Color Name | Hex | Use |
|------|-----------|-----|-----|
| Primary Green | Brand Primary | #16A34A | Primary CTA, available status, success, eco indicators |
| Dark Green | Brand Dark | #064E3B | Brand headers, hero sections |
| Eco Light | Surface Light | #ECFDF5 | Cards, impact areas, subtle backgrounds |
| Background | App Background | #F8FAF9 | Main app background |
| Text Primary | Dark | #111827 | Primary text |
| Text Secondary | Grey | #6B7280 | Supporting/metadata text |
| Border | Light Grey | #E5E7EB | Dividers, card borders |

### 4.2 Status Color Semantics

| Status | Color | Hex | Use |
|--------|-------|-----|-----|
| Available | Green | #16A34A | Confirmed available connector |
| In Use | Orange | ~#F97316 | Currently occupied connector |
| Unavailable | Red | ~#DC2626 | Confirmed unavailable |
| Unknown | Grey | #6B7280 | Status cannot be confirmed |
| Reserved | Blue | ~#2563EB | Reservation state |
| Offline | Muted Red/Grey | — | Equipment offline |
| Stale | Warning Orange/Yellow | ~#D97706 | Data delayed |

> [!IMPORTANT]
> **Critical Rule:** Unknown status must NEVER use the Available/green treatment. Do not rely on color alone — every status must also have text and/or icon treatment.

### 4.3 Semantic Color Rules

| Semantic | Use |
|----------|-----|
| Primary | Brand action / selected state |
| Success | Available / charging started |
| Warning | Unknown / stale / caution |
| Error | Failed / unavailable |
| Neutral | In use / inactive / metadata |

---

## 5. Typography

### 5.1 Recommended Font

**Primary:** Manrope
**Alternatives:** Inter or Poppins

### 5.2 Type Scale

| Use | Size | Weight |
|-----|------|--------|
| Screen title | 28-32 px | Bold |
| Heading | 24-28 px | Bold |
| Section title | 18-22 px | Semibold |
| Body | 14-17 px | Regular |
| Supporting / metadata | 12-14 px | Regular |
| Primary CTA | 15-17 px | Semibold |
| Numbers / prices | 15-17 px | Semibold/Bold for scanability |

---

## 6. Design System Foundation

### 6.1 Spacing
- Use consistent 4/8px grid
- Card padding: 16-24px
- Section margins: 16-24px
- Component gaps: 8-12px

### 6.2 Border Radius
- Cards: 16-24px radius
- Buttons: 8-12px radius
- Chips/badges: Full rounded (pill) or 8px radius
- Bottom sheet: Large radius (16-24px) at top corners

### 6.3 Elevation & Shadow
- Light shadow for cards: subtle 1-4dp equivalent
- Bottom sheet: stronger shadow/overlay
- Map markers: high contrast, minimal shadow

### 6.4 Iconography
- Simple, consistent icon set
- Use recognized EV/charging iconography where available
- Lightning bolt for charging/energy
- Leaf for eco/sustainability
- Pin/marker for location
- Status icons always accompanied by text label

---

## 7. Status Design Language

| Backend State | User Label | UI Treatment | Primary Action |
|--------------|-----------|-------------|----------------|
| AVAILABLE | Available | Green positive status + connector count | Select |
| CHARGING / IN_USE | In use | Orange/neutral occupied | View alternatives |
| UNAVAILABLE | Unavailable | Muted/error red | Nearby options |
| OUTOFORDER | Out of order | Error red | Nearby options |
| RESERVED | Reserved | Blue/warning | Nearby options |
| OFFLINE | Offline | Muted/error | Nearby options |
| UNKNOWN | Status unknown | Warning grey | Refresh / alternatives |
| STALE | Data delayed | Warning + timestamp | Refresh / alternatives |

### Map Marker Status

| State | Marker Style | Meaning |
|-------|-------------|---------|
| Available | Green + lightning bolt | Latest data indicates available |
| In Use | Orange | Currently occupied |
| Unavailable | Red | Confirmed unavailable |
| Unknown | Grey | Could not confirm |
| Reserved | Blue | Reserved |

---

## 8. Navigation Architecture

### 8.1 Bottom Navigation (Consumer App)

| Tab | Purpose |
|-----|---------|
| Home | Personalized nearby charging |
| Map | Full charger discovery |
| Charge | QR / quick charging entry |
| Activity | Sessions, payments, invoices (History) |
| Profile | Vehicle, account, and settings |

**Alternative Naming (from PRD):**
```
HOME / MAP -> CHARGING -> HISTORY -> SAVED -> PROFILE
```

### 8.2 Charging Tab Behavior
- If no active session: show nearby chargers and Scan QR
- If active session: open live charging session directly

### 8.3 Global Actions (Available from any screen)
- Search
- Filter
- Current location
- Scan QR
- Notifications
- Help/Support

### 8.4 Core Object Hierarchy
```
Location -> EVSE -> Connector -> Session -> Payment/CDR
```

### 8.5 Admin Web Navigation
```
Dashboard | CPOs | Locations | EVSE/Connectors | Sessions | Payments | Reconciliation | Support | Reports | Settings | Audit
```

---

## 9. Screen Inventory

### Consumer App Screens (32 Total)

| # | Screen | Priority |
|---|--------|---------|
| 01 | Splash / app launch | P0 |
| 02 | Welcome / onboarding | P0 |
| 03 | Login / verification | P0 |
| 04 | Vehicle setup | P0 |
| 05 | Home / map | P0 |
| 06 | Search | P0 |
| 07 | Filter sheet | P0 |
| 08 | Station card (map popup) | P0 |
| 09 | Station detail | P0 |
| 10 | Connector detail | P0 |
| 11 | Pre-charge confirmation | P0 |
| 12 | Payment | P0 |
| 13 | QR scanner | P0 |
| 14 | Starting charging | P0 |
| 15 | Live charging | P0 |
| 16 | Stop confirmation | P0 |
| 17 | Session complete | P0 |
| 18 | Payment/refund status | P0 |
| 19 | History | P0 |
| 20 | History detail | P0 |
| 21 | Saved chargers | P1 |
| 22 | Notifications | P1 |
| 23 | Profile | P0 |
| 24 | Vehicle management | P1 |
| 25 | Support | P0 |
| 26 | Settings/privacy | P0 |
| 27 | Web Admin dashboard | P0 |
| 28 | CPO management | P0 |
| 29 | Station/connector management | P0 |
| 30 | Session monitoring | P0 |
| 31 | Payments/reconciliation | P0 |
| 32 | Integration health | P0 |

---

## 10. Screen Specifications — Consumer App

### 10.1 Splash / Launch

**Purpose:** Quick brand entry while app restores secure session and cached configuration.

| State | Behavior |
|-------|---------|
| Loading | Show logo, do not block longer than necessary |
| Authenticated | Redirect to Home |
| Unauthenticated | Redirect to Welcome |
| Network unavailable | Cached shell + retry |

**Rule:** Do not block the user with a long splash. Backend synchronization continues after the shell is available.

### 10.2 Onboarding (4 Screens)

| Screen | Content |
|--------|---------|
| Screen 1 — Value Proposition | "Charge across networks with one app." + Get Started CTA |
| Screen 2 — Location | Request location permission with purpose explanation. Allow Location / Enter Manually |
| Screen 3 — Vehicle | Add EV for compatible connector prioritization. Make -> Model -> Variant -> Save |
| Screen 4 — Payment | Add supported payment method. May be skippable until first charge |

### 10.3 Authentication

| Element | Requirement |
|---------|------------|
| Phone/email | Use configured authentication method |
| Verification | OTP or provider-supported verification |
| Error | Explain incorrect/expired code |
| Resend | Countdown timer + resend option |
| Security | Do not expose account existence unnecessarily |
| Post-login | Return user to intended action where safe |

### 10.4 Home / Map — Primary Screen

**Layout:**
- Top: location/search bar
- Below search: quick filters
- Center: full-screen map
- Bottom: nearby charger preview / draggable bottom sheet
- Floating: current location button + Scan QR button

**Quick Filters:**
- Available now | Fast | My EV | Under selected price | Nearby

**Map Marker:** Must communicate availability at a glance but must not imply every connector is available.

### 10.5 Station Map Card (Compact)

| Information | Display |
|------------|---------|
| Name | Station name |
| CPO | Operator/network |
| Distance | e.g. 2.4 km |
| Availability | e.g. 2/4 compatible connectors available |
| Power | e.g. DC up to 60 kW |
| Price | e.g. from INR X/kWh |
| Freshness | e.g. Updated 35 sec ago |
| Reliability | Optional score/badge |
| CTA | View chargers |

> [!NOTE]
> Use "2/4 compatible connectors available" rather than simply "Available" when the user's vehicle profile is known.

### 10.6 Search Screen

**Search types:** Nearby place | Station name | CPO name | Address | Destination

**Results:** Prioritize compatible and operationally useful charging locations.

**Empty state:** "No compatible chargers found nearby. Try increasing your search radius or changing filters."

### 10.7 Filter Sheet

| Filter | Controls |
|--------|---------|
| Availability | Available only / Include unknown |
| Vehicle | Selected vehicle |
| Connector | CCS2 / Type 2 / CHAdeMO / GB/T / other |
| Power | AC/DC + minimum kW |
| Price | Tariff range |
| Distance | Radius (1/5/10/25 km) |
| CPO | Network selection |
| Reliability | Minimum score |

Filters should be persistent for the current search session but easy to clear.

---

## 11. Map Experience

The map is the heart of ChargeMesh. Keep it visually calm and make charger status immediately scannable.

### Map Display Rules
- Show charger clusters at low zoom
- Show individual chargers at high zoom
- Use status-aware markers (green/orange/red/grey)
- Allow list view for accessibility and comparison
- Marker must not imply every connector at the station is available

### Map UX
- Tap marker -> Open compact station card
- Expand station card -> Station detail

### Quick Filters on Map
- Available | Fast | CCS2 | AC | Near Me | My EV

---

## 12. Station & Connector Experience

### 12.1 Station Detail Layout

**Header:** Station name | CPO/network | Distance | Navigation button

**Decision Summary (example):**
> "2 compatible connectors available • DC fast • INR 18/kWh • Updated 20 sec ago"

**Station Information:**
- Address
- Opening/access hours
- Parking restrictions
- Facilities
- Entrance/directions
- Help number when supplied
- Photos

### 12.2 Connector List

| Connector Card Field | Example |
|---------------------|---------|
| Connector ID | Connector 1 |
| Type | CCS2 |
| Charging | DC |
| Max power | 60 kW |
| Status | Available |
| Freshness | Updated 22 sec ago |
| Compatibility | Compatible with your EV |
| Tariff | INR 18/kWh |
| Action | Select |

### 12.3 Connector Card States

| State | Action |
|-------|--------|
| Available | Select CTA |
| In use | See nearby alternatives |
| Unknown | View warning |
| Stale | Refresh option |
| Out of order | Disabled |

### 12.4 Reliability UI

Example display:
> "Reliability 92% • 48 recent sessions • 44 successful starts"

With a small "How calculated?" link explaining:
- Recent start success
- Recent faults
- Data freshness
- Verified user reports where available

**Rule:** Never present the score as a guarantee.

---

## 13. Charging Flow UX

### 13.1 Charging Target Selection

| Tab | Quick Options | Custom |
|-----|-------------|--------|
| Amount | INR 200 / INR 500 / INR 1,000 | Custom amount |
| Time | 15 min / 30 min / 60 min | Custom duration |
| Energy | 5 kWh / 10 kWh / 20 kWh | Custom kWh |

**Rule:** Only display target modes the selected CPO/session/payment integration actually supports.

### 13.2 Pre-Charge Confirmation

**Purpose:** Final confirmation before financial authorization and charging start.

| Information | Example |
|------------|---------|
| Station | HPCL Usha Speedway |
| CPO | Example CPO |
| Connector | CCS2 • Connector 2 |
| Power | 60 kW |
| Status | Available • updated 20 sec ago |
| Vehicle | Your selected EV • Compatible |
| Tariff | INR 18/kWh |
| Target | INR 500 / 30 min / 20 kWh |
| Primary CTA | Start Charging |
| Secondary | Cancel |

### 13.3 Starting Charging Screen

Shows async start progress:
1. Payment authorization
2. CPO authorization
3. Start command
4. Confirm actual session state

**Timeout state:**
> "We are still checking the charger. Do not start another session yet."
> Actions: Check Status | Contact Support

### 13.4 Live Charging Screen

**Primary visual:** Large live charging state + energy/cost/time

| Metric | Example |
|--------|---------|
| Status | Charging |
| Energy | 12.4 kWh |
| Duration | 18:42 |
| Power | 48.2 kW |
| Estimated cost | INR 223 |
| Battery | 62% — only if reliably available |
| Connector | CCS2 • Connector 2 |
| Trust indicator | Last updated 8 sec ago |

**Actions:** Stop Charging | View Session Details | Support

### 13.5 Stop Charging Confirmation

**Confirmation:** "Your current session will be stopped. Final cost will be calculated from the charging session."

**Pending stop state:**
> "Stopping your session… We are waiting for confirmation from the charging network."

### 13.6 Session Complete Screen

| Metric | Example |
|--------|---------|
| Energy | 18.6 kWh |
| Duration | 31 min |
| Final amount | INR 334.80 |
| Station | Example station |
| Connector | CCS2 • 2 |
| CPO | Example CPO |
| Optional eco impact | CO2 avoided (if feature enabled) |

**CTAs:** View Receipt | Done

---

## 14. Payment UX

### 14.1 Payment Screen

| Element | Requirement |
|---------|------------|
| Amount | Clearly show authorization/estimated amount |
| Tariff | Show applicable rate |
| Payment method | Selected method display |
| Target | Show selected charging target |
| Terms | Short, understandable charging/payment condition |
| CTA | Confirm & Start Charging |
| Security | Do not expose sensitive payment credentials |

> If final cost depends on actual energy/session duration, label the amount as "authorization/estimated amount" rather than a guaranteed final bill.

### 14.2 Payment/Refund Exception Screens

| Scenario | Message |
|----------|---------|
| Payment failed before start | "Payment could not be authorized. No charging session was started." |
| Payment authorized, charging failed | "Your payment authorization is being released/reversed. You do not need to pay again unless instructed." |
| Final amount pending | "Your charging session is complete. We are confirming the final amount." |
| Manual review | "We need to verify this transaction. Your reference number is shown for support." |

---

## 15. QR Scanner UX

### 15.1 Scanner UI
- Large camera frame
- Flash toggle
- Manual charger code entry fallback
- Help text: "Scan the QR on the charger"

### 15.2 Success Flow
```
Station found -> Connector identified -> Continue to pre-charge confirmation
```

### 15.3 Failure States
- Invalid QR — offer manual station search
- Expired QR — offer manual station search
- Unsupported CPO — offer manual station search
- Connector not found — offer manual station search
- Station offline — show status + manual search

**Rule:** Every QR failure must offer manual station search.

---

## 16. Error & Unknown State UX

### 16.1 Unknown Status

```
Warning icon — Status unknown
"We couldn't confirm the connector's current status."
"Last known update: 12 minutes ago."
```

| Action | Purpose |
|--------|---------|
| Refresh status | Try to obtain newer data |
| Show nearby available | Reduce user risk |
| View details | Let user decide |

**Rule:** Do not use a green "Available" CTA when the current state is Unknown.

### 16.2 Stale Status

```
Warning icon — Availability data may be delayed
"Last update: 9 minutes ago. The connector may not be available now."
Primary: Refresh | Secondary: Nearby chargers
```

**Design Rule:** The timestamp should be visually near the status, not hidden inside a technical details screen.

### 16.3 Edge Case UX Responses

| Scenario | UX Response |
|----------|------------|
| GPS denied | Allow manual location search |
| No stations found | Show alternative radius/search guidance |
| No compatible chargers | Explain compatibility and show alternatives |
| All connectors busy | Show busy state + nearby options |
| Status unknown | Show warning; do not imply availability |
| Stale status | Show last update |
| CPO API down | Disable affected live actions; keep unaffected discovery |
| Payment timeout | Do not duplicate payment; show pending state |
| Start timeout | Reconcile before retry |
| Start failed after payment | Release/reverse/refund according to provider flow |
| App killed during charging | Session remains server-side; recover on reopen |
| Network lost during charging | Do not assume completion; recover from backend/CPO state |
| QR invalid | Allow manual station search |

### 16.4 No Chargers State

Example: "No compatible chargers found nearby. Try increasing your search radius or changing filters."

---

## 17. Charging History & Profile UX

### 17.1 History List Card

| Field | Example |
|-------|---------|
| Date | 16 Aug 2026 |
| Station | Example station |
| CPO | Example CPO |
| Energy | 18.6 kWh |
| Amount | INR 334.80 |
| Status | Completed |

**Filters:** Date | CPO | Completed/Failed/Refunded | Vehicle

### 17.2 History Detail

- Session ID
- Station / CPO / Connector
- Start/end time
- Energy / Duration / Tariff / Final amount
- Payment reference / Refund status
- Invoice/receipt download
- Support entry

### 17.3 Notifications

| Notification | Example |
|-------------|---------|
| Start | Charging started at [Station]. |
| Complete | Charging completed. INR 334.80 charged. |
| Payment | Payment authorization failed. |
| Refund | INR 500 refund completed. |
| Saved charger | Availability changed — verify before driving. |

**Rule:** Availability notifications must be used cautiously — data may be delayed.

### 17.4 Profile Screen

- Name
- Mobile/email
- Payment methods
- Vehicles
- History
- Saved chargers
- Balance/payment references
- Eco impact
- Notifications
- Help & Support
- Settings
- Logout

### 17.5 Vehicle Management

| Field | Options |
|-------|---------|
| Make | EV manufacturer |
| Model | Vehicle model |
| Variant | Specific variant |
| Connector | Type supported |
| AC/DC capability | Charging capability |
| Maximum supported power | kW |

**Compatibility Badge:** Compatible | Best match | Limited by vehicle | Not compatible

### 17.6 Saved Chargers

- Saved station list
- Current availability (with caveat)
- Distance
- Last updated
- Quick navigation

**Rule:** Saved status must never be treated as guaranteed future availability.

### 17.7 Support UX

**Entry Points:** Station detail | Active session | History detail | Profile

**Issue Categories:**
- Charger unavailable
- Charging did not start
- Charging stopped unexpectedly
- Payment issue
- Refund issue
- Wrong tariff
- Other

**Rule:** Automatically attach station/session/payment references to reduce repeated questions.

---

## 18. Admin Web UX

### 18.1 Dashboard Cards

- Active charging sessions
- Available connectors
- Unknown/stale connectors
- Payment success rate
- Start failures
- CPO integrations healthy
- Reconciliation exceptions

### 18.2 CPO Management Table

| Column | Display |
|--------|---------|
| CPO | Name/logo |
| Protocol | OCPI / Proprietary |
| Version | 2.3.0 etc. |
| Status | Healthy / Degraded / Down |
| Last sync | Timestamp |
| Stations | Count |
| Sessions | Active count |
| Actions | View / Configure / Logs |

### 18.3 Location/Connector Drill-Down

Admin can drill down:
```
CPO -> Location -> EVSE -> Connector
```

Per connector view shows: Source ID | ChargeMesh ID | Status | Last updated | Power | Connector type | Tariff | Mapping status | Error history

### 18.4 Session Monitoring Table

| Column | Purpose |
|--------|---------|
| Session ID | Traceability |
| User | Customer reference |
| CPO | Network |
| Station | Physical location |
| Connector | Exact charging point |
| Start time | Session timing |
| Status | Current state |
| Energy | Usage |
| Amount | Financial state |
| Payment | Payment reference/state |
| CDR | Reconciliation state |

### 18.5 Payments & Reconciliation

- Payment transaction list
- Authorization state
- Capture state
- Refund state
- Session link
- CDR link
- Mismatch queue
- Manual review queue
- Audit trail

**Rule:** Financial interfaces should make it impossible to accidentally treat an unreconciled session as fully settled.

### 18.6 Integration Health Display

| Signal | Display |
|--------|---------|
| API health | Healthy / degraded / down |
| Last successful sync | Timestamp |
| Status freshness | Age in seconds/minutes |
| Webhook health | Success/failure rate |
| Command health | Start/stop success rate |
| CDR health | Pending/matched count |
| Error rate | Trend graph |

---

## 19. Component Library

### Primary Components

- Primary button (green filled, high contrast)
- Secondary button (white/outlined)
- Tertiary button
- Disabled button (neutral grey)
- Status badge/chip (color + text, never color alone)
- Connector card
- Station card
- Price card
- Power badge
- Freshness badge
- Reliability badge
- Vehicle compatibility badge
- Filter chip
- Bottom sheet (large radius, strong hierarchy)
- Map marker (high contrast, minimal)
- Payment method card
- Session metric card
- Error banner
- Warning banner
- Toast notification
- Modal dialog
- Confirmation sheet
- Navigation bar (bottom)

### Admin Components

- Admin data table
- Admin filter controls
- Admin status pill
- Admin audit row
- CPO health widget
- KPI card
- Reconciliation row
- Exception queue item

---

## 20. Accessibility

- Minimum readable text sizes (respect OS text scaling)
- High contrast — do not communicate status by color alone
- Text labels accompany all status colors
- Large touch targets (minimum 44x44px)
- Screen-reader labels for map markers and connector status elements
- Meaningful button labels (not just "OK" or "Submit")
- Error messages readable by assistive technologies
- Map information available in list form
- Support text scaling where platform allows
- Accessible labels for map markers and controls

---

## 21. Motion & Interaction Guidelines

### What to Use
- Subtle map-marker transitions when status changes
- Useful charging-progress animation on live charging screen
- Optional haptics for QR scan, session start, session stop
- Skeleton loading cards for station/connector data
- Bottom sheet animation (slide up)
- Standard page transitions

### What Not to Do
- Never animate to imply live availability when data is stale
- Do not use loading spinners that suggest instant data when polling CPOs
- Avoid distracting animations in payment/charging confirmation flows
- Do not use transition animations that obscure status information

---

## 22. UX Copy Rules

| Technical/Internal | Consumer-Facing Copy |
|--------------------|---------------------|
| "OCPI command failed" | "Charging could not be started" |
| "stale cache" | "Data may be delayed" |
| "webhook pending" | "Payment is being confirmed" |
| "CDR reconciliation pending" | "Final amount is being calculated" |
| "API failure" | "Status unknown" |
| "STATUS: UNKNOWN" | "Status unknown — we couldn't confirm availability" |

**Additional rules:**
- Keep CPO/API terminology in technical/admin screens only
- Use first-person language for user states ("Your session", "Your payment")
- Use active voice for instructions ("Scan the QR code on the charger")
- Never blame the user for system failures
- Always explain what happens next in error states

---

## 23. Loading / Empty / Error Patterns

| State | UI Pattern |
|-------|-----------|
| Loading | Skeleton cards or spinner + short explanation |
| No results | Explain why + recovery action |
| Unknown status | Warning + timestamp + refresh |
| Offline | Cached shell + retry |
| API error | Simple message + retry |
| Payment pending | Do not encourage duplicate action |
| Session pending | Show current correlation/reference number |

---

## 24. Figma File Structure

| Page | Contents |
|------|---------|
| 00 Cover | Project title + version |
| 01 Foundations | Colors, typography, spacing, icons, design tokens |
| 02 Components | Buttons, cards, chips, status badges, inputs |
| 03 Mobile Auth | Welcome / login / onboarding |
| 04 Mobile Discovery | Home / map / search / filter |
| 05 Mobile Station | Station / EVSE / connector |
| 06 Mobile Charging | Pre-charge / payment / start / live / stop |
| 07 Mobile History | History / receipt / support |
| 08 Mobile Profile | Profile / vehicle / settings |
| 09 Mobile States | Loading / empty / error / unknown / stale |
| 10 Admin | All web admin screens |
| 11 Prototype | Clickable flows |
| 12 Handoff | Annotations / developer specs |

---

## 25. Core Prototype Flows

| Flow | Screen Path |
|------|------------|
| Flow A — Find & Charge | Home -> Search/Map -> Filter -> Station -> Connector -> Pre-charge -> Payment -> Start -> Live Charging -> Stop -> Receipt |
| Flow B — Scan & Charge | Home -> Scan QR -> Station/Connector -> Pre-charge -> Payment -> Start -> Live Charging -> Receipt |
| Flow C — Failed Start | Connector -> Payment Authorization -> Start Failed -> Refund/Release -> Nearby Alternatives |
| Flow D — Unknown Status | Station -> Connector Unknown -> Warning -> Refresh -> Available OR Nearby Alternatives |
| Flow E — CPO API Failure | Discovery may remain from cache -> live action disabled -> clear explanation -> retry/recovery |

---

## 26. UX Metrics

| Metric | UX Goal |
|--------|---------|
| Station detail open -> connector select | High conversion |
| Connector select -> start attempt | High conversion |
| Start attempt -> successful charging | High success rate |
| Payment retry rate | Low (minimize friction) |
| Unknown state abandonment | Understand and optimize |
| Support contacts per session | Low |
| Session completion | High |
| Repeat charging | High |

---

## 27. Designer Handoff Rules

1. Every screen must have: default, loading, empty, error, and offline/uncertain states where applicable
2. Every API-driven status must show the source freshness rule in design notes
3. Every primary CTA must have: disabled / loading / success / failure states
4. Every financial screen must show transaction/session context
5. Every connector component must include connector type and status
6. Technical identifiers should be hidden from consumer UI unless useful for support
7. Admin screens may expose technical IDs and source data
8. Specify touch targets clearly (minimum 44x44pt)
9. Mark all interactive states explicitly
10. Include accessibility notes for all components

---

## 28. Designer Handoff Checklist

- [ ] Create Figma design tokens (colors, typography, spacing)
- [ ] Create color and typography styles
- [ ] Create map marker variants (Available/In-Use/Unavailable/Unknown/Reserved)
- [ ] Create charger status components with all states
- [ ] Create station/connector cards
- [ ] Create payment components
- [ ] Create charging-session components
- [ ] Create eco-impact components
- [ ] Create loading/empty/error states for all primary screens
- [ ] Create Android specifications
- [ ] Create iOS specifications
- [ ] Create accessibility state annotations
- [ ] Create clickable prototype for the complete charging journey
- [ ] Review with product team for spec accuracy
- [ ] Review unknown/stale state handling with engineering

---

## 29. UX Acceptance Checklist

- [ ] User can understand whether a charger is usable
- [ ] Connector-level status is visible
- [ ] Unknown and Stale states are visually distinct from Available
- [ ] Freshness timestamp is visible near status
- [ ] Vehicle compatibility is obviously communicated
- [ ] Price and power are easy to compare
- [ ] Amount/Time/kWh targets only appear when supported by the CPO
- [ ] Payment confirmation screen is clear before authorization
- [ ] Starting state is visually separate from Charging state
- [ ] Live session shows useful metrics (energy, cost, duration, power)
- [ ] Failure states have recovery actions
- [ ] History contains enough detail to support disputes
- [ ] Map information is also available in list form
- [ ] Admin screens show the same underlying station/connector state as the consumer app
- [ ] All status indicators use both color AND text/icon

---

*Document prepared from ChargeMesh UI/UX Product Specification CM-DOC-03 v3.0 and UI/UX Design Notes v1.0, August 2026.*
