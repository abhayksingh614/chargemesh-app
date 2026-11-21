# ChargeMesh — Dependency Security & Software Supply Chain Policy

**Classification:** DevSecOps Standard  
**Workspaces Covered:** Monorepo root and all npm workspaces  

---

## 1. Supply Chain Defense Principles

Modern applications inherit significant attack surface from third-party open-source libraries. ChargeMesh enforces strict dependency hygiene:
1. **Deterministic Lockfiles:** `package-lock.json` must always be committed and kept in sync with `package.json`.
2. **Automated Vulnerability Scanning:** All dependencies are audited for known CVEs via `npm audit` on every CI run.
3. **Boundary Isolation:** Clear architectural distinction is maintained between client/server production runtime dependencies and local build/transpilation tooling.
4. **No Destructive Force Fixes:** Automated `npm audit fix --force` commands that introduce breaking major version upgrades are forbidden without comprehensive regression verification.

---

## 2. Dependency Tier Classification

| Dependency Category | Examples | Attack Vector | Security Controls |
|:---|:---|:---|:---|
| **Production Runtime (Backend)** | `@nestjs/core`, `typeorm`, `pg`, `passport-jwt`, `bcrypt`, `helmet`, `ioredis` | Remote payload parsing, SQL injection, authentication bypass | Strict semver pinning, runtime input validation, zero critical CVE tolerance |
| **Production Runtime (Mobile)** | `react-native`, `react`, `@react-navigation`, `react-native-svg` | Client-side crash, memory corruption | Hermes bytecode compilation, ProGuard minification |
| **Development & Build Tooling** | `typescript`, `jest`, `eslint`, `@nestjs/cli`, `metro`, `webpack` | Developer workstation or CI runner compromise | Offline execution, sandboxed CI runners, minimal token permissions |

---

## 3. Dependency Triage & Remediation Workflow

When a vulnerability advisory is reported by Dependabot or `npm audit`:

1. **Assess Real Exploitability:**
   - Is the vulnerable function or method actually invoked in ChargeMesh code?
   - Is the vulnerable package part of the production bundle, or is it isolated to developer build tools?
   - Does an untrusted external actor supply inputs to the vulnerable code path?
2. **Determine Non-Breaking Upgrade Path:**
   - Attempt minor or patch bump within existing semantic range: `npm audit fix`.
   - Run monorepo typecheck: `npm run typecheck`.
   - Run test suite: `npm run test`.
3. **Escalation for Major Framework Upgrades:**
   - If an advisory requires a major version bump (e.g. NestJS 10 to 12), create an engineering tracking issue.
   - Schedule upgrade within an upcoming sprint milestone to perform thorough regression testing.
