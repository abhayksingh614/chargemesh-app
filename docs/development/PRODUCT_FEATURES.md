# ChargeMesh — Product Features

> **Version:** 1.2.5 | **Updated:** 2026-08-24

This document is the single source of truth for the ChargeMesh feature matrix — what has been implemented, what is in progress, and what is planned.

**Legend:** ✅ Implemented | 🚧 Scaffolded / Partial | ⏳ Planned | ❌ Not Started

---

## 1. Authentication & Onboarding

| Feature | Status | Notes |
|---------|--------|-------|
| Animated splash screen | ✅ | Logo animation on every launch |
| 3-slide onboarding carousel | ✅ | First launch only; skippable |
| Phone + OTP login | ✅ | Mock OTP `123456` — DEV ONLY |
| Google Sign-In | ✅ | UI implemented; uses mock auth |
| Email + password login | ✅ | UI implemented; uses mock auth |
| Forgot password flow | ✅ | UI implemented |
| User registration (name, phone, email, EV) | ✅ | Saves to AsyncStorage |
| Persistent login (AsyncStorage) | ✅ | Session survives app restarts |
| Demo credential removal (pre-production) | ⏳ | Must be done before prod release |
| Real OTP/SMS gateway integration | ⏳ | Planned (backend phase) |
| Real Google OAuth integration | ⏳ | Planned (backend phase) |

---

## 2. Station Discovery

| Feature | Status | Notes |
|---------|--------|-------|
| Home screen station cards | ✅ | Shows 20 mock stations |
| CPO filter chips | ✅ | Filter by network |
| Connector type filter | ✅ | CCS2, CHAdeMO, AC Type-2, etc. |
| Station availability status | ✅ | Available / Occupied / Faulted |
| Full-screen MapLibre map | ✅ | Android-native map tiles |
| Map station markers (colour-coded) | ✅ | Green/Orange/Red by status |
| State & district picker | ✅ | 36 states, 700+ districts |
| Map bottom-sheet station preview | ✅ | Tap marker → show preview |
| Station detail screen | ✅ | Full info, connectors, amenities |
| Real-time station availability (live) | ⏳ | Planned (backend + OCPI phase) |
| Location-based search (GPS) | ⏳ | Planned (backend phase) |
| Distance & ETA display | ⏳ | Planned |

---

## 3. Charging Flow

| Feature | Status | Notes |
|---------|--------|-------|
| QR code scanning (native CameraX + ML Kit) | ✅ | Scans ChargeMesh QR codes |
| Pre-charge target selection (₹ / kWh / time) | ✅ | 3-mode selector |
| Connector selection before charge | ✅ | Supports multi-bay stations |
| Live charging session monitor | ✅ | SoC gauge, kWh, kW, time, cost |
| Session stop (manual) | ✅ | Stop button in live screen |
| Auto-stop on target reached | ✅ | Simulated in mock |
| Session complete summary | ✅ | Full breakdown |
| Session timer (elapsed) | ✅ | Ticks live in ChargingContext |
| Battery telemetry simulation | ✅ | Physics-based SoC model |
| Active session banner (persistent) | ✅ | Shows across all tabs |
| Remote start via backend OCPP | ⏳ | Planned (backend phase) |
| Remote stop via backend OCPP | ⏳ | Planned (backend phase) |
| Real telemetry stream (WebSocket) | ⏳ | Planned (backend phase) |
| Booking / reservation system | ⏳ | Planned |

---

## 4. Payment & Wallet

| Feature | Status | Notes |
|---------|--------|-------|
| ChargeMesh Wallet (in-app) | ✅ | Mock balance management |
| ₹100 joining bonus | ✅ | Credited on registration |
| Transaction history | ✅ | WalletTransactionsScreen |
| Payment method management (UI) | ✅ | Wallet, UPI, Card, FASTag |
| Add UPI / Card form (UI) | ✅ | Form only — not connected to gateway |
| Razorpay payment gateway (real) | ⏳ | Planned (backend phase) |
| Wallet top-up (real) | ⏳ | Planned |
| Session invoice / receipt | ⏳ | Planned |
| GST-compliant billing | ⏳ | Planned |

---

## 5. Profile & Account Management

| Feature | Status | Notes |
|---------|--------|-------|
| Profile hub screen | ✅ | Wallet widget + menu |
| Edit personal details (name, email, address) | ✅ | Modal-based edit |
| Phone number display | ✅ | Shown on account screen |
| Avatar / profile picture placeholder | ✅ | Initials-based avatar |
| Verification badges | ✅ | Email/phone verified indicators |
| Notification preferences | ⏳ | Planned |
| Delete account | ⏳ | Planned |

---

## 6. Vehicle Management

| Feature | Status | Notes |
|---------|--------|-------|
| Add vehicle from EV catalog | ✅ | Multi-brand catalog (Tata, MG, Hyundai, etc.) |
| Set active vehicle | ✅ | Persisted in AsyncStorage |
| Vehicle detail view (specs, connector compatibility) | ✅ | Full spec display |
| Delete vehicle | ✅ | Swipe-to-delete |
| Vehicle image | ⏳ | Placeholder — real images planned |
| Vehicle-to-station compatibility check | ⏳ | Planned |

---

## 7. Favourites

| Feature | Status | Notes |
|---------|--------|-------|
| Save/unsave stations | ✅ | FavoritesContext + AsyncStorage |
| Favourites list with search | ✅ | FavoritesScreen |
| Connector type filter on favourites | ✅ | Filter chips |
| Empty state handling | ✅ | Illustrated empty state |

---

## 8. Activity & History

| Feature | Status | Notes |
|---------|--------|-------|
| Charging session history | ✅ | ActivityScreen tab 1 |
| Booking history | ✅ | ActivityScreen tab 2 |
| Session detail per entry | ✅ | Shows station, cost, kWh, date |

---

## 9. Eco Impact

| Feature | Status | Notes |
|---------|--------|-------|
| CO₂ saved (per session, total) | ✅ | Calculated from kWh |
| Green miles driven | ✅ | Calculated from sessions |
| Trees equivalent metric | ✅ | Eco conversion |
| Milestone badges | ✅ | Achievement system |
| Eco leaderboard / social sharing | ⏳ | Planned |

---

## 10. Language & Localisation

| Feature | Status | Notes |
|---------|--------|-------|
| English (full) | ✅ | All strings via `i18n/translations/en.ts` |
| Hindi (full) | ✅ | All strings via `i18n/translations/hi.ts` |
| Language toggle (persistent) | ✅ | Via LanguageContext + AsyncStorage |
| Language toggle location | ✅ | Profile screen → Settings |
| Tamil / other regional languages | ⏳ | Planned |

---

## 11. Theme & UI

| Feature | Status | Notes |
|---------|--------|-------|
| Light mode (all 22 screens) | ✅ | Audited and implemented |
| Dark mode (all 22 screens) | ✅ | Audited and implemented |
| Semantic theme tokens | ✅ | ThemeContext with full token set |
| Persistent theme preference | ✅ | AsyncStorage |
| Micro-animations (transitions, press states) | ✅ | Across all key screens |
| Premium design system (rounded cards, shadows) | ✅ | Consistent across app |
| System theme auto-detect | ⏳ | Planned (currently manual) |

---

## 12. Notifications

| Feature | Status | Notes |
|---------|--------|-------|
| In-app status modals | ✅ | StatusModal, AppModal |
| Firebase push notifications (real) | ⏳ | Planned (backend phase) |
| Charging session alerts | ⏳ | Planned |
| Booking reminders | ⏳ | Planned |

---

## 13. Backend & API (Planned)

> All items below are **not yet implemented**. The backend is scaffolded only.

| Feature | Status |
|---------|--------|
| NestJS OCPP 1.6-J WebSocket server | 🚧 Scaffolded |
| NestJS OCPP 2.0.1 WebSocket server | 🚧 Scaffolded |
| REST API for station discovery | ❌ Not Started |
| REST API for session management | ❌ Not Started |
| PostgreSQL station/session schema | ❌ Not Started |
| PostGIS geospatial queries | ❌ Not Started |
| Redis live session cache | ❌ Not Started |
| OCPI 2.3.0 CPO network integration | ❌ Not Started |
| Real authentication (JWT/OAuth) | ❌ Not Started |

---

## 14. Admin Portal (Planned)

> The admin portal is scaffolded only. No functional screens have been implemented.

| Feature | Status |
|---------|--------|
| Station management dashboard | ❌ Not Started |
| CPO management | ❌ Not Started |
| Live session monitoring | ❌ Not Started |
| User management | ❌ Not Started |
| Analytics dashboard | ❌ Not Started |
