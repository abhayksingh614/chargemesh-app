# Changelog

All notable changes to ChargeMesh will be documented in this file.

Format: [Semantic Versioning](https://semver.org/) — `MAJOR.MINOR.PATCH`

---

## [Unreleased]

### Added
- Preparation for comprehensive documentation overhaul (Phase A)
- Formal proprietary LICENSE file (Phase D)

---

## [1.2.5] — 2026-08-20

### Added
- Completed implementation of 22 mobile screens covering onboarding, charging flow, wallet, profile, eco impact, etc.
- Dynamic Light/Dark mode via ThemeContext with semantic tokens.
- Bilingual UI (English & Hindi) with persistent language toggle.
- Native QR scanner using CameraX + ML Kit.
- MapLibre integration with state & district search (36 states, 700+ districts).
- Wallet & bonus system with transaction history.
- AsyncStorage persistence for auth, preferences, favorites.
- Robust design system with micro‑animations and premium UI components.
- Updated documentation index and quick start guide.

### Fixed
- Resolved dark mode color token inconsistencies.
- Fixed demo credentials warning in security docs.

---

## [1.2.0] — 2026-07-15

### Added
- Core mobile app features: station discovery, charging session management, payment integration (mock), and profile management.
- Mock data services (`mockData.ts`, `evCatalog.json`, `stateDistrictMaster.json`).
- Theme system (light mode only initially, later expanded to dark mode).
- Initial documentation suite (Project Overview, Architecture, Technology Stack).

---

## [0.1.0] — Pre-Development

- Initial project setup and documentation phase
- All 7 source documents completed (v3.0/v3.1)
- Tech stack finalized: React Native + Next.js + NestJS + AWS
