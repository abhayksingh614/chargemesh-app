# ChargeMesh — Comprehensive Security Policy Audit

**Audit Date:** November 21, 2026  
**Project:** ChargeMesh (India's Interoperable Open EV Roaming Platform)  
**Repository:** [abhayksingh614/chargemesh-app](https://github.com/abhayksingh614/chargemesh-app)  
**Primary Branches:** `prod` (Production), `beta` (Development & Testing)  
**Audit Scope:** `SECURITY.md`, Security Governance, Incident Response, and Technical Verification  
**Auditor:** Open-Source Security Architecture & DevSecOps Team  

---

## 1. Executive Summary

A comprehensive security policy and repository security governance audit was conducted for the ChargeMesh project. The audit evaluated the existing [SECURITY.md](file:///c:/Users/aksde/Videos/My_Codex/Chargemesh_app/SECURITY.md), repository branch governance, technical security implementations across backend, mobile, database, and CI/CD layers, and community vulnerability reporting procedures.

While the codebase exhibits strong architectural controls (e.g. strict DTO validation, pessimistic wallet locking, zero production secrets in version control), the existing `SECURITY.md` suffered from several governance and operational shortcomings, including unverified contact domains, ambiguous pre-1.0 version support declarations, unconditional response guarantees, and an absence of physical EV charging safety boundaries.

---

## 2. Itemized Audit Findings

Each identified gap has been evaluated and classified according to standard security risk taxonomy:

| Finding ID | Severity | Category | Summary of Defect | Remediation Action |
|:---|:---:|:---|:---|:---|
| **SEC-POL-001** | **High** | Version Governance | Ambiguous statement `< 1.0.0 releases ❌ No` in `SECURITY.md`. Because ChargeMesh is currently at pre-1.0 (`v0.5.1-alpha`), this implied current versions are unsupported. | Separate branch support (`prod`, `beta`) from release tag support; clarify that current release tags receive active security backports. |
| **SEC-POL-002** | **High** | Reporting Channels | Email addresses (`security@chargemesh.com`, `maintainers@chargemesh.com`) utilize an unverified domain rather than the primary project domain (`chargemesh.in`) or GitHub-native tooling. | Establish GitHub **Private Vulnerability Reporting** as the primary confidential channel; designate verified fallback contacts. |
| **SEC-POL-003** | **Medium** | Response SLAs | Unconditional response guarantees (48 hours ack, 7 days triage, 14–30 days fix delivery) create unrealistic expectations for open-source maintainers. | Reframe as Target Service-Level Objectives (SLOs) with clear severity tiers, explicitly noting dependency and hardware exceptions. |
| **SEC-POL-004** | **High** | Physical Safety | Responsible disclosure guidelines lacked explicit safety boundaries regarding live, high-voltage EV charging equipment (EVSEs). | Add strict testing boundaries forbidding physical tampering, grid interruption, or testing on non-owned EV charging stations. |
| **SEC-POL-005** | **Medium** | Severity Rubric | Lack of structured vulnerability classification (CVSS v4.0 / v3.1) and absence of EV-charging-specific severity examples. | Introduce formal severity tiers (Critical, High, Medium, Low) with concrete domain examples (BOLA session hijacking, ledger double-spend). |
| **SEC-POL-006** | **Low** | Legal Protection | Lack of a standardized Safe Harbor statement protecting good-faith security researchers. | Add an explicit Safe Harbor clause, properly annotated as subject to final legal review. |
| **SEC-POL-007** | **Medium** | Incident Lifecycle | Lack of an end-to-end incident management lifecycle (from intake through CVE assignment and coordinated disclosure). | Formulate a 12-stage Incident Handling Process in `VULNERABILITY_RESPONSE_POLICY.md`. |
| **SEC-POL-008** | **Low** | CI/CD Permissions | GitHub Actions workflow files lacked explicit top-level `permissions:` declarations, relying on default token scopes. | Enforce least-privilege `permissions: contents: read` across all workflow definitions. |
| **SEC-POL-009** | **Medium** | Dependency Hygiene | `npm audit` reveals 65 vulnerabilities primarily concentrated in development, scaffolding, and build tooling (`tar`, `ajv`, `webpack`). | Document risk boundaries (build-time tooling vs. production runtime) in `DEPENDENCY_SECURITY.md` and define non-breaking upgrade paths. |

---

## 3. Detailed Finding Analysis

### 3.1 SEC-POL-001: Supported Versions & Pre-1.0 Release Policy
- **Existing Text:**
  ```markdown
  | Version / Branch | Supported | Notes |
  | :--- | :--- | :--- |
  | `prod` | ✅ Yes | Official production-ready default branch |
  | `beta` | ✅ Yes | Active development and staging branch |
  | `< 1.0.0` releases | ❌ No | Please upgrade to the latest tagged release |
  ```
- **Defect:** ChargeMesh's current release milestone is `v0.5.1-alpha`. Stating that all `< 1.0.0` releases are unsupported directly contradicts the current state of the platform and confuses security researchers reporting bugs on current releases.
- **Corrective Policy:**
  1. **Branch Support:** `prod` (production default) and `beta` (staging) receive continuous security updates.
  2. **Release Support:** The latest semantic release tag (e.g. `v0.5.x`) is supported. When critical security fixes land on `prod`, a new semantic patch tag is cut. Previous major/minor milestones are deprecated.

### 3.2 SEC-POL-002: Vulnerability Reporting & Channel Verification
- **Existing Text:**
  ```markdown
  Send an encrypted or confidential report to:
  📧 security@chargemesh.com
  Cc: maintainers@chargemesh.com
  ```
- **Defect:** The maintainer's primary registered email domain is `chargemesh.in` (and GitHub user `@abhayksingh614`). Unverified `@chargemesh.com` addresses create single points of failure where confidential reports could bounce or leak. Furthermore, GitHub provides built-in **Private Vulnerability Reporting** with encrypted storage, controlled maintainer collaboration, and automated CVE coordination.
- **Corrective Policy:**
  1. **Primary Method:** GitHub Private Vulnerability Reporting via `https://github.com/abhayksingh614/chargemesh-app/security/advisories/new`.
  2. **Secondary Fallback:** Maintainer direct email (`security@chargemesh.in` and `abhayksingh614@gmail.com`).
  3. **Strict Confidentiality:** Never file public GitHub issues, discussions, or pull requests for unpatched vulnerabilities. Never CC unverified distribution lists.

### 3.3 SEC-POL-003: Response Commitment & Realistic SLOs
- **Existing Text:**
  ```markdown
  - Acknowledgment: Within 48 hours
  - Initial Triage & Assessment: Within 7 calendar days
  - Fix & Patch Delivery: Within 14 to 30 days
  ```
- **Defect:** Categorical guarantees exposed the project to failure during holidays, upstream library outages, or complex hardware interoperability investigations (e.g. OCPI / OCPP firmware quirks).
- **Corrective Policy:**
  Transition from unconditional guarantees to **Target Service-Level Objectives (SLOs)** segmented by severity:
  - **Acknowledgment Target:** Within 72 hours (3 business days).
  - **Initial Triage Target:** Within 5 business days for Critical/High; 10 business days for Medium/Low.
  - **Remediation Target:** 14–30 business days for Critical/High, extending up to 60–90 days for complex protocol or third-party dependencies.

### 3.4 SEC-POL-004: Physical EV Charging & Hardware Safety Boundary
- **Defect:** Unlike pure software applications, ChargeMesh orchestrates high-voltage DC Fast Chargers (up to 360 kW / 1000V) and AC Level-2 chargers. Unauthorized physical penetration testing, automated power cycling, or manipulation of live commercial charging stations poses severe fire, electrical hazard, grid disruption, and personal injury risks.
- **Corrective Policy:**
  Explicitly state in `SECURITY.md` that testing must be conducted **only against local mock environments, containerized stubs, or authorized private hardware**. Testing on public, commercial, or third-party EV charging infrastructure is strictly out of scope and prohibited.

---

## 4. Policy Comparison Ledger

| Section | Previous `SECURITY.md` | Revised & Strengthened `SECURITY.md` | Reason for Change |
|:---|:---|:---|:---|
| **Branch Architecture** | Generic branch mentions | Explicit definitions for `prod` (production default) and `beta` (testing) | Reflects updated repository branch structure |
| **Release Support** | `< 1.0.0 releases: No` | Explicit support for latest release tag (`v0.5.x`) and `prod` branch | Protects pre-1.0 pilot testers and contributors |
| **Primary Reporting** | Email only (`@chargemesh.com`) | GitHub Private Vulnerability Reporting (`/security/advisories/new`) + verified fallback | Native encryption, audit trail, no bounce risk |
| **Severity Rubric** | Absent | CVSS v4.0 / v3.1 aligned with EV charging threat models | Standardized triage and prioritization |
| **Hardware Boundary** | Absent | Strict prohibition of live/commercial EVSE hardware testing | Critical electrical safety & legal compliance |
| **Safe Harbor** | Absent | Standard open-source Safe Harbor clause (subject to legal review) | Protects ethical security researchers |
| **Incident Lifecycle** | 4 bullet points | 12-stage structured response process in linked policy document | Enterprise-grade governance for Codex OSS |

---

## 5. Audit Conclusion

The audit demonstrates that ChargeMesh's underlying technical implementation is substantially secure and disciplined, but its governing documentation required realignment with operational realities. By establishing GitHub Private Vulnerability Reporting, clarifying branch and version maintenance, setting realistic response SLOs, and defining physical hardware boundaries, ChargeMesh achieves professional security governance suitable for enterprise adoption and the **OpenAI Codex for Open Source Program**.
