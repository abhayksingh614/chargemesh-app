---
name: testing
description: >-
  Standard operating procedures for authoring and running local automated unit,
  integration, and regression tests across mobile and backend packages.
---

# Automated Testing Skill

This skill defines the testing standards and procedures across the ChargeMesh monorepo.

## 1. Test Suite Organization

- **Unit Tests**: Test pure business logic, formatters, tariff calculations, and state reducers in isolation (`*.spec.ts` / `*.test.tsx`).
- **Integration Tests**: Test repository queries, OCPP message decoding/encoding, and API endpoint request/response flows.
- **Mocking**: Use mock services (`apps/mobile/src/services/mockData.ts`) for offline mobile testing and database in-memory fixtures for backend tests.

## 2. Test Execution Commands

```bash
# Run all monorepo test suites
npm test

# Run tests in specific workspaces
npm test --workspace=apps/mobile
npm test --workspace=apps/backend
npm test --workspace=packages/utils
```

## 3. Pre-Commit Quality Gate

All tests must pass locally with 0 failures before marking tasks complete in `TASKS.md`.
