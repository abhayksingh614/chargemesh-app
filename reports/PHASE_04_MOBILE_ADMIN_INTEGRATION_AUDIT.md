# CHARGEMESH — PHASE 04 WORKSTREAM 6: MOBILE & ADMIN INTEGRATION AUDIT
**Version:** 1.0  
**Date:** 2026-11-20  
**Auditor:** Principal Software Architect, Staff Full-Stack Engineer, Frontend Specialist  
**Repository:** `https://github.com/abhayksingh614/chargemesh-app`  
**Packages Audited:** `apps/mobile` (React Native), `apps/admin` (Next.js 14), `apps/backend` (NestJS)  

---

## 1. Executive Summary & Verdict

### Integration Status: FULLY DISCONNECTED (MOCK-ONLY FRONTENDS)
An exhaustive inspection of `apps/mobile` (23 screens, 7 context providers) and `apps/admin` (17 views, `dataService.ts`, `authContext.tsx`) reveals that **neither client application makes HTTP or WebSocket network requests to the NestJS backend**:

1. **Mobile Driver App (`apps/mobile`):**
   - Zero `fetch()`, `axios`, or REST API invocations across all 23 screens.
   - Authentication relies entirely on a hardcoded in-memory array (`DEMO_USER_DATABASE`) and stores pseudo-JWTs (`cm-phone-jwt-...`) in React Native `AsyncStorage`.
   - Stations, chargers, telemetry, and live sessions are driven by static constants in `mockData.ts` and `demoUserData.ts`.
   - Wallet transactions are saved to local device `AsyncStorage` (`@chargemesh_wallet_transactions_v126`).
2. **Operations & CPO Admin Portal (`apps/admin`):**
   - Zero `fetch()` or `axios` calls across all 17 administrative routes.
   - Initialized by default as `isAuthenticated: true` with a hardcoded `mock-admin-token-2026` in `authContext.tsx`.
   - All CPO registries, station listings, session telemetry, and wallet adjustments mutate static module-level arrays in `dataService.ts` (`INITIAL_STATIONS`, `INITIAL_USERS`, `INITIAL_TRANSACTIONS`).

---

## 2. Mobile Screen-to-API Integration Matrix

| Screen Name | File Path | Current Data Source | Connected Backend Endpoint | Integration Status |
| :--- | :--- | :--- | :--- | :--- |
| `SplashScreen` | `apps/mobile/src/screens/SplashScreen.tsx` | Local `AsyncStorage` | None | Disconnected |
| `OnboardingScreen` | `apps/mobile/src/screens/OnboardingScreen.tsx` | Static assets | None | Disconnected |
| `LoginScreen` | `apps/mobile/src/screens/LoginScreen.tsx` | `DEMO_USER_DATABASE` (in-memory) | `/api/v1/auth/verify-otp` | **Mock Only** |
| `RegisterScreen` | `apps/mobile/src/screens/RegisterScreen.tsx` | Local `AsyncStorage` | `/api/v1/auth/register` | **Mock Only** |
| `HomeScreen` | `apps/mobile/src/screens/HomeScreen.tsx` | `demoUserData.ts` / `mockData.ts` | `/api/v1/stations`, `/api/v1/auth/profile` | **Mock Only** |
| `MapScreen` | `apps/mobile/src/screens/MapScreen.tsx` | CartoCDN tiles + `mockData.ts` | `/api/v1/stations` (PostGIS) | **Mock Only** |
| `StationDetailScreen`| `apps/mobile/src/screens/StationDetailScreen.tsx`| `mockData.ts` (static array) | `/api/v1/stations/:id` | **Mock Only** |
| `PreChargeScreen` | `apps/mobile/src/screens/PreChargeScreen.tsx` | Static state | `/api/v1/sessions/start` | **Mock Only** |
| `LiveChargingScreen` | `apps/mobile/src/screens/LiveChargingScreen.tsx` | Local interval timer (fake telemetry) | `/telemetry` (WebSocket) | **Mock Only** |
| `SessionCompleteScreen`| `apps/mobile/src/screens/SessionCompleteScreen.tsx`| Static state | `/api/v1/sessions/:id/stop` | **Mock Only** |
| `AddMoneyScreen` | `apps/mobile/src/screens/AddMoneyScreen.tsx` | Local `AsyncStorage` | Missing (`/api/v1/wallet/topup`) | **Mock Only** |
| `WalletTransactionsScreen`| `apps/mobile/src/screens/WalletTransactionsScreen.tsx`| Local `AsyncStorage` | Missing (`/api/v1/wallet/transactions`) | **Mock Only** |
| `PaymentMethodsScreen`| `apps/mobile/src/screens/PaymentMethodsScreen.tsx`| Local `AsyncStorage` | None | **Mock Only** |
| `QRScannerScreen` | `apps/mobile/src/screens/QRScannerScreen.tsx` | CameraX parser (local) | `/api/v1/stations/:id` | **Mock Only** |
| `MyAccountScreen` | `apps/mobile/src/screens/MyAccountScreen.tsx` | `DEMO_USER_DATABASE` | `/api/v1/auth/profile` | **Mock Only** |
| `MyVehiclesScreen` | `apps/mobile/src/screens/MyVehiclesScreen.tsx` | Local `AsyncStorage` | `/api/v1/auth/profile` | **Mock Only** |
| `AddVehicleScreen` | `apps/mobile/src/screens/AddVehicleScreen.tsx` | Local `AsyncStorage` | `/api/v1/auth/profile` | **Mock Only** |
| `ActivityScreen` | `apps/mobile/src/screens/ActivityScreen.tsx` | Static demo sessions | `/api/v1/sessions/my` | **Mock Only** |
| `EcoSustainabilityScreen`| `apps/mobile/src/screens/EcoSustainabilityScreen.tsx`| Static multipliers | `/api/v1/auth/profile` | **Mock Only** |
| `FavoritesScreen` | `apps/mobile/src/screens/FavoritesScreen.tsx` | Local `AsyncStorage` | None | **Mock Only** |
| `ProfileScreen` | `apps/mobile/src/screens/ProfileScreen.tsx` | Local `AsyncStorage` | `/api/v1/auth/profile` | **Mock Only** |
| `VehicleScreen` | `apps/mobile/src/screens/VehicleScreen.tsx` | Local `AsyncStorage` | None | **Mock Only** |
| `PermissionSetupScreen`| `apps/mobile/src/screens/PermissionSetupScreen.tsx`| Local device permissions | None | Operational |

---

## 3. Admin Portal View-to-API Integration Matrix

| View Route | Target Backend Endpoint | Current Mechanism | Status |
| :--- | :--- | :--- | :--- |
| `/login` | `POST /api/v1/admin/auth/login` | Synthesizes mock user in `localStorage` | **Mock Only** |
| `/dashboard` | `GET /api/v1/admin/dashboard/*` | Reads static `INITIAL_DASHBOARD_METRICS` | **Mock Only** |
| `/cpos` | `GET/POST /api/v1/admin/cpos` | Mutates `INITIAL_CPOS` array | **Mock Only** |
| `/stations` | `GET /api/v1/stations` | Reads `INITIAL_STATIONS` in `dataService.ts` | **Mock Only** |
| `/chargers` | `GET /api/v1/stations` | Filters `INITIAL_STATIONS` | **Mock Only** |
| `/sessions` | `GET /api/v1/sessions` | Reads `INITIAL_SESSIONS` array | **Mock Only** |
| `/bookings` | None (No backend booking module) | Reads `INITIAL_BOOKINGS` array | **Mock Only** |
| `/finance` | `GET /api/v1/admin/finance/transactions`| Reads `INITIAL_TRANSACTIONS` array | **Mock Only** |
| `/wallet` | `POST /api/v1/admin/finance/wallet/adjust`| `unshift()` to local `INITIAL_TRANSACTIONS` | **Mock Only** |
| `/users` | `GET /api/v1/admin/users` | Reads `INITIAL_USERS` in `dataService.ts` | **Mock Only** |
| `/audit-logs` | `GET /api/v1/admin/audit-logs` | Reads `INITIAL_AUDIT_LOGS` array | **Mock Only** |
| `/sustainability` | None | Computes locally from static sessions | **Mock Only** |
| `/broadcasts` | None | Local state | **Mock Only** |
| `/ev-master` | None | Static OEM brand list | **Mock Only** |
| `/settings` | None | Local state | **Mock Only** |

---

## 4. Remediation Blueprint for Real Integration

To transform ChargeMesh from a decoupled mock demonstration into a unified operational platform:
1. **Author Shared API Client Package (`@chargemesh/api-client`):**
   Create an Axios/Fetch SDK typed by `@chargemesh/shared-types` that handles:
   - Base URL configuration (`EXPO_PUBLIC_API_URL`, `NEXT_PUBLIC_API_URL`).
   - Automatic Bearer token header injection.
   - Centralized 401 handling and redirect to login.
2. **Wire Mobile `AuthContext` to Backend:**
   Replace `DEMO_USER_DATABASE.find()` with `POST /api/v1/auth/send-otp` and `POST /api/v1/auth/verify-otp`.
3. **Wire Mobile `MapScreen` to Backend PostGIS API:**
   Replace `mockStations` with `GET /api/v1/stations?userLat=...&userLng=...&radiusKm=...`.
4. **Wire Admin Portal to Backend Admin APIs:**
   Update `dataService.ts` methods to call `/api/v1/admin/*` endpoints using the logged-in admin token.
