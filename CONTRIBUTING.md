# Contributing to ChargeMesh

Welcome to the ChargeMesh open-source community! ⚡ We are building an interoperable, open-access EV charging infrastructure platform for India and beyond. Whether you are fixing a typo, resolving a bug, proposing a new CPO connector, or optimizing battery telemetry algorithms, your contributions are warmly welcomed.

---

## Table of Contents
1. [Code of Conduct](#1-code-of-conduct)
2. [Prerequisites](#2-prerequisites)
3. [Development Environment Setup](#3-development-environment-setup)
4. [Branching Strategy & Workflow](#4-branching-strategy--workflow)
5. [Coding Standards](#5-coding-standards)
6. [Commit Message Conventions](#6-commit-message-conventions)
7. [Testing Requirements](#7-testing-requirements)
8. [Documentation Requirements](#8-documentation-requirements)
9. [Submitting a Pull Request](#9-submitting-a-pull-request)
10. [Reporting Bugs & Feature Requests](#10-reporting-bugs--feature-requests)
11. [Code Review Expectations](#11-code-review-expectations)

---

## 1. Code of Conduct

All contributors and participants agree to abide by our [Code of Conduct](CODE_OF_CONDUCT.md) (Contributor Covenant v2.1). Please treat everyone with respect, kindness, and professionalism.

---

## 2. Prerequisites

Before setting up the project locally, ensure you have installed:

- **Node.js:** `>= 20.0.0` (LTS recommended)
- **npm:** `>= 10.0.0`
- **Git:** `>= 2.30.0`
- **Docker & Docker Compose:** Required for PostgreSQL + PostGIS & Redis services
- **Android Studio (for mobile development):**
  - JDK 17 (Temurin recommended)
  - Android SDK Platform 34 (Android 14)
  - Android SDK Build-Tools 34.0.0
  - Android Emulator or physical Android device with USB debugging enabled

---

## 3. Development Environment Setup

1. **Fork and Clone the Repository:**
   ```bash
   git clone https://github.com/YOUR_USERNAME/chargemesh-app.git
   cd chargemesh-app
   ```

2. **Install Monorepo Dependencies:**
   ```bash
   npm install
   ```

3. **Build Shared Packages:**
   The monorepo contains shared TypeScript packages consumed by all applications:
   ```bash
   npm run build --workspace=packages/shared-types
   npm run build --workspace=packages/shared-constants
   ```

4. **Verify TypeScript Compilation:**
   ```bash
   npm run typecheck
   ```

5. **Start Infrastructure Services (Optional):**
   ```bash
   npm run docker:up
   ```

6. **Run Individual Applications:**
   - **Backend CSMS Gateway:** `npm run dev:backend` (Runs on `http://localhost:3001`)
   - **Operations Admin Portal:** `npm run dev:admin` (Runs on `http://localhost:3000`)
   - **Mobile Driver App:**
     ```bash
     npm run dev:mobile         # Starts Metro bundler
     npm run android --workspace=apps/mobile  # Installs on Android device
     ```

---

## 4. Branching Strategy & Workflow

We follow the standard Git branching model described in [`.github/GIT_STRATEGY.md`](.github/GIT_STRATEGY.md):

```
main          ◄── Production releases (tagged with SemVer vX.Y.Z)
  ▲
develop       ◄── Main development integration branch. Target ALL PRs here!
  ▲
feature/CM-XXX-description
fix/CM-XXX-description
chore/description
```

- **Protected Branches:** Never commit directly to `main` or `develop`.
- **Target Branch:** All pull requests must target `develop`.

---

## 5. Coding Standards

### 5.1 Strict TypeScript
- Strict mode is enabled monorepo-wide.
- Avoid using `any`. If an unknown payload is received (e.g. dynamic OCPP frame), use `unknown` and validate via type guards or `class-validator`.
- Canonical interfaces belong in `packages/shared-types`. Never duplicate domain types in local app directories.
- Shared business thresholds (tariffs, timeouts, GST rates) belong in `packages/shared-constants`.

### 5.2 Critical Domain Integrity Rules
1. **Never Show Unknown as Available:** An `UNKNOWN` or `OFFLINE` connector status must never be rendered as available in driver screens.
2. **Stale Freshness Warning:** Any telemetry or status data older than 300 seconds must render an orange warning badge indicating stale data.
3. **No Direct CPO Calls from Mobile:** The mobile app must never store CPO credentials or make direct API calls to third-party CPO networks. All routing flows through the backend gateway.
4. **Idempotency & Financial Safety:** All payment and wallet debit operations must be idempotent and mathematically verifiable against 18% GST.

---

## 6. Commit Message Conventions

We enforce [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <subject>

[optional body]

[optional footer: Closes #123]
```

### Allowed Types
- `feat`: New feature or user capability
- `fix`: Bug fix
- `docs`: Documentation updates only
- `style`: Formatting, whitespace (no logic changes)
- `refactor`: Restructuring code without behavior change
- `test`: Adding or updating automated tests
- `chore`: Tooling, build configuration, dependency updates
- `ci`: GitHub Actions and CI workflow modifications

### Allowed Scopes
`mobile` | `backend` | `admin` | `shared-types` | `shared-constants` | `docs` | `docker` | `ocpp` | `wallet`

*Example:*
```
feat(mobile): add radial telemetry charging gauge
fix(backend): correct connector stale threshold calculation
docs(readme): add local setup troubleshooting steps
```

---

## 7. Testing Requirements

- Any PR that modifies backend business logic must include unit tests in `apps/backend/src/modules/**/*.spec.ts`.
- Run tests locally before opening a PR:
  ```bash
  npm run test:backend
  ```
- All tests must pass before review.

---

## 8. Documentation Requirements

- If your change introduces or modifies an API endpoint, update `docs/API_DOCUMENTATION.md`.
- If your change affects environment variables, update `.env.example` across the affected workspaces.
- If your change alters system architecture or state machines, update the corresponding diagram in `docs/architecture/`.

---

## 9. Submitting a Pull Request

1. Push your branch to your GitHub fork:
   ```bash
   git push origin feature/CM-042-my-feature
   ```
2. Open a Pull Request targeting the `develop` branch of `abhayksingh614/chargemesh-app`.
3. Fill out the [Pull Request Template](.github/PULL_REQUEST_TEMPLATE.md) completely.
4. Ensure the GitHub Actions CI passes on your PR.
5. Address any reviewer feedback promptly.

---

## 10. Reporting Bugs & Feature Requests

- **Bugs:** Use the [Bug Report Template](.github/ISSUE_TEMPLATE/bug_report.yml). Provide exact reproduction steps, expected behavior, device/OS version, and logs.
- **Feature Ideas:** Use the [Feature Request Template](.github/ISSUE_TEMPLATE/feature_request.yml). Explain the problem statement, proposed solution, and architectural impact.
- **Security Vulnerabilities:** Do NOT report security issues via public GitHub issues. Follow our [Security Policy](SECURITY.md).

---

## 11. Code Review Expectations

Maintainers review PRs based on:
1. Architectural adherence to ChargeMesh domain standards.
2. Code clarity, maintainability, and absence of `any` types.
3. Test coverage and passing CI.
4. Security and privacy posture (no credentials or sensitive leaks).
5. Respectful and constructive collaboration.
