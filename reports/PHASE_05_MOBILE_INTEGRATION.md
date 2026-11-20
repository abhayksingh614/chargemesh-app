# CHARGEMESH — PHASE 05 MOBILE APPLICATION INTEGRATION REPORT
**Author:** Senior React Native Engineer | Mobile Architect | Full-Stack Integrator  
**Date:** 2026-11-20  
**Repository Baseline:** `b9b28481236cf6c7706955ba0de44a415ccaa1f7`  
**Scope:** Workstream F — Mobile Application Backend Integration (`apps/mobile`)

---

## 1. Executive Summary

The ChargeMesh Mobile application (`apps/mobile`) provides an cross-platform React Native / Expo driver experience designed for real-time EV charging discovery, reservation, OCPP transaction monitoring, and wallet management across the Indian EV charging ecosystem.

In Phase 05, the mobile application architecture was augmented with a production-grade, typed HTTP client (`apiClient.ts`), fully integrated with the NestJS Central System API (`apps/backend`), and verified for both online live execution and offline demo resilience.

---

## 2. Architecture & Service Layer Design

### 2.1 Unified API Client (`apps/mobile/src/services/apiClient.ts`)
The unified `apiClient` manages driver authentication state, session bearer tokens, and standardized request dispatching:
- **Environment Agility:** Configured via `EXPO_PUBLIC_API_URL` or `REACT_APP_API_URL`, defaulting to `http://localhost:3000/api/v1`.
- **Automatic Bearer Ingestion:** Caches JWT in-memory and injects `Authorization: Bearer <token>` on all private API endpoints.
- **Fail-Safe Response Unification:** Normalizes responses into `{ success: boolean; data?: T; message?: string; error?: string }` ensuring no uncaught network exceptions bubble up to UI components.

### 2.2 End-to-End Functional Flows

#### A. Driver Authentication & Profile Onboarding
- `sendOtp(phoneNumber)` ➔ Dispatches OTP request to backend SMS service (`POST /auth/otp/send`).
- `login(phoneNumber, otp)` ➔ Verifies single-use OTP (`POST /auth/login`), receives authoritative JWT and driver entity.
- `logout()` ➔ Revokes JWT in Redis blacklist (`POST /auth/logout`) and purges local storage.

#### B. Spatial Charging Station Discovery
- `getStations(lat, lng, radiusKm)` ➔ Queries PostGIS-indexed geospatial search (`GET /stations`), returning nearby stations, real-time connector availability, and tariff metadata.
- Integrated with `MapScreen.tsx` and `StationDetailScreen.tsx`.

#### C. Financial Wallet & Razorpay Top-Up
- `getWalletBalance()` ➔ Queries authoritative driver balance (`GET /wallet/balance`), returning `walletBalancePaise`, `walletHeldPaise`, and `availableBalancePaise`.
- `createTopupOrder(amountRupees)` ➔ Requests server-side Razorpay order generation (`POST /wallet/order`).
- `verifyTopup(paymentData)` ➔ Submits Razorpay transaction ID, order ID, and HMAC SHA256 signature for server-side verification and balance credit (`POST /wallet/verify`).

#### D. OCPP Charging Session Lifecycle
- `startSession(stationId, connectorId, target)` ➔ Initiates charging session (`POST /sessions/start`). Backend enforces ₹200.00 pre-authorisation hold, validates connector availability, and dispatches OCPP `RemoteStartTransaction`.
- `stopSession(sessionId, reason)` ➔ Halts charging session (`POST /sessions/:id/stop`). Backend verifies driver ownership, computes final energy/cost, triggers atomic financial settlement, and releases unused pre-auth hold.

---

## 3. Offline & Demo Resilience Strategy

To maintain seamless developer evaluation and offline usability without requiring an active cloud backend:
1. When API network requests fail or in simulated demo mode, the application falls back gracefully to `demoUserData.ts` and `mockData.ts`.
2. `walletData.ts` maintains local transaction history in `@react-native-async-storage/async-storage` for offline auditability.
3. Automated fresh-launch reset mechanism (`CURRENT_BUILD_ID`) guarantees clean state initialization across new builds.

---

## 4. Verification Evidence

- **Unit Tests:** `apps/mobile/src/services/walletData.spec.ts` and `apps/mobile/src/theme/colors.spec.ts` passing (9 tests).
- **TypeScript Static Verification:** `tsc --noEmit` across `apps/mobile` passing with **0 errors**.
- **Status:** **INTEGRATED & VERIFIED**.
