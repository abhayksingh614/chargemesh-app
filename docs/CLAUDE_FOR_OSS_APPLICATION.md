# Claude for Open Source (OSS) — Application Guide & Prepared Responses

**Project:** ChargeMesh (India's Interoperable Open EV Roaming Platform)  
**Program:** [Anthropic — Claude for Open Source](https://claude.com/contact-sales/claude-for-oss)  
**Application Portal:** `https://claude.com/contact-sales/claude-for-oss`  
**Application Date:** November 21, 2026  
**Recommended Qualification Track:** **Ecosystem Impact Track (Critical Public Digital Infrastructure)**  

---

## 1. Program Background & Eligibility Evaluation

Anthropic's **Claude for Open Source** program grants free high-tier Claude subscriptions (e.g. Claude Max / Ultra tiers, high rate limits, and Claude Code tool access) to open-source maintainers and core contributors.

### Eligibility Track Alignment:
1. **Maintainer Track vs. Ecosystem Impact Track:**
   - *Maintainer Track:* Focuses primarily on high-volume package registries (e.g. top npm/PyPI libraries with millions of downloads).
   - *Ecosystem Impact Track (Recommended for ChargeMesh):* Designed specifically for maintainers of **critical public infrastructure, emerging open standards, clean technology, and public interest systems** that have high societal or architectural significance.
2. **Repository Governance & Readiness:**
   - **Open Source License:** Verified Apache-2.0 OSI-approved license ([LICENSE](file:///c:/Users/aksde/Videos/My_Codex/Chargemesh_app/LICENSE)).
   - **Verified Maintainer:** Sole copyright holder and primary maintainer ([@abhayksingh614](https://github.com/abhayksingh614)).
   - **Active Maintenance:** Consistent commit history across all milestones, 115 passing tests, strict TypeScript monorepo, and active semantic release milestones (`v0.5.1-alpha`).
   - **CI/CD Hygiene:** 5 GitHub Actions workflows passing 100% on both `prod` (production default) and `beta` (testing) branches.

---

## 2. Official Form Responses (Ready to Copy & Paste)

### 2.1 Project Overview & Repository Details
- **Project Name:** `ChargeMesh`
- **Primary Repository URL:** `https://github.com/abhayksingh614/chargemesh-app`
- **License:** `Apache-2.0` (Permissive, OSI-Approved)
- **Primary Programming Languages:** `TypeScript` (Monorepo), `SQL` (PostGIS), `Java` (Android CameraX/Biometrics)
- **Maintainer Role:** `Primary Maintainer / Creator`
- **GitHub Handle:** `abhayksingh614`

---

### 2.2 Short Form Field: Intended Use of Claude
*(Target: ~100–150 words)*

```text
As the primary maintainer of ChargeMesh, I will use Claude (including Claude Code and extended context reasoning) to streamline core engineering workflows: (1) automated architectural review of inbound community pull requests, verifying Broken Object-Level Authorization (BOLA) and strict TypeScript invariants; (2) synthesizing adversarial unit and integration test suites for complex OCPP 1.6-J and 2.0.1 WebSocket edge cases; (3) auditing double-entry financial ledger logic and pessimistic database locking to eliminate race conditions; and (4) automating OpenAPI schema and multilingual driver documentation synchronization across our React Native, NestJS, and Next.js workspaces.
```

---

### 2.3 Long Form Field: Project Significance, Ecosystem Gap & Justification
*(Target: ~350–450 words / under 500 words)*

```text
ChargeMesh is India's first open-source, vendor-neutral EV charging roaming platform, designed to solve severe infrastructure fragmentation across the world's most rapidly expanding electric mobility market. 

Currently, EV drivers in India must navigate over 25 isolated proprietary CPO (Charge Point Operator) apps, disparate closed wallets, and unreliable charger telemetry. ChargeMesh bridges these silos by implementing an open public digital infrastructure layer built on global standards:
1. Universal Hardware Protocol Gateway: RFC 6455-compliant WebSocket gateway supporting OCPP 1.6-J and 2.0.1, allowing any compliant EVSE charger to connect to an open roaming network.
2. Spatial Discovery: High-performance PostGIS geospatial indexing (geography Point, SRID 4326) enabling real-time proximity searches and connector availability filtering.
3. Financial Ledger Integrity: An atomic, double-entry financial ledger with pessimistic database locking (SELECT ... FOR UPDATE) guaranteeing that wallet debits, pre-authorization holds, and Razorpay payment reconciliation remain mathematically verified against India's 18% GST regulations without double-spend risks.

Why ChargeMesh Needs Claude for Open Source:
Maintaining a full-stack, safety-critical transportation platform as an open-source team presents acute cognitive and operational challenges. ChargeMesh controls high-voltage physical hardware (up to 360 kW / 1000V DC Fast Chargers) and handles real financial transactions. A software flaw in protocol parsing or session authorization could lead to physical equipment damage, electrical hazards, or financial loss.

Access to Claude's frontier reasoning and extended context window is vital to:
- Deep Protocol Conformance: Formally verifying complex OCPP state machines and upcoming OCPI 2.2.1 cross-operator roaming handoffs against multi-hundred-page protocol specifications.
- Supply Chain & BOLA Auditing: Continuously scanning incoming code for object-level authorization vulnerabilities and transitive dependency risks.
- Developer Onboarding & Community Enablement: Generating detailed interactive walkthroughs, troubleshooting runbooks, and educational guides for local community contributors.

By supporting ChargeMesh through the Claude for Open Source program, Anthropic will directly empower open public digital infrastructure that advances clean mobility, open protocol adoption, and sustainable transportation.
```

---

### 2.4 Technical Architecture & Health Metrics (If Asked in Form)
- **Monorepo Architecture:** npm workspaces hosting 3 applications and 2 shared packages:
  - `apps/backend`: NestJS 10 REST API & OCPP 1.6/2.0.1 WebSocket gateway.
  - `apps/mobile`: React Native 0.74 driver app (Android 14 API 34 & iOS) with native CameraX QR scanner and hardware biometrics.
  - `apps/admin`: Next.js 14 App Router operations portal with MapLibre spatial station clustering.
  - `packages/shared-types` & `packages/shared-constants`: Canonical domain interfaces and business thresholds.
- **Data Tier:** PostgreSQL 16 with PostGIS spatial extension + Redis 7.2 distributed caching and throttler.
- **Quality Metrics:** 115 passing tests across 19 suites (100% pass rate), 0 TypeScript compilation errors in strict mode, 0 lint warnings.
- **Security Posture:** 0 production credentials committed, fail-closed environment validation, automated CI regex secret scanning, and GitHub Private Vulnerability Reporting.

---

## 3. Applicant Checklist for Submission

Before submitting at `https://claude.com/contact-sales/claude-for-oss`:

1. [x] **Repository Public Accessibility:** Confirm `https://github.com/abhayksingh614/chargemesh-app` is Public.
2. [x] **Primary Branch Verification:** Confirm default branch is `prod` and testing branch is `beta`.
3. [x] **Open Source License:** Confirm `LICENSE` (Apache-2.0) is present at repository root.
4. [x] **Security Policy:** Confirm `SECURITY.md` outlines responsible disclosure and GitHub Private Reporting.
5. [ ] **GitHub Account Authorization:** Log in with your primary GitHub account (`abhayksingh614`).
6. [ ] **Email Address:** Use your verified primary email address associated with your GitHub/Claude account.
7. [ ] **Jurisdiction Confirmation:** Confirm you reside in an eligible jurisdiction for Claude.ai services.
