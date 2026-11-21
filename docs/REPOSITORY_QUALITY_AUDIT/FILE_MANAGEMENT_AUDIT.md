# File & Folder Management Audit

**Audit Date:** November 21, 2026  
**Project:** ChargeMesh Repository  
**Branch:** `develop`  
**Classification Standard:** Production Open-Source Repository Standards  

---

## 1. Objective & Methodology

The purpose of this audit is to systematically review all directories and files across the ChargeMesh repository, ensuring:
1. Professional monorepo structure following modern TypeScript/npm workspace conventions.
2. Clean separation between core applications, shared libraries, operational configurations, and project documentation.
3. Elimination of duplicate, temporary, obsolete, or misplaced files.
4. Retention of all necessary build artifacts, native Android/iOS harnesses, and test configurations without breaking runtime dependencies.

Every file was evaluated under four operational categories:
- **`KEEP`**: Essential source code, build configuration, CI workflows, or standard documentation.
- **`UPDATE`**: Files requiring content corrections, sanitization, or dependency synchronization.
- **`MOVE`**: Files relocated to maintain a clean root hierarchy and standard directory structure.
- **`REMOVE`**: Redundant duplicates, temporary outputs, or obsolete files.

---

## 2. Directory & File Categorization

### 2.1 Root-Level Files

| File / Folder | Classification | Justification | Impact on Runtime / Tooling |
| :--- | :--- | :--- | :--- |
| `package.json` | **KEEP** | Root monorepo configuration defining npm workspaces and centralized scripts (`test`, `build`, `typecheck`). | Essential |
| `package-lock.json` | **KEEP** | Deterministic lockfile ensuring consistent dependency resolution across developer environments and CI. | Essential |
| `tsconfig.base.json` | **KEEP** | Shared TypeScript base configuration providing strict compiler settings across all packages. | Essential |
| `docker-compose.yml` | **KEEP** | Multi-container development orchestration for PostgreSQL 16 (PostGIS), Redis, backend, and admin. | Essential |
| `README.md` | **UPDATE** | Updated with unified monorepo overview, quickstart instructions, and architecture diagrams. | None (Docs) |
| `CONTRIBUTING.md` | **KEEP** | Contributor guidelines for open-source participation. | None (Docs) |
| `LICENSE` | **KEEP** | Apache 2.0 open-source license. | None (Legal) |
| `CODE_OF_CONDUCT.md` | **KEEP** | Contributor Covenant v2.1 community standard. | None (Docs) |
| `SECURITY.md` | **UPDATE** | Sanitized security policy with official disclosure contacts and SLA. | None (Security) |
| `CHANGELOG.md` | **UPDATE** | Chronological record of features, security patches, and version increments. | None (Docs) |
| `INSTALLATION.md` | **UPDATE** | Root quick-reference guide pointing to setup procedures. | None (Docs) |
| `CONFIGURATION.md` | **UPDATE** | Comprehensive environment variable documentation with safe examples. | None (Docs) |
| `API_DOCUMENTATION.md` | **UPDATE** | Root entry point for REST and OCPP API specifications. | None (Docs) |
| `DATABASE_DOCUMENTATION.md` | **UPDATE** | Database schema, relationship diagrams, and migration instructions. | None (Docs) |
| `ARCHITECTURE.md` | **UPDATE** | System architecture, boundaries, and communication topologies. | None (Docs) |
| `DEPLOYMENT.md` | **UPDATE** | Production deployment instructions, container configs, and reverse proxy setup. | None (Docs) |
| `TESTING.md` | **UPDATE** | Testing procedures, execution commands, and verified results. | None (Docs) |
| `TROUBLESHOOTING.md` | **UPDATE** | Monorepo debugging guide, ADB tips, and database connection resolutions. | None (Docs) |
| `MAINTENANCE.md` | **UPDATE** | Runbooks for backups, schema migrations, and log rotations. | None (Docs) |
| `.gitignore` | **KEEP** | Covers `node_modules`, `.env`, build artifacts (`dist`, `build`, `.next`), and OS cache files. | Essential |
| `.dockerignore` | **KEEP** | Prevents host artifacts and secrets from being copied into container images. | Essential |
| `.editorconfig` | **KEEP** | Enforces consistent indentation, line endings, and charset across IDEs. | Essential |
| `SAST_ChargeMesh_SECURITY_REPORT.html` (root) | **REMOVE** | Duplicate 31KB static HTML report in root. Canonical copy preserved in `reports/`. | Safe (Redundant) |

---

### 2.2 Monorepo Workspaces

#### A. Shared Packages (`packages/`)
- `packages/shared-types/`: **KEEP**. Contains TypeScript interfaces, DTO definitions, domain enums, and OCPP message models shared between backend, mobile, and admin.
- `packages/shared-constants/`: **KEEP**. Shared design tokens, status strings, error codes, and configuration defaults.

#### B. Backend Application (`apps/backend/`)
- `apps/backend/src/`: **KEEP**. NestJS 10 application source code organized into modular feature domains (`auth`, `stations`, `sessions`, `wallet`, `ocpp`, `admin`, `database`).
- `apps/backend/src/database/seed.service.ts`: **UPDATE**. Seed data updated to use non-personal test emails and realistic Indian EV charging stations.
- `apps/backend/test/` & `*.spec.ts`: **KEEP**. 96 automated tests covering controllers, services, guards, and OCPP protocol handlers.
- `apps/backend/Dockerfile`: **KEEP**. Multi-stage production container build for NestJS backend.
- `apps/backend/package.json`: **UPDATE**. Added `--runInBand --forceExit` to jest script to guarantee graceful teardown on Windows dev environments.

#### C. Mobile Application (`apps/mobile/`)
- `apps/mobile/src/`: **KEEP**. Cross-platform React Native source code (screens, components, context, navigation, services).
- `apps/mobile/android/`: **KEEP**. Native Android build scripts, Gradle wrappers, Manifest, and native modules (required for Android APK generation).
- `apps/mobile/ios/`: **KEEP**. Native iOS project scaffolding, Podfile, and AppDelegate.
- `apps/mobile/src/services/apiClient.ts` & `AuthContext.tsx`: **UPDATE**. Sanitized demo credentials, added robust backend failover to mock data for offline testing.

#### D. Admin Dashboard (`apps/admin/`)
- `apps/admin/src/app/`: **KEEP**. Next.js 14 App Router pages (`dashboard`, `stations`, `sessions`, `users`, `cpos`, `finance`, `wallet`, `audit-logs`).
- `apps/admin/src/lib/adminApiClient.ts`: **UPDATE**. Configured to dynamically communicate with backend REST API while providing graceful offline fallback.
- `apps/admin/src/lib/dataService.ts`: **UPDATE**. Sanitized mock data to match PostgreSQL database seeds.

---

### 2.3 Documentation Tree (`docs/`)

| Path | Classification | Justification |
| :--- | :--- | :--- |
| `docs/README.md` | **KEEP** | Documentation hub navigation map. |
| `docs/architecture/SYSTEM_ARCHITECTURE.md` | **KEEP** | Deep-dive technical architecture specification. |
| `docs/architecture/DATA_FLOW.md` | **KEEP** | End-to-end data flow and charging lifecycle state machines. |
| `docs/architecture/TECHNICAL_DESIGN.md` | **KEEP** | Engineering design decisions, concurrency handling, and OCPP design. |
| `docs/development/INSTALLATION.md` | **KEEP** | Detailed installation and environment setup guide. |
| `docs/development/CONFIGURATION.md` | **KEEP** | Variable-by-variable configuration dictionary. |
| `docs/api/API_DOCUMENTATION.md` | **KEEP** | REST API endpoints, DTOs, query parameters, and WebSocket OCPP payloads. |
| `docs/database/DATABASE_DOCUMENTATION.md` | **KEEP** | PostgreSQL relational schema, PostGIS spatial queries, and indices. |
| `docs/deployment/DEPLOYMENT_GUIDE.md` | **KEEP** | Production deployment architecture, Docker orchestration, and security. |
| `docs/testing/TESTING_STRATEGY.md` | **KEEP** | Test methodology, unit test catalog, and QA procedures. |
| `docs/security/SECURITY_GUIDELINES.md` | **KEEP** | Zero-trust guidelines, JWT handling, and input sanitization policies. |
| `docs/security/SECURITY_AUDIT.md` | **KEEP** | SAST vulnerability scan results, remediations, and compliance verification. |
| `docs/maintenance/MAINTENANCE_GUIDE.md` | **KEEP** | Operational maintenance, backup automation, and dependency updates. |
| `docs/maintenance/TROUBLESHOOTING.md` | **KEEP** | Troubleshooting playbooks for developers and sysadmins. |
| `docs/maintenance/CHANGELOG.md` | **KEEP** | Comprehensive changelog. |
| `docs/REPOSITORY_QUALITY_AUDIT/` | **KEEP** | Master deliverables for open-source readiness and audit verification. |

---

### 2.4 Historical Archive (`.docs/archive/`)

The `.docs/archive/` folder contains historical planning documentation, project roadmaps, and requirements matrices from earlier project phases (v3.0).
- **Classification:** **KEEP (ARCHIVED)**.
- **Justification:** Retained for historical design context and provenance. Clearly segregated under `.docs/archive/` and marked as historical/non-canonical to avoid confusing new contributors.

---

## 3. Dependency & Tooling Verification

Following the file review and sanitization:
1. **TypeScript Type Checking (`npm run typecheck`):**
   - Evaluated all 5 workspaces (`shared-types`, `shared-constants`, `apps/backend`, `apps/mobile`, `apps/admin`).
   - Result: **0 Errors across the entire monorepo**.
2. **Automated Unit & Integration Tests (`npm run test`):**
   - Result: **115 / 115 tests passed across 19 suites**.
3. **Backend Production Build (`npm run build:backend`):**
   - Result: **Exit code 0** (clean compilation to `apps/backend/dist`).
4. **Admin Panel Production Build (`npm run build:admin`):**
   - Result: **Exit code 0** (all 19 Next.js pages generated successfully).

---

## 4. File Management Recommendations for Contributors

1. **Do not commit build directories:** Always verify that `dist`, `build`, `.next`, `android/app/build`, and `.expo` are ignored by git.
2. **Place documentation in appropriate `docs/` subdirectories:** Avoid adding ad-hoc markdown files to the root directory.
3. **Keep shared code in `packages/`:** Avoid cross-app relative imports (e.g., importing directly from `apps/backend/src` into `apps/admin/src`). Always route shared types through `@chargemesh/shared-types`.
