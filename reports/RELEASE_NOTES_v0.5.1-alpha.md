# ChargeMesh v0.5.1-alpha — Production Hardening, Financial Integrity & OCPP CSMS Gateway

## ⚡ Overview
ChargeMesh is an open-source, vendor-neutral Electric Vehicle (EV) Charging Management Platform (CSMS) and roaming interoperability hub. This milestone release (`v0.5.1-alpha`) consolidates core architecture, comprehensive production hardening, financial ledger invariants, real-time OCPP 1.6-J charging protocols, and full-stack integration across the driver mobile client and administrative operations portal.

## 🚀 Key Highlights & New Capabilities

### 1. OCPP 1.6-J Charge Point Gateway & Telemetry
- **WebSocket Gateway (`/ocpp`):** Production-ready Central System Management Service handling `BootNotification`, `Heartbeat`, `StatusNotification`, `StartTransaction`, `StopTransaction`, and `MeterValues`.
- **Active Transaction Recovery:** Automatically restores in-flight charging sessions upon pod restart or crash using dual-layer recovery from Redis (`chargemesh:ocpp:tx:*`) and PostgreSQL (`charging_sessions`).
- **Charger Security:** Charge point authentication with Bcrypt (`$2b$`) password verification and constant-time comparison against timing side-channel attacks.
- **Monotonic Energy Invariant:** Sanitizes corrupted or negative meter readings and guarantees non-decreasing cumulative kWh calculations.

### 2. Double-Entry Financial Ledger & Pre-Authorization Architecture
- **Integer Paise Storage:** Pure integer Paise balances (`walletBalancePaise`, `walletHeldPaise`) eliminating floating-point rounding errors.
- **Pre-Authorization Holds:** Atomic ₹200.00 pre-authorisation reservation with automated release rollback if a charger rejects session initiation.
- **Settlement Idempotency:** Early-return check against `FinanceLedgerEntity` preventing double-debiting on duplicate or retried `StopTransaction` messages.
- **True Debt Accounting:** Accurately accounts for negative balances on overdraft without halting active charging sessions.
- **Immutable Ledger Audit Trail:** Every transaction records `balanceBeforeRupees`, `balanceAfterRupees`, reference IDs, and timestamp metadata.

### 3. Payment Gateway & Webhook Security
- **Razorpay Integration:** Full support for automated wallet top-up via UPI and cards.
- **Raw-Body HMAC-SHA256 Verification:** Retains raw request byte buffers (`rawBody: true`) in NestJS, ensuring cryptographic signature validation survives JSON key re-ordering.
- **Replay Protection:** Idempotent webhook handling ensuring duplicate deliveries are safely ignored.

### 4. DevSecOps & Enterprise Security
- **Fail-Closed Token Blacklisting:** Throws `503 Service Unavailable` in production mode if the Redis revocation cache is unreachable.
- **Bcrypt Password Policy:** Minimum 12 rounds for administrator passwords; enforces upper, lower, numeric, and special character requirements.
- **Distributed Rate Limiting:** Redis-backed sliding-window throttlers guarding sensitive authentication and session endpoints.
- **OWASP Headers:** Helmet security headers, CORS origin whitelisting, and parameter validation pipes.

### 5. Frontend & Client Integrations
- **Mobile Driver App (`apps/mobile`):** React Native client with real OTP authentication, biometric lock support, camera QR gun scanner, and live charging telemetry gauges.
- **Admin Operations Portal (`apps/admin`):** Next.js 14 dashboard with 19 statically generated pages covering CPO management, live charger directories, sustainability metrics, and financial audit logs.

### 6. Open-Source Governance & Readiness
- **Apache-2.0 License:** Formally adopted to provide patent grant protections for hardware/EV protocols and safeguard the ChargeMesh trademark.
- **OpenAI Codex for Open Source Program Readiness:** Evaluated and documented under `OPENAI_CODEX_FOR_OSS_READINESS.md`.

## 🧪 Quality Gate Verification
- **Automated Tests:** 109 passing tests across 19 suites (0 failing, 0 skipped).
- **TypeScript Typecheck:** 0 errors across 5 workspaces (`backend`, `admin`, `mobile`, `shared-types`, `shared-constants`).
- **Production Builds:** NestJS backend (`dist/`) and Next.js 14 admin portal (19/19 routes) pass with zero compile warnings.
