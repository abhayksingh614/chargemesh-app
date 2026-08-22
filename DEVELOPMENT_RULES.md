# ChargeMesh — Master Development, Agent & Engineering Rules

> **Document:** CM-ENG-RULES-01 | **Status:** Mandatory Operational Standard  
> **Scope:** Monorepo (`apps/*`, `packages/*`, `docker/`, `docs/`, `.agents/`)  
> **Applicability:** All Developers, Autonomous Agents, CI/CD, and Engineering Contributors

---

## 1. Project Context

Before starting any major task:
1. Read the relevant project documentation in `docs/` and `.docs/`.
2. Understand the current architecture (`docs/ARCHITECTURE.md`).
3. Understand the approved technology stack (`docs/TECHNOLOGY_STACK.md` and `.config/project.config.json`).
4. Understand the current requirements (`docs/REQUIREMENTS.md`).
5. Check the existing implementation before creating new code.
6. Reuse existing components, services, utilities, and patterns where appropriate.
7. Do not guess requirements that are already documented.
8. Do not silently change approved project decisions.

**Authoritative Context Documents:**
- Project Overview (`docs/PROJECT_OVERVIEW.md`)
- Requirements (`docs/REQUIREMENTS.md`)
- Technology Stack (`docs/TECHNOLOGY_STACK.md`)
- Architecture (`docs/ARCHITECTURE.md`)
- Application Workflow (`docs/WORKFLOW.md`)
- API Documentation (`docs/API_DOCUMENTATION.md`)
- Database Schema (`docs/DATABASE_SCHEMA.md`)
- Deployment & Local Environment (`docs/DEPLOYMENT.md`)
- Extended Legal & Technical Specifications (`.docs/`)

---

## 2. Local-First Development — Mandatory

All development activities must be performed on the local machine first.
- **DO NOT** repeatedly check GitHub during normal development.
- **DO NOT** push every small change to GitHub.
- **DO NOT** push incomplete work.
- **DO NOT** push experimental work.
- **DO NOT** push untested code.

```text
Requirement
    ↓
Local Analysis
    ↓
Local Implementation
    ↓
Local Testing
    ↓
Local Debugging
    ↓
Local Code Review
    ↓
Documentation Review
    ↓
Final Validation
    ↓
Approval
    ↓
GitHub Push
```

GitHub must be treated as the final synchronization and repository stage, not as the primary continuous development workspace.

---

## 3. GitHub Rules

GitHub interaction should happen only when required.

Before every GitHub push:
1. Review all code changes.
2. Run the required tests (`npm test`).
3. Check for errors and warnings (`npm run lint`, `npm run typecheck`).
4. Perform a security review (secret scanning).
5. Review documentation.
6. Review `README.md`.
7. Review version information.
8. Review `CHANGELOG.md` when applicable.
9. Verify that no secrets are included.
10. Verify that only intended files are being pushed (`git status`, `git diff --staged`).
11. Confirm that the project is in a stable state.
12. Push only the final reviewed version.

**Strictly Prohibited from Being Committed/Pushed:**
- Passwords & database credentials
- API keys & access tokens
- Private keys & certificates (`.pem`, `.p12`, `.jks`, `.keystore`)
- Production credentials
- `.env` files containing secrets
- Sensitive personal data
- Temporary/debug files

*Never force-push shared/protected branches unless explicitly authorized.*

---

## 4. README Update Rule

Every GitHub push **MUST** include a review of `README.md`.

Determine whether the changes affect:
- Features & functionality
- Installation & setup procedures
- Configuration & environment variables
- Commands & scripts
- Dependencies & packages
- Usage & workflows
- Architecture & subsystems
- Deployment & ports
- Project behavior

**Execution Standard:**
- If changes affect any README-relevant information: update `README.md` in the same final commit.
- If no README update is necessary: do not make mechanical/unnecessary edits.

> **Rule:** REVIEW README ON EVERY PUSH. UPDATE README ONLY WHEN NECESSARY.

---

## 5. Version Management

Version management must be controlled and intentional.
- Use Semantic Versioning (`MAJOR.MINOR.PATCH`).
- Never change versions randomly.
- Every release must have:
  - Release version
  - Change summary
  - Relevant `CHANGELOG.md` entry
  - Tested status
  - Approved final state
- Breaking changes must be explicitly identified.
- Production releases must be traceable to a specific approved version tag.

---

## 6. Technology Stack Rules

The actual project configuration is the primary source of truth for technologies and dependencies:
- `package.json` & `package-lock.json`
- `docker-compose.yml` & `docker/`
- `packages/*/package.json` & `apps/*/package.json`

**Rules:**
- Maintain `docs/TECHNOLOGY_STACK.md` and `.config/project.config.json`.
- Never document a technology that is not actually used.
- Never assume a technology is installed because it is mentioned in documentation.
- Before adding a new dependency:
  1. Check whether existing project functionality already provides the capability.
  2. Check for duplicate dependencies.
  3. Check compatibility, maintenance, security, and licensing.
  4. Add the dependency only when genuinely required.
  5. Update documentation synchronously.

---

## 7. Architecture Protection

Do not silently change the approved architecture. The following require explicit review and approval before modification:
- Overall system architecture
- Mobile architecture (React Native single cross-platform app)
- Backend architecture (NestJS + CSMS Gateway)
- Database architecture (PostgreSQL + PostGIS + TimescaleDB + Redis)
- CPO integration architecture (Backend Integration Hub)
- Payment architecture (Razorpay tokenization)
- Authentication architecture (JWT)
- Security architecture
- Charging state machine
- API contracts & data models
- Deployment architecture

If a better architectural approach is identified:
1. Explain the current limitation.
2. Explain the proposed change.
3. Explain the impact & affected components.
4. Wait for approval before making a major architectural change.

---

## 8. ChargeMesh CPO Integration Rules

All CPO integrations must follow the approved ChargeMesh integration architecture. The mobile application must **NOT** directly communicate with individual CPO APIs.

```text
Mobile App ──► ChargeMesh Backend ──► CPO Integration Layer ──► CPO Networks
```

**Rules:**
1. CPO credentials must remain strictly server-side.
2. Never expose CPO credentials in mobile or frontend code.
3. Use adapters for proprietary CPO APIs; use standard OCPI 2.3.0 where available.
4. Normalize CPO data into the ChargeMesh canonical model (`packages/shared-types`).
5. Maintain source traceability with ingestion timestamps.
6. Isolate CPO-specific failures with timeouts, retries, and circuit breakers.
7. Maintain CPO capability metadata.

---

## 9. Availability & Data Freshness

Never represent uncertain or stale data as confirmed availability.

Supported connector states:
`AVAILABLE` | `IN_USE` | `RESERVED` | `UNAVAILABLE` | `OFFLINE` | `UNKNOWN` | `STALE`

**Mandatory Rules:**
- **UNKNOWN must never be shown as AVAILABLE.**
- **STALE data must not be represented as confirmed live data.**
- Show freshness timestamps and enforce freshness thresholds.
- Provide clear user warnings for uncertain availability.

---

## 10. Charging State Machine

Charging operations must follow the backend-controlled state machine:

```text
NOT_STARTED ──► STARTING ──► CHARGING ──► STOPPING ──► COMPLETED
                                 │
                                 └──► FAULTED / UNKNOWN / RECOVERY
```

- The frontend must not independently invent charging states.
- Every state transition must be validated, traceable, logged, idempotent, and recoverable.

---

## 11. Payment Rules

1. Do not store raw card credentials or CVV anywhere in the application.
2. Use approved payment provider tokenization (Razorpay).
3. Use idempotency keys for payment operations.
4. Maintain transaction references and reconcile payments with charging sessions and CDRs.
5. Define explicit handling for failed payments, timeouts, and charging start refund/reversal paths.
6. Never implement a stored-value wallet without appropriate legal and regulatory assessment.
7. Clearly define merchant-of-record and settlement responsibilities.

---

## 12. Security Rules

- Enforce TLS 1.3 for all communications (`https://`, `wss://`).
- Never hardcode secrets; use `.env.example` templates locally and AWS Secrets Manager in production.
- Use short-lived JWT access tokens with secure refresh token rotation.
- Store client tokens in secure hardware storage (Keychain / EncryptedSharedPreferences).
- Apply Role-Based Access Control (RBAC) and least privilege.
- Enforce API rate limiting on public and authentication endpoints.
- Never log passwords, tokens, API keys, or sensitive PII.

---

## 13. Environment Separation

Maintain strict isolation:
```text
LOCAL ──► DEVELOPMENT ──► STAGING ──► PRODUCTION
```
- Never use production credentials or production databases locally.
- Never commit production secrets.
- Protect production signing keys and certificates.

---

## 14. API Rules

Every production API must have clearly defined:
- Request/response schemas (DTOs with strict validation)
- Authentication and authorization guards
- Error handling with structured error codes
- Correlation IDs for distributed tracing
- Idempotency where financial or state mutation is involved
- Semantic versioning (`/api/v1/...`)

---

## 15. Database Rules

1. All schema changes must use version-controlled migrations.
2. Never manually modify production data without an approved procedure.
3. Protect financial and charging records; maintain full audit trails.
4. Test migrations and rollback scripts before production application.
5. Automated backups with tested restoration procedures.
6. Enforce data retention and privacy policies.

---

## 16. Testing Rules

Do not consider a feature complete merely because the code runs. Follow:
```text
Development ──► Unit Testing ──► Integration Testing ──► API Testing ──► UI/E2E Testing ──► Regression Testing ──► Security Validation ──► Final Acceptance
```
- Test all critical flows: Auth, Vehicle Profile, Discovery, Availability, QR Scan, Charging Start/Stop, Telemetry, Payments, Refunds, and Admin controls.
- **Never claim that something was tested if it was not actually tested.**

---

## 17. Failure & Recovery Rules

Never design only for the happy path. All operations must account for:
`Success` | `Loading` | `Timeout` | `Failure` | `Unknown` | `Retry` | `Recovery`
- Payment pending → Do not encourage duplicate payment.
- Charging start failure → Provide clear recovery/refund status.
- CPO unavailable → Isolate failure and present available alternative stations.

---

## 18. UI/UX Rules

- Follow the approved design system in `apps/mobile/src/theme/theme.ts`.
- Use approved typography, colors, spacing tokens, and component primitives.
- Do not communicate critical status information using color alone (include text/icons).
- Support loading, empty, error, and offline states across all screens.
- Maintain minimum 48x48dp touch targets and accessibility labels.
- Avoid exposing raw backend CPO terminology to end drivers.

---

## 19. Consumer UX Rule

The consumer journey must remain simple:
```text
FIND ──► VERIFY ──► SELECT ──► PAY ──► CHARGE ──► TRACK ──► IMPACT
```
Drivers must not encounter low-level technical jargon (OCPI, EVSE IDs, CDR, raw webhooks, internal adapter errors).

---

## 20. Accessibility Rules

- Implement screen-reader accessibility (`accessibilityLabel`, `accessibilityRole`).
- Support dynamic text scaling without layout breakage.
- Maintain WCAG AA contrast ratios.
- Provide accessible alternatives for map-dependent information (list views).

---

## 21. Documentation Rules

Synchronize documentation whenever code changes project behavior, architecture, configuration, APIs, database structure, security, or user-facing functionality:
- `README.md`, `TECHNOLOGY_STACK.md`, `ARCHITECTURE.md`, `API_DOCUMENTATION.md`, `DATABASE_SCHEMA.md`, `DEPLOYMENT.md`, `TASKS.md`, `CHANGELOG.md`.
- Update only affected documentation; do not create duplicate or unnecessary files.

---

## 22. Code Quality Rules

- Clean, modular, typed TypeScript with 0 implicit `any`.
- Proper error handling and structured logging.
- Free from dead code, duplicate logic, and temporary debug statements.
- Follow existing codebase conventions and design patterns.

---

## 23. Open-Source & License Rules

- Track all third-party dependencies in `TECHNOLOGY_STACK.md`.
- Never introduce restrictive (e.g. GPL-v3 in proprietary modules) licenses into commercial components without review.

---

## 24. Logging & Observability Rules

- Emit structured logs with Correlation IDs, log levels, and timestamps.
- Never log secrets, passwords, payment details, or PII.
- Monitor CPO integration health, latency, and error rates.

---

## 25. Audit Rules

Maintain immutable audit logs for:
- Admin actions and permission changes
- Payment transactions and refund authorizations
- Charging remote commands (Start/Stop)
- Tariff and CPO configuration updates

---

## 26. Backup & Disaster Recovery

- Automated daily backups for databases.
- Defined Recovery Point Objective (RPO) and Recovery Time Objective (RTO).
- Regular backup restoration drill validation.

---

## 27. Legal & Compliance Rules

- Ensure compliance with DPDP Act (India), IT Act, and RBI payment aggregator guidelines.
- Validate Terms of Service, Privacy Policy, Refund Policy, and CPO Roaming Agreements.
- Legal decisions must be validated by qualified legal counsel.

---

## 28. CPO Data & Branding Rules

- Use CPO logos, trademarks, and station data strictly within contractual rights.
- Maintain operator identity without misleading drivers regarding station ownership.

---

## 29. Privacy Rules

- Apply data minimization: collect only data required for service execution.
- Encrypt PII at rest and in transit.
- Support user data export and deletion requests.

---

## 30. Marketing & Claims Rules

- Never make unsupported claims (e.g. "100% charger uptime" or "All chargers available").
- Distinguish between verified live networks and unverified directory listings.

---

## 31. Release Management

Every production release must have:
- Semantic version tag (`vX.Y.Z`)
- Change summary in `CHANGELOG.md`
- Verification & test sign-off
- Rollback plan

---

## 32. No Silent High-Risk Changes

Agents must **not** silently modify:
- System architecture & technology stack
- Database schema & migration strategies
- Payment flows & security models
- Charging state machine & CPO protocols
- Production infrastructure

*Major changes require explicit review and user approval.*

---

## 33. Agent Behavior Rules

Every agent must:
1. Read relevant documentation before major work.
2. Check existing components and types before creating new ones.
3. Follow the approved technology stack, architecture, security, and UI rules.
4. Run tests and static validations locally.
5. Update documentation and `TASKS.md` synchronously.
6. Clearly report completed work and tests performed.
7. **Never claim untested work is tested.**
8. **Never claim incomplete work is complete.**
9. **Never hide errors or failed tests.**

---

## 34. Agent Permission Boundaries

Agents must not automatically execute high-risk actions without explicit user authorization:
- Production deployments
- Production database drops or irreversible migrations
- Direct GitHub releases or force pushes
- Credential alterations

---

## 35. Task Management

Maintain `TASKS.md`:
- Track `Completed`, `In Progress`, `Pending`, and `Testing Status`.
- Do not mark a task as completed until all acceptance criteria and local validations pass.

---

## 36. Definition of Done (DoD)

A task is considered **DONE** only when:
```text
Requirement satisfied
+ Implementation completed
+ Tests completed & passing locally
+ Code reviewed locally
+ Security verified (no credentials/leaks)
+ UI/UX & accessibility validated
+ Documentation updated where required
+ No unresolved critical issues
+ Acceptance criteria satisfied
```

---

## 37. Production Deployment Flow

```text
LOCAL ──► TEST ──► STAGING ──► QA/UAT ──► APPROVAL ──► PRODUCTION
```
Never deploy an unreviewed local build directly to production.

---

## 38. Rollback Strategy

Every production release must identify the previous stable version, database migration rollback steps, and authorized personnel before deployment.

---

## 39. Incident Management

```text
DETECT ──► CLASSIFY ──► CONTAIN ──► INVESTIGATE ──► RECOVER ──► VERIFY ──► DOCUMENT ──► RCA ──► PREVENT RECURRENCE
```
Document root causes and implement regression tests to prevent recurrence.

---

## 40. Final Master Principle

**Always prioritize:**
1. Correctness
2. Security
3. Reliability
4. Maintainability
5. Compliance
6. Scalability
7. User experience
8. Documentation
9. Development speed

---

## 41. Global Build, Install & Device Verification Process

Whenever a new app update/build is created, always follow this mandatory process:

1. **Build the Updated App**: Generate the latest app build with all implemented changes and verify successful zero-error compilation.
2. **Update Gradle**: Update/sync Gradle dependencies and resolve any build issues before deployment.
3. **Check ADB Connection**: Verify whether the target Android phone is connected and authorized (`adb devices`). Connect and authorize if needed.
4. **Check Existing App Installation**: Check if app exists on device. Uninstall existing version (`adb uninstall com.chargemesh.mobile` or clear app data) to ensure clean state.
5. **Install the New Build**: Install the freshly compiled build (`adb install -r <apk>`) and confirm `Success`.
6. **Launch & Verify**: Open the app (`adb shell monkey -p com.chargemesh.mobile -c android.intent.category.LAUNCHER 1`), verify functionality and affected screens, and inspect logs for errors.
7. **Fix & Retest**: If any issue is discovered, fix immediately and repeat the complete process.

```text
---

## 42. Global Onboarding & Login Verification Process

Whenever a new app build is installed on the phone, the following flow is mandatory on the first launch:

1. **Onboarding Screen**: Appears on first launch. Verify all 3 screens, background artwork, and that "Get Started" and "Skip" work properly.
2. **Login/Registration Screen**: After completing or skipping onboarding, the Login/Registration screen must be displayed. Verify OTP, credentials, and guest access.
3. **Fresh Installation Requirement**: Previous app data must be cleared so the onboarding and login flow are never skipped automatically.

```text
New Build Installed ➔ Fresh App State ➔ Launch App ➔ Onboarding Screen ➔ Complete/Skip Onboarding ➔ Login/Registration Screen ➔ Test
```

---

## 🏁 Final Operating Rule

```text
BUILD LOCALLY FIRST.
TEST LOCALLY.
REVIEW LOCALLY.
FIX LOCALLY.
DOCUMENT LOCALLY.
VALIDATE LOCALLY.

ONLY AFTER FINAL REVIEW AND APPROVAL:
PUSH TO GITHUB.
```

**Before every GitHub push:**
- [ ] Review code
- [ ] Run tests (`npm test`)
- [ ] Review security (no secrets)
- [ ] Review documentation
- [ ] Review `README.md` & update if affected
- [ ] Review version & `CHANGELOG.md`
- [ ] Verify intended files only (`git status`)
- [ ] Confirm final stability
- [ ] Push the approved version
