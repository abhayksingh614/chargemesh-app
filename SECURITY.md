# ChargeMesh Security Policy & Governance

The ChargeMesh team and open-source contributors take the security of EV drivers, high-voltage charging equipment, payment transactions, and electrical grid infrastructure seriously. This document outlines our security governance, supported branches and versions, confidential vulnerability reporting procedures, response commitments, and responsible disclosure safe harbor.

---

## 1. Security Scope & Boundaries

### 1.1 In-Scope Components
- **Backend API Gateway & OCPP CSMS Hub** (`apps/backend`): REST endpoints, WebSocket OCPP handlers, authentication guards, BOLA defenses, and database interactions.
- **Mobile Driver Application** (`apps/mobile`): React Native client, Android native security bridges (Biometrics, CameraX), and token storage.
- **Operations & CPO Admin Portal** (`apps/admin`): Next.js management portal, role-based access control, and financial dashboards.
- **Shared Monorepo Libraries** (`packages/shared-types`, `packages/shared-constants`).
- **CI/CD & Repository Infrastructure** (`.github/workflows/`, container specifications).

### 1.2 Out-of-Scope Components & Physical Safety Boundary
> [!CAUTION]
> **Strict Prohibition on Live Physical Hardware & Grid Testing:**  
> Testing against live, physical EVSE chargers, high-voltage electrical distribution infrastructure, public charging networks, or commercial charging stations without explicit written authorization from the station owner is **strictly prohibited**. Research must be conducted exclusively against local source builds, Docker container testbeds, or simulated OCPP charge point stubs.

Other out-of-scope areas:
- Denial of Service (DoS) attacks involving volumetric network flooding or resource exhaustion.
- Social engineering, spamming, or phishing of project maintainers, contributors, or drivers.
- Attacks requiring physical theft of an unlocked mobile device.

---

## 2. Supported Versions & Branch Governance

ChargeMesh separates **branch maintenance** from **release tag support**:

### 2.1 Branch Support Policy
We maintain exactly two permanent repository branches:

| Branch | Classification | Support Status | Notes |
|:---|:---|:---:|:---|
| **`prod`** | **Production (Default)** | ✅ **Active Support** | Contains verified, tested, production-ready code. All security patches land here. |
| **`beta`** | **Development & Testing** | ✅ **Active Support** | Active integration branch where security patches are staged and verified before production promotion. |

### 2.2 Release Tag Support Policy
- **Current Stable Series (`v0.5.x`):** Actively supported. Security patches on `prod` are tagged with semantic patch releases (e.g. `v0.5.2`).
- **Pre-1.0 Releases:** While in pre-1.0 development, only the latest tagged minor/patch release receives security backports.
- **Legacy Releases (`< v0.5.0`):** Unsupported. Users and CPO operators must upgrade to the latest tagged release on `prod`.

---

## 3. Vulnerability Reporting Instructions

**Do NOT report security vulnerabilities via public GitHub issues, discussions, or pull requests.**

### 3.1 Primary Secure Channel: GitHub Private Vulnerability Reporting
Submit vulnerability reports directly through GitHub's encrypted reporting interface:

👉 **[Submit a Private Vulnerability Report](https://github.com/abhayksingh614/chargemesh-app/security/advisories/new)**

*Benefits of GitHub Private Reporting:*
- End-to-end encrypted storage on GitHub infrastructure.
- Direct, private collaboration between researcher and core maintainers.
- Seamless creation of private temporary forks for patch development.
- Coordinated CVE allocation through GitHub's CNA program.

### 3.2 Secondary Fallback: Dedicated Security Email
If you are unable to use GitHub Private Vulnerability Reporting:
- **Email:** `security@chargemesh.in`
- **Cc:** `abhayksingh614@gmail.com` (Core Maintainer Escalation)
- **Subject:** `[SECURITY] ChargeMesh Vulnerability Report — <Brief Summary>`

*(PGP encryption is available upon request. Maintainer PGP fingerprints will be published prior to v1.0.0 production launch).*

---

## 4. Information Required in a Security Report

To facilitate rapid triage, please include:
1. **Affected Component:** Exact file path or API endpoint (e.g. `apps/backend/src/modules/sessions/sessions.service.ts`).
2. **Vulnerability Type:** Detailed description (e.g. Broken Object Level Authorization, race condition, injection).
3. **Step-by-Step Proof of Concept (PoC):** Minimal, reproducible steps or scripts demonstrating the defect safely.
4. **Impact Assessment:** Real-world consequences to drivers, EV charging equipment, or backend infrastructure.
5. **Mitigation Suggestion:** Any recommended fix or architecture modification (optional).

> [!WARNING]
> **Data Privacy Notice:** Never attach real user passwords, live driver personal data (PII), payment card details, or production credentials in vulnerability submissions.

---

## 5. Vulnerability Classification & Severity Rubric

ChargeMesh assesses vulnerabilities using the **Common Vulnerability Scoring System (CVSS v4.0 / v3.1)**, prioritizing real-world exploitability, prerequisite access, and environmental impact:

| Severity | CVSS Score | EV Roaming Domain Examples |
|:---:|:---:|:---|
| **Critical** | 9.0 – 10.0 | Remote Code Execution (RCE) on backend gateway; production database compromise; unauthenticated master wallet drain; unauthorized firmware injection into EVSE chargers. |
| **High** | 7.0 – 8.9 | Broken Object-Level Authorization (BOLA) allowing arbitrary session stoppage; privilege escalation from driver to operator admin; double-spend financial race conditions; live driver location tracking. |
| **Medium** | 4.0 – 6.9 | Distributed denial-of-service on station search; authenticated business logic bypass with limited financial scope; sub-optimal CORS origin allowlist in non-prod setups; rate limit bypass. |
| **Low** | 0.1 – 3.9 | Minor information leakage (e.g. software version banners); non-exploitable error stack traces; missing non-critical HTTP defense headers. |

---

## 6. Response & Remediation Timelines (Target SLOs)

The ChargeMesh core maintainers strive to meet the following **Target Service-Level Objectives (SLOs)**:

| Milestone | Critical / High Severity | Medium / Low Severity |
|:---|:---:|:---:|
| **Initial Acknowledgment** | Within **48 hours** | Within **72 hours** |
| **Technical Triage & CVSS Assessment** | Within **3 to 5 business days** | Within **10 business days** |
| **Remediation & Patch Development** | Target: **14 to 30 business days** | Target: **30 to 60 business days** |
| **Public Advisory & Release** | Coordinated upon patch deployment | Included in next release milestone |

*Note: Complex hardware interoperability issues, third-party upstream CVEs, or protocol-standard changes may require extended remediation timelines. Maintainers will provide regular progress updates to the reporter.*

---

## 7. Responsible Disclosure & Safe Harbor

### 7.1 Responsible Disclosure Expectations
- Make a good-faith effort to avoid privacy violations, data destruction, and service degradation.
- Give maintainers reasonable time to remediate before public disclosure.
- Do not disclose details publicly until a patched release is published.

### 7.2 Safe Harbor Statement
If you conduct security research in compliance with this policy and act in good faith:
- We consider your research **authorized** and will not pursue or support legal action against you regarding your research.
- We will work with you to understand and resolve the issue quickly.
- We will provide public credit and attribution in our security advisories (unless you prefer anonymity).

*(This Safe Harbor statement reflects maintainer intent and is subject to formal legal review under applicable Indian and international cyber law).*

---

## 8. Security Best Practices for Contributors

- **Zero Secrets Committed:** Never commit `.env` files, API keys, private keys, or keystores. Verified by automated CI scanning.
- **Strict Input Validation:** All API endpoints must use NestJS `ValidationPipe` with explicit DTOs (`whitelist: true`, `transform: true`).
- **BOLA & Authorization Defense:** Always verify caller ownership before modifying entities (`session.userId === currentUser.id`).
- **Financial Integrity:** All wallet balance adjustments must execute in TypeORM transactions with pessimistic locking (`.setLock('pessimistic_write')`).
- **Dependency Auditing:** Regularly run `npm audit` and avoid introducing dependencies with unmaintained transitive dependencies.

---

## 9. Comprehensive Security Documentation Suite

For detailed operational procedures, architectural threat models, and audit records, refer to:

- [Vulnerability Response & Incident Handling Policy](docs/security/VULNERABILITY_RESPONSE_POLICY.md)
- [Security Policy Audit & Findings](docs/security/SECURITY_POLICY_AUDIT.md)
- [Security Gap Analysis](docs/security/SECURITY_GAP_ANALYSIS.md)
- [Technical Security Implementation Report](docs/security/SECURITY_IMPLEMENTATION_REPORT.md)
- [Final Security Compliance Report](docs/security/FINAL_SECURITY_COMPLIANCE_REPORT.md)
- [Secret & Credential Management Policy](docs/security/SECRET_MANAGEMENT.md)
- [Dependency Security & Supply Chain Defense](docs/security/DEPENDENCY_SECURITY.md)
- [Security Incident Response Plan (IRP)](docs/security/INCIDENT_RESPONSE_PLAN.md)
- [Security Guidelines & DevSecOps Standard](docs/security/SECURITY_GUIDELINES.md)
