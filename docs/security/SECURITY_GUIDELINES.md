# ChargeMesh — Security Guidelines & DevSecOps Standard

This document establishes the mandatory security standards and coding practices for all ChargeMesh contributors.

---

## 1. Secrets & Credential Management

- **Zero Secrets in Code:** Never hardcode passwords, API keys, JWT secrets, database connection strings, or private keys in source code, tests, documentation, or commit messages.
- **Environment Isolation:** Use `.env.example` templates with safe dummy values (`your_secret_here`).
- **Fail-Closed Validation:** All configuration must be validated at application startup using `class-validator` in `apps/backend/src/config/env.validation.ts`. In production mode, insecure dev default secrets cause a fatal exit.

---

## 2. API Security & Input Validation

- **Strict DTO Validation:** All incoming HTTP requests must pass through NestJS `ValidationPipe` with:
  ```typescript
  new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  });
  ```
- **BOLA / IDOR Prevention:** Endpoints accepting entity IDs (such as `/sessions/:id`) must verify that the authenticated caller owns the resource or possesses the required administrative role.
- **Fail-Closed Hardware Communication:** Inbound OCPP connections from chargers must verify charge point credentials against the database. Unrecognized chargers or connection errors must reject with `status: 'Blocked'`.

---

## 3. Financial Ledger Integrity

- **Double-Entry Accounting:** Every balance modification must record a balancing ledger entry in `finance_ledger`.
- **Atomic Operations:** Use TypeORM database transactions (`dataSource.transaction`) for all balance credits, holds, and debits.
- **Integer Arithmetic:** Represent all currency in whole integer Paise (1 INR = 100 Paise).

---

## 4. Vulnerability Reporting

If you identify a security vulnerability, please submit a report confidentially via [GitHub Private Vulnerability Reporting](https://github.com/abhayksingh614/chargemesh-app/security/advisories/new) or refer to our [Security Policy](../../SECURITY.md) (fallback: `security@chargemesh.in`). Do NOT file public GitHub issues or discussions for security vulnerabilities.
