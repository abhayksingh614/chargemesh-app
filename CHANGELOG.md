# Changelog

All notable changes to ChargeMesh will be documented in this file.

Format: [Semantic Versioning](https://semver.org/) — `MAJOR.MINOR.PATCH`

---

## [1.0.0] — 2026-11-07 (Open Source Readiness & Monorepo Hardening)

### Added
- **Open Source Architecture & Governance Suite**:
  - `OPEN_SOURCE_AUDIT.md`: Complete monorepo source code audit and implementation verification.
  - `PROJECT_ARCHITECTURE.md`: High-level system topology, module decomposition, and data contracts.
  - `TECH_STACK.md`: Complete technology catalog across mobile, backend, admin, and Docker infrastructure.
  - `SECURITY_AUDIT.md`: DevSecOps audit, credential scanning, TEE hardware security, and DPDP compliance.
  - `TESTING.md`: Comprehensive testing standard, verified commands, and test authoring guide.
  - `ROADMAP.md`: Strategic 5-phase development roadmap distinguishing implemented vs planned capabilities.
  - `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md` (Contributor Covenant v2.1), `SECURITY.md`, and `SUPPORT.md`.
  - `THIRD_PARTY_NOTICES.md` & `COPYRIGHT.md`: Notice of open-source licenses and trademark guidelines.
  - `docs/LICENSE_EVALUATION.md`: In-depth analysis of MIT vs Apache 2.0 with draft MIT terms.
- **Visual & Architecture Diagrams**:
  - 8 canonical Mermaid architecture diagrams in `docs/architecture/` (System, Mobile, Backend, Database, Auth, Discovery, CPO CSMS, Data Flow).
  - Visual asset gallery in `docs/screenshots/` showcasing verified logos and onboarding assets.
- **GitHub Community Health**:
  - Structured issue templates (`bug_report.yml`, `feature_request.yml`, `documentation_issue.yml`, `config.yml`).
  - Standardized pull request template (`PULL_REQUEST_TEMPLATE.md`).
  - Automated dependency vulnerability tracking via `.github/dependabot.yml`.
  - Hardened GitHub Actions CI workflows for backend, mobile, admin, and unified monorepo verification.

### Changed
- Monorepo package references: Linked and built `@chargemesh/shared-types` and `@chargemesh/shared-constants` into clean distributions.
- Transformed root `README.md` into an open-source presentation hub.

---

## [1.0.0-rc.1] — 2026-08-30 (Prototype Release)

### Added
- **Hardware-Accelerated CameraX QR Scanner**: Real-time barcode decoding via Google ML Kit.
- **Native Android BiometricPrompt Fingerprint App Lock**: Hardware Keystore session security on app launch and resume.
- **Dedicated Full-Screen Add Money & Wallet Ledger**: Card, UPI, Net Banking payments with mathematically synchronized running balance ledger.
- **15 Indian CPO Charging Networks**: Full directory for Tata Power, Jio-bp, Statiq, Glida, Shell, Zeon, ChargeZone, Relux, Kazam, Electriva, LionCharge, GO EC, BluSmart, etc.
- **Expanded 4-Wheeler EV Catalog**: 17 automotive brands, 40 EV models, 63 production variants with battery capacity and AC/DC power limits.
- **MapLibre Interactive Map**: Full-screen map with 36 States and 700+ Districts search.
- **Clean Permission Setup & Onboarding**: Streamlined Splash ➔ Permission Setup ➔ Login / Guest flow.
- **Bilingual Experience**: English & Hindi with instant persistent toggle.
- **Dynamic Light/Dark Modes**: Full semantic design token system.

### Fixed
- Resolved dark mode color token inconsistencies.
- Fixed demo credentials warning in security docs.

---

## [0.1.0] — 2026-08-18 (Initial Scaffold)

- Initial project setup, monorepo configuration, and documentation scaffold.
