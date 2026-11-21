# ChargeMesh — Canonical Documentation Hub

Welcome to the **ChargeMesh** canonical documentation directory. All technical documentation, architectural specifications, database designs, deployment runbooks, testing strategies, security audits, and open-source readiness reports are organized into dedicated category subfolders.

---

## 🗂️ Documentation Directory Structure

```
docs/
├── architecture/             # System, mobile, backend, database architectures & workflows
├── development/              # Setup, configuration, roadmap, features, and requirements
├── api/                      # REST API endpoints, DTO models, and OCPP WebSocket specs
├── database/                 # PostgreSQL + PostGIS schemas, entities, and vehicle catalog
├── deployment/               # Docker Compose, Play Store readiness, and build guides
├── testing/                  # Testing strategies, unit/integration suites, and device verification
├── security/                 # Zero-trust guidelines, BOLA defense, and threat analysis
├── maintenance/              # Operational runbooks, troubleshooting, changelog, and support
├── legal/                    # DPDP Act 2023 legal reference, licenses, and third-party notices
├── reports/                  # Technical audits, compatibility reviews, and historical reports
├── REPOSITORY_QUALITY_AUDIT/ # Master 8-part open-source repository quality audit suite
├── OPENAI_CODEX_OSS_READINESS/# Official 8-part OpenAI Codex for Open Source readiness suite
└── screenshots/              # UI screens, mockups, and mobile app visual assets
```

---

## 📚 Master Category Index

### 1. System & Software Architecture (`docs/architecture/`)
- [**System Architecture Overview (`system_architecture.md`)**](architecture/system_architecture.md) — 3-tier system topology and communication boundaries
- [**Project Architecture Specification (`PROJECT_ARCHITECTURE.md`)**](architecture/PROJECT_ARCHITECTURE.md) — Core gateway, CSMS, and multi-tenant layout
- [**Technical Design Document (`TECHNICAL_DESIGN.md`)**](architecture/TECHNICAL_DESIGN.md) — Protocol decisions, concurrency, and pessimistic locking
- [**Mobile Driver App Architecture (`mobile_architecture.md`)**](architecture/mobile_architecture.md) — React Native architecture, state management, and navigation
- [**Mobile Prototype Architecture (`MOBILE_DRIVER_APP_ARCHITECTURE.md`)**](architecture/MOBILE_DRIVER_APP_ARCHITECTURE.md) — Interactive prototype screen and component structure
- [**Backend Gateway Architecture (`backend_architecture.md`)**](architecture/backend_architecture.md) — NestJS 10 modular services, guards, and controllers
- [**Database & PostGIS Architecture (`database_architecture.md`)**](architecture/database_architecture.md) — Spatial indexing and schema relations
- [**CPO & Station Data Models (`CPO_AND_STATIONS.md`)**](architecture/CPO_AND_STATIONS.md) — Domain interfaces for CPO networks and charge points
- [**Design System Specification (`DESIGN_SYSTEM.md`)**](architecture/DESIGN_SYSTEM.md) — Dual-theme tokens, typography, and UX guidelines
- [**Screens & Navigation Directory (`SCREENS_AND_NAVIGATION.md`)**](architecture/SCREENS_AND_NAVIGATION.md) — Comprehensive 22-screen flow catalog
- [**Technology Stack Specification (`TECHNOLOGY_STACK.md`)**](architecture/TECHNOLOGY_STACK.md) — Detailed library dependencies and versions
- [**Verified Tech Stack Matrix (`TECH_STACK_SPEC.md`)**](architecture/TECH_STACK_SPEC.md) — Code-verified technology dependencies
- [**Authentication & Biometric Workflow (`auth_workflow.md`)**](architecture/auth_workflow.md) — OTP dispatch, JWT lifecycle, and app lock
- [**Station Discovery Workflow (`station_discovery_workflow.md`)**](architecture/station_discovery_workflow.md) — Spatial PostGIS radius queries
- [**CPO Protocol & OCPP Workflow (`cpo_integration_workflow.md`)**](architecture/cpo_integration_workflow.md) — OCPP 1.6-J and 2.0.1 message flows
- [**End-to-End Session Data Flow (`data_flow.md`)**](architecture/data_flow.md) — Complete charging lifecycle sequence diagrams

### 2. Development & Project Planning (`docs/development/`)
- [**Installation Guide (`INSTALLATION.md`)**](development/INSTALLATION.md) — Bare-metal, Docker, Android emulator & iOS setup
- [**Configuration Reference (`CONFIGURATION.md`)**](development/CONFIGURATION.md) — Environment variables dictionary and validation
- [**Development Roadmap (`ROADMAP.md`)**](development/ROADMAP.md) — 5-phase project milestones and release tracking
- [**Project Overview (`PROJECT_OVERVIEW.md`)**](development/PROJECT_OVERVIEW.md) — Mission, value pillars, and EV roaming problem statement
- [**Product Features Matrix (`PRODUCT_FEATURES.md`)**](development/PRODUCT_FEATURES.md) — Implementation status of driver and admin features
- [**Requirements Specification (`REQUIREMENTS.md`)**](development/REQUIREMENTS.md) — Functional and non-functional requirements
- [**End-to-End Charging Workflow (`CHARGING_WORKFLOW.md`)**](development/CHARGING_WORKFLOW.md) — Step-by-step driver charging operations

### 3. API & Protocols (`docs/api/`)
- [**Full REST & WebSocket API Specification (`API_DOCUMENTATION.md`)**](api/API_DOCUMENTATION.md) — Complete OpenAPI schema, endpoints, DTOs, and OCPP 1.6-J / 2.0.1 specifications

### 4. Database & Persistence (`docs/database/`)
- [**Database Documentation & PostGIS (`DATABASE_DOCUMENTATION.md`)**](database/DATABASE_DOCUMENTATION.md) — 11 TypeORM entities, spatial indexing, and migrations
- [**Database Schema Specification (`DATABASE_SCHEMA.md`)**](database/DATABASE_SCHEMA.md) — Entity-relationship diagrams and table columns
- [**EV Vehicle Catalog Database (`VEHICLE_DATABASE.md`)**](database/VEHICLE_DATABASE.md) — Curated passenger EV specifications for India

### 5. Deployment & Release (`docs/deployment/`)
- [**Production Deployment Guide (`DEPLOYMENT_GUIDE.md`)**](deployment/DEPLOYMENT_GUIDE.md) — Docker Compose, Nginx reverse proxy, and SSL/TLS hardening
- [**Google Play Store Release Readiness (`PLAY_STORE_RELEASE_READINESS.md`)**](deployment/PLAY_STORE_RELEASE_READINESS.md) — Signing, ProGuard, and store listing audit
- [**Build & Release Walkthrough (`WALKTHROUGH.md`)**](deployment/WALKTHROUGH.md) — Local APK compilation and build artifact paths

### 6. Testing & Quality Assurance (`docs/testing/`)
- [**Testing Strategy & Test Catalog (`TESTING_STRATEGY.md`)**](testing/TESTING_STRATEGY.md) — 115 unit and integration tests across 19 suites
- [**Build, Install & Device Testing Guide (`BUILD_AND_TESTING.md`)**](testing/BUILD_AND_TESTING.md) — Physical device and emulator verification flow

### 7. Security, Privacy & Zero-Trust (`docs/security/`)
- [**Security Guidelines (`SECURITY_GUIDELINES.md`)**](security/SECURITY_GUIDELINES.md) — Zero-trust development standards, JWT, and secrets
- [**Security Audit & SAST Remediation (`SECURITY_AUDIT.md`)**](security/SECURITY_AUDIT.md) — Static analysis findings, BOLA defense, and CVE audit
- [**Security Architecture Reference (`SECURITY_REFERENCE.md`)**](security/SECURITY_REFERENCE.md) — Threat models, permissions, and credential policies

### 8. Maintenance & Operations (`docs/maintenance/`)
- [**Maintenance & Operations Guide (`MAINTENANCE_GUIDE.md`)**](maintenance/MAINTENANCE_GUIDE.md) — Backup runbooks, log rotations, and health probes
- [**Troubleshooting Playbook (`TROUBLESHOOTING.md`)**](maintenance/TROUBLESHOOTING.md) — Common developer pitfalls, ADB fixes, and database locks
- [**Project Changelog (`CHANGELOG.md`)**](maintenance/CHANGELOG.md) — Semantic version history and release notes
- [**Community Support Guide (`SUPPORT.md`)**](maintenance/SUPPORT.md) — GitHub Discussions and issue tracker guidelines

### 9. Legal & Compliance (`docs/legal/`)
- [**Legal & Privacy Reference (`LEGAL_PRIVACY.md`)**](legal/LEGAL_PRIVACY.md) — DPDP Act 2023 compliance, consumer protection, and disclaimers
- [**License Evaluation & Analysis (`LICENSE_EVALUATION.md`)**](legal/LICENSE_EVALUATION.md) — Analysis of Apache 2.0 vs MIT vs AGPL licenses
- [**Copyright Notice (`COPYRIGHT.md`)**](legal/COPYRIGHT.md) — Intellectual property statement and attribution
- [**Third-Party Software Notices (`THIRD_PARTY_NOTICES.md`)**](legal/THIRD_PARTY_NOTICES.md) — Open-source dependency licenses and notices

### 10. Audit & Evaluation Reports (`docs/reports/`)
- [**Open-Source Readiness Audit (`OPEN_SOURCE_AUDIT.md`)**](reports/OPEN_SOURCE_AUDIT.md) — Initial open-source readiness gap analysis
- [**Open-Source Readiness Report (`OPEN_SOURCE_READINESS_REPORT.md`)**](reports/OPEN_SOURCE_READINESS_REPORT.md) — Monorepo stabilization assessment
- [**OpenAI Codex Program Initial Audit (`OPENAI_CODEX_FOR_OSS_READINESS.md`)**](reports/OPENAI_CODEX_FOR_OSS_READINESS.md) — Baseline program review
- [**Security Audit Report (`SECURITY_AUDIT.md`)**](reports/SECURITY_AUDIT.md) — Historical DevSecOps and vulnerability report
- [**Repository Cleanup Audit (`REPO_CLEANUP_AUDIT.md`)**](reports/REPO_CLEANUP_AUDIT.md) — Comprehensive file reorganization audit
- [**CPO & EV Compatibility Audit (`CPO_AND_EV_COMPATIBILITY_AUDIT.md`)**](reports/CPO_AND_EV_COMPATIBILITY_AUDIT.md) — 15 Indian CPO networks analysis

### 11. Master Repository Quality Audit Suite (`docs/REPOSITORY_QUALITY_AUDIT/`)
- [**Documentation Quality Audit (`DOCUMENTATION_AUDIT.md`)**](REPOSITORY_QUALITY_AUDIT/DOCUMENTATION_AUDIT.md) — Complete documentation inventory
- [**File & Folder Management Audit (`FILE_MANAGEMENT_AUDIT.md`)**](REPOSITORY_QUALITY_AUDIT/FILE_MANAGEMENT_AUDIT.md) — Monorepo file categorization
- [**Repository Structure Report (`REPOSITORY_STRUCTURE_REPORT.md`)**](REPOSITORY_QUALITY_AUDIT/REPOSITORY_STRUCTURE_REPORT.md) — Before-and-after structural analysis
- [**Sensitive Data & Secret Audit (`SENSITIVE_DATA_AUDIT.md`)**](REPOSITORY_QUALITY_AUDIT/SENSITIVE_DATA_AUDIT.md) — Secret scanning and sanitization
- [**Unused & Obsolete Files Report (`UNUSED_FILES_REPORT.md`)**](REPOSITORY_QUALITY_AUDIT/UNUSED_FILES_REPORT.md) — Elimination of duplicate files
- [**Git History Security Report (`GIT_HISTORY_SECURITY_REPORT.md`)**](REPOSITORY_QUALITY_AUDIT/GIT_HISTORY_SECURITY_REPORT.md) — Forensic audit of historical Git commits
- [**Cleanup Modification Changelog (`CLEANUP_CHANGELOG.md`)**](REPOSITORY_QUALITY_AUDIT/CLEANUP_CHANGELOG.md) — Itemized modification ledger
- [**Final Repository Quality Report (`FINAL_REPOSITORY_QUALITY_REPORT.md`)**](REPOSITORY_QUALITY_AUDIT/FINAL_REPOSITORY_QUALITY_REPORT.md) — Executive summary and scorecard

### 12. OpenAI Codex for Open Source Program Readiness (`docs/OPENAI_CODEX_OSS_READINESS/`)
- [**Eligibility Criteria Assessment (`ELIGIBILITY_ASSESSMENT.md`)**](OPENAI_CODEX_OSS_READINESS/ELIGIBILITY_ASSESSMENT.md) — Official criteria evaluation
- [**Codebase Health & Architecture Audit (`CODEBASE_HEALTH_AUDIT.md`)**](OPENAI_CODEX_OSS_READINESS/CODEBASE_HEALTH_AUDIT.md) — Component quality and typing
- [**Security & Threat Model Audit (`SECURITY_AUDIT.md`)**](OPENAI_CODEX_OSS_READINESS/SECURITY_AUDIT.md) — Threat modeling and BOLA defense
- [**Testing Strategy & CI/CD Report (`TESTING_AND_CI_CD_REPORT.md`)**](OPENAI_CODEX_OSS_READINESS/TESTING_AND_CI_CD_REPORT.md) — 115 passing tests and 5 CI workflows
- [**Open-Source Governance & Community Model (`OPEN_SOURCE_GOVERNANCE.md`)**](OPENAI_CODEX_OSS_READINESS/OPEN_SOURCE_GOVERNANCE.md) — Governance and PR lifecycle
- [**Codex Maintenance Integration Strategy (`CODEX_INTEGRATION_STRATEGY.md`)**](OPENAI_CODEX_OSS_READINESS/CODEX_INTEGRATION_STRATEGY.md) — Inbound PR reviews and API credits
- [**Maintenance Roadmap & Actionable Issues (`MAINTENANCE_ROADMAP.md`)**](OPENAI_CODEX_OSS_READINESS/MAINTENANCE_ROADMAP.md) — Actionable GitHub issues backlog
- [**Final Readiness Report & Application Guide (`FINAL_READINESS_REPORT.md`)**](OPENAI_CODEX_OSS_READINESS/FINAL_READINESS_REPORT.md) — Form responses and final sign-off

---

## 📌 Rules for Future Documentation

1. **Centralized Location:** Every new documentation file (`.md`) must be authored inside the appropriate category subfolder under `docs/`.
2. **Clean Root Directory:** Do not create `.md` files in the repository root. The root is strictly reserved for standard GitHub metadata: `README.md`, `LICENSE`, `CONTRIBUTING.md`, `SECURITY.md`, and `CODE_OF_CONDUCT.md`.
3. **Index Synchronization:** Whenever adding or renaming a document, update this `docs/README.md` index and the master `README.md` project documentation hub.
