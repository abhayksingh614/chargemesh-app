---
name: security
description: >-
  Auditing guidelines for detecting credentials in source code, verifying JWT handling,
  and enforcing secure communications.
---

# Security & Secret Audit Skill

This skill defines secret scanning, token safety, and security hardening procedures.

## 1. Secret Protection Guidelines

- **Never Commit Secrets**: Ensure `.env`, certificates (`.pem`, `.crt`), private keys, or API tokens are excluded via `.gitignore`.
- **Environment Variables**: Use `.env.example` to document required variable names without embedding actual live credentials.
- **Git Staging Audit**: Inspect all staged changes before commit:
  ```bash
  git diff --staged | grep -iE 'password|secret|key|bearer|token'
  ```

## 2. API & Communication Hardening

- **OCPP Gateway**: Enforce TLS (`wss://`) and Basic Authentication / client certificate validation for charge point connections.
- **Client Tokens**: Securely store JWT tokens on mobile devices using secure storage primitives (e.g. Keychain / EncryptedSharedPreferences).
- **Input Sanitization**: Validate all incoming payload schemas against DTO classes using `class-validator` / `zod`.
