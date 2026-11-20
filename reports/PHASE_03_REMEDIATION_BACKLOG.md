# ChargeMesh — Phase 03 Prioritized Remediation Backlog
**Document Reference:** `CM-BACKLOG-P3-001`  
**Classification Standard:** Operational Impact & Dependency Mapping  
**Date:** 2026-11-20  

---

## 1. Categorized Engineering Backlog

### Category A: Can Be Safely Fixed Locally (Pending Authorization)
These items require no external credentials or infrastructure and can be resolved directly in the monorepo codebase:

| Task ID | Component | Severity | Description | Effort |
| :--- | :--- | :--- | :--- | :--- |
| **REM-A01** | `AdminAuthService` | HIGH | Wire `adminRepo.update()` in `changePassword` and `resetPasswordBySuperAdmin` to ensure password hashes persist to PostgreSQL. | 1 hr |
| **REM-A02** | `AdminUsersService` | HIGH | Refactor `findById` and `findAll` to query `userRepo` instead of in-memory `Map`. | 2 hrs |
| **REM-A03** | `AdminFinanceService`| HIGH | Wire `userRepo.update()` in `adjustWalletBalance` so driver wallet balances persist to database. | 1 hr |
| **REM-A04** | `FinanceLedgerEntity`| HIGH | Migrate monetary columns (`amountRupees`, `balanceBeforeRupees`, `balanceAfterRupees`) from `float` to `numeric(12, 2)`. | 2 hrs |
| **REM-A05** | `SessionsService` | MEDIUM | Add wallet pre-authorization check before starting session (require positive balance). | 1 hr |
| **REM-A06** | `OtpService` | HIGH | Implement Redis-backed OTP record storage with key prefix `chargemesh:otp:<phone>` and 5-min TTL. | 2 hrs |
| **REM-A07** | `StationsService` | MEDIUM | Refactor spatial filtering to execute via PostgreSQL PostGIS `ST_DWithin` query instead of in-memory JS loop. | 3 hrs |
| **REM-A08** | `backend/test` | LOW | Clean up open handles in Jest tests (unref timers, call `redis.quit()`). | 1 hr |

---

### Category B: Requires External Provider Credentials
These items are blocked until third-party service provider accounts and API credentials are provided:

| Task ID | Vendor / Integration | Severity | Description | Blocked By |
| :--- | :--- | :--- | :--- | :--- |
| **REM-B01** | SMS Gateway (Twilio / AWS SNS / MSG91) | CRITICAL | Implement production `IOtpProvider` to dispatch live SMS OTPs. `MockOtpProvider` currently fails closed in prod. | Provider Account & API Credentials |
| **REM-B02** | Payment Gateway (Razorpay / Stripe) | HIGH | Integrate real webhook signature verification and capture for UPI and card wallet top-ups. | Merchant Key & Secret |
| **REM-B03** | Map Tile Provider (MapLibre / Mapbox / Stadia)| MEDIUM | Production vector map tile style URL and access token for driver and admin maps. | Tile Server API Key |

---

### Category C: Requires Infrastructure Access
These items pertain to deployment environments beyond the local developer machine:

| Task ID | Infrastructure Component | Description | Prerequisite |
| :--- | :--- | :--- | :--- |
| **REM-C01** | Managed PostgreSQL 16 (AWS RDS / GCP CloudSQL) | Provision production relational database with PostGIS 3.4 and automated WAL archiving. | Cloud Account / Terraform |
| **REM-C02** | Managed Redis (AWS ElastiCache / Redis Cloud) | Multi-AZ Redis cluster with in-transit TLS encryption and AUTH password. | Cloud VPC Access |
| **REM-C03** | Reverse Proxy / Load Balancer (ALB / Nginx Ingress) | TLS termination for HTTPS (port 443) and WSS (secure WebSocket for OCPP). | Domain DNS & SSL Cert |

---

### Category D: Requires Maintainer Decisions
These items are governance and design decisions that strictly require maintainer confirmation:

| Task ID | Item | Options | Recommendation | Status |
| :--- | :--- | :--- | :--- | :--- |
| **LIC-001** | Open-Source License | **MIT License** vs. **Apache License 2.0** | **MIT License** for maximum open-source adoption in EV community. | **BLOCKED BY OWNER** |
| **POL-001** | Offline Charger Start Policy | A) Reject session with 503<br>B) Allow simulated session | **Option A in Production** (Reject offline chargers). Restrict simulation to dev environment. | **PENDING DECISION** |
| **POL-002** | Minimum Wallet Balance for Session Start | Min balance: ₹0 vs ₹100 vs ₹200 | **₹200 (20,000 Paise)** pre-auth hold to prevent default debt. | **PENDING DECISION** |

---

### Category E: Requires Separate Production Environment
These items apply to pre-release testing and store publication:

| Task ID | Release Component | Description | Prerequisite |
| :--- | :--- | :--- | :--- |
| **REM-E01** | Physical EVSE Hardware Interop Test | Connect real OCPP 1.6-J and 2.0.1 DC fast chargers (Delta / ABB / Schneider) to staging CSMS gateway. | Physical Charger Lab |
| **REM-E02** | Google Play Store Publication | Sign production `.aab` bundle with release keystore and submit to Google Play Console. | Google Play Developer Account |
