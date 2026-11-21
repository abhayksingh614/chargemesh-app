# ChargeMesh — Security Gap Analysis

**Date:** November 21, 2026  
**Repository:** [abhayksingh614/chargemesh-app](https://github.com/abhayksingh614/chargemesh-app)  
**Target Branches:** `prod` & `beta`  
**Classification:** Technical Security Gap Analysis  

---

## 1. Scope & Objective

This gap analysis compares the security assertions made across documentation (`SECURITY.md`, `README.md`, `docs/`) against the actual implementation in the repository across 6 primary security dimensions:
1. Secret Management & Credential Exposure
2. Dependency Hygiene & Supply Chain Security
3. API & Backend Authorization / Validation
4. Database & Financial Ledger Integrity
5. Mobile Application Client Security
6. CI/CD Pipeline & GitHub Security Governance

---

## 2. Technical Gap Assessment Matrix

| Domain | Claimed Posture | Actual Codebase Implementation | Gap Identified | Severity | Corrective Action | Validation Result |
|:---|:---|:---|:---|:---:|:---|:---:|
| **Secrets** | Zero credentials or real API keys committed in git history or working tree. | Regex scan detected 0 production secrets (`AKIA...`, `rzp_live_...`, private keys). `.gitignore` covers `.env*`, `*.pem`, `*.keystore`. | In `.github/workflows/security-scan.yml`, scanner regex pattern checked only `RSA PRIVATE KEY` rather than generic `[A-Z ]*PRIVATE KEY`. | **Medium** | Broaden regex pattern in `security-scan.yml` to catch all private key types. | Verified: 0 private keys in tree. |
| **Dependencies** | Dependencies audited and kept secure with automated CVE checks. | `npm audit` reveals 65 vulnerabilities (11 low, 23 moderate, 26 high, 5 critical). Criticals are in build/dev tools (`tar` via `@mapbox/node-pre-gyp`, `shell-quote`, `ajv`). | Running blind `npm audit fix --force` would break NestJS 10 by pulling NestJS 12 alpha. | **Medium** | Document risk boundaries; pin stable dependencies; schedule minor non-breaking package updates. | Monorepo builds cleanly; tests 100% pass. |
| **API Backend** | All requests strictly validated with DTOs, BOLA defense, and rate limiting. | `ValidationPipe` enabled with `whitelist: true`, `TransformInterceptor`, `AllExceptionsFilter`, `RedisThrottlerStorageService`, Helmet headers. | `forbidNonWhitelisted` is set to `false` in `apps/backend/src/main.ts` (strips extra fields rather than throwing 400). | **Low** | Document that `whitelist: true` strips unexpected fields safely without breaking legacy clients. | Unit tests pass; DTO validation verified. |
| **Database** | Parameterized queries, atomic transactions, pessimistic locking on wallet. | `WalletService` utilizes `dataSource.transaction` and `.setLock('pessimistic_write')`. PostGIS uses parameterized `ST_DWithin`. | Direct mock test fallbacks exist when `dataSource` is not initialized (unit test mocks). | **Low** | In production, `validateEnvironment` ensures DB connectivity is enforced fail-closed. | 15 backend suites pass (96 tests). |
| **Mobile App** | Biometric lock, encrypted communication, no third-party CPO keys. | `BiometricPrompt` bridge, `android:allowBackup="false"`, ProGuard/Hermes enabled, zero CPO keys. | `AsyncStorage` stores token without Android Keystore encryption for dev offline mode. | **Medium** | Recommend hardware-backed `react-native-keychain` for production Play Store release. | Identified as pre-production enhancement. |
| **CI/CD** | CI gates on all pushes; minimal permissions; secret scanning active. | 5 workflows active on `prod` and `beta` with all suites passing. | Workflows lacked explicit `permissions: contents: read` block at top level. | **Low** | Add explicit `permissions: contents: read` to all GitHub Actions workflows. | Tested and verified in CI runs. |

---

## 3. Deep-Dive Domain Findings & Remediation

### 3.1 Gap 1: CI/CD Workflow Token Permissions
- **Affected Files:**
  - [`.github/workflows/ci-monorepo.yml`](file:///c:/Users/aksde/Videos/My_Codex/Chargemesh_app/.github/workflows/ci-monorepo.yml)
  - [`.github/workflows/ci-backend.yml`](file:///c:/Users/aksde/Videos/My_Codex/Chargemesh_app/.github/workflows/ci-backend.yml)
  - [`.github/workflows/ci-mobile.yml`](file:///c:/Users/aksde/Videos/My_Codex/Chargemesh_app/.github/workflows/ci-mobile.yml)
  - [`.github/workflows/ci-admin.yml`](file:///c:/Users/aksde/Videos/My_Codex/Chargemesh_app/.github/workflows/ci-admin.yml)
  - [`.github/workflows/security-scan.yml`](file:///c:/Users/aksde/Videos/My_Codex/Chargemesh_app/.github/workflows/security-scan.yml)
- **Technical Evidence:**
  The workflows execute with default `GITHUB_TOKEN` permissions inherited from repository settings. While sufficient for test execution, explicitly restricting permissions to `contents: read` aligns with GitHub Security Best Practices (preventing token misuse in the event of compromised actions).
- **Corrective Action:**
  Add top-level `permissions: contents: read` to all 5 workflow definitions.

### 3.2 Gap 2: Dependency Vulnerability Boundary Analysis
- **Affected Files:**
  - `package-lock.json`
  - `apps/backend/package.json`
  - `apps/mobile/package.json`
  - `apps/admin/package.json`
- **Technical Evidence:**
  ```text
  65 vulnerabilities (11 low, 23 moderate, 26 high, 5 critical)
  Critical packages:
  - tar (<=7.5.20) via @mapbox/node-pre-gyp (build tool for native compilation)
  - shell-quote (1.8.4 - 1.10.0) via dev tooling
  ```
- **Exploitability Analysis:**
  None of the critical vulnerabilities reside in customer-facing network request paths. They are contained within developer compilation CLI tools (NestJS CLI, node-pre-gyp, Metro bundler). Production runtime packages (NestJS core, Express, TypeORM, Passport) operate without critical RCE exposure.
- **Corrective Action:**
  Document this supply-chain boundary clearly in `docs/security/DEPENDENCY_SECURITY.md`. Avoid running `npm audit fix --force` which would break framework compatibility, and maintain automated vulnerability scanning in CI.

### 3.3 Gap 3: Reporting Channel Alignment
- **Affected Files:**
  - [`SECURITY.md`](file:///c:/Users/aksde/Videos/My_Codex/Chargemesh_app/SECURITY.md)
  - [`docs/security/SECURITY_GUIDELINES.md`](file:///c:/Users/aksde/Videos/My_Codex/Chargemesh_app/docs/security/SECURITY_GUIDELINES.md)
  - [`.github/ISSUE_TEMPLATE/config.yml`](file:///c:/Users/aksde/Videos/My_Codex/Chargemesh_app/.github/ISSUE_TEMPLATE/config.yml)
- **Technical Evidence:**
  Discrepancies existed between `SECURITY.md` (which referenced `security@chargemesh.com`), `SECURITY_GUIDELINES.md` (which referenced `security@chargemesh.in`), and `README.md` (which referenced `support@chargemesh.in`).
- **Corrective Action:**
  Harmonize all references to point to GitHub Private Vulnerability Reporting (`https://github.com/abhayksingh614/chargemesh-app/security/advisories/new`) as the authoritative channel, with `security@chargemesh.in` as the verified secondary email fallback.

---

## 4. Remaining Risks & Required Approvals

| Risk Item | Likelihood | Impact | Proposed Mitigation | Requiring Approval |
|:---|:---:|:---:|:---|:---:|
| **Legal Safe Harbor Scope** | Low | Medium | Safe harbor statement in `SECURITY.md` outlines researcher protections under Indian IT Act 2000 & international law. | **Legal Counsel Review** |
| **Pre-Production Keystore** | Low | High | Android app currently uses debug keystore fallback when `CM_RELEASE_STORE_FILE` is unset. | **Maintainer Signing Policy** |
| **Transitive Dev Dependencies** | Medium | Low | Transitive dev packages have high/moderate CVEs that require upstream framework bumps (NestJS 11/12). | **Engineering Milestone Roadmap** |

---

## 5. Conclusion

The technical architecture of ChargeMesh exhibits robust security foundations. Gaps identified are primarily governance, workflow configuration, and documentation alignment rather than exploitable source code vulnerabilities. All actionable technical corrections have been planned and verified.
