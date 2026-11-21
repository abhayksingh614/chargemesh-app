# ChargeMesh — Git & Versioning Strategy

## 1. Branch Architecture

ChargeMesh maintains exactly **two permanent branches**:

```
prod          ← Production branch (Default on GitHub). Contains only verified, tested, production-ready code.
  ▲
  │ (Promotion after 100% CI/CD & manual approval)
  │
beta          ← Testing & Development branch. Active integration for features, bug fixes, and verification.
```

| Branch | Role | Direct Push Policy | CI/CD Enforcement |
|:---|:---|:---|:---|
| **`prod`** | **Production** (Default) | Strictly prohibited. Only promoted from `beta` after all checks pass. | Monorepo CI, Security Scan, Backend, Mobile & Admin Gates. |
| **`beta`** | **Testing & Development** | Feature/Fix PRs target here. Active staging & automated QA. | Monorepo CI, Security Scan, Backend, Mobile & Admin Gates. |

---

## 2. Development & Promotion Workflow

All development follows a strict local-first, gate-validated promotion pipeline:

```
[Local Feature / Fix / Chore]
            │
            ▼
   1. Local Verification (Typecheck + Lint + Unit Tests + Build)
            │
            ▼
   2. Push to `beta` (or PR targeting `beta`)
            │
            ▼
   3. Automated CI/CD Pipeline on `beta`
      ├── Typecheck & Monorepo Validation
      ├── Security & Secret Scanning
      ├── Backend Gateway Tests (15 suites)
      ├── Mobile App Tests
      └── Admin Portal Tests & Build
            │
            ▼ (All checks green & reviewed)
   4. Promote / Merge `beta` ──► `prod`
            │
            ▼
   5. Tag Production Release (`vMAJOR.MINOR.PATCH`)
```

### Golden Rules
1. **`beta` First:** All new code changes, enhancements, and bug fixes must first be committed or merged into `beta`.
2. **Automated Verification:** All test suites, code quality checks, security scans, and CI/CD pipelines must pass on `beta`.
3. **Controlled Promotion:** Once validated on `beta`, changes are merged/promoted to `prod`.
4. **`prod` Stability:** The `prod` branch must always contain stable, tested, production-ready code.
5. **No Direct Untested Pushes:** Never push untested or unapproved code directly to `prod`.

---

## 3. Temporary Working Branches (Local / PR)

When working on complex features or external contributions, short-lived working branches may be created off `beta` and merged back into `beta`:

| Branch Pattern | Purpose | Target |
|:---|:---|:---|
| `feature/CM-XXX-description` | New feature implementation | `beta` |
| `fix/CM-XXX-description` | Bug fix or regression patch | `beta` |
| `chore/description` | Tooling, dependencies, or docs | `beta` |

*Note: All temporary branches are deleted immediately after merging into `beta`.*

---

## 4. Commit Message Format

We strictly enforce [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <short description>

[optional body]

[optional footer: issue references, breaking changes]
```

### Allowed Types
| Type | Description |
|:---|:---|
| `feat` | New feature or user capability |
| `fix` | Bug fix or regression repair |
| `chore` | Maintenance, tooling, dependencies |
| `docs` | Documentation updates only |
| `style` | Formatting, whitespace (no logic changes) |
| `refactor` | Restructuring code without changing behavior |
| `test` | Adding or updating automated tests |
| `perf` | Performance optimization |
| `ci` | CI/CD pipeline and GitHub Actions changes |
| `revert` | Reverts a previous commit |

### Allowed Scopes
`mobile` | `admin` | `backend` | `shared-types` | `shared-constants` | `ci` | `docs` | `docker` | `ocpp` | `wallet` | `stations` | `sessions`

---

## 5. Semantic Versioning (SemVer)

Format: `vMAJOR.MINOR.PATCH`

- **PATCH** (`v0.5.1` ➔ `v0.5.2`): Backward-compatible bug fixes and security patches.
- **MINOR** (`v0.5.0` ➔ `v0.6.0`): New backward-compatible features and protocol handlers.
- **MAJOR** (`v0.5.0` ➔ `v1.0.0`): Breaking API changes or production launch milestones.

Every production release on `prod` is tagged with an annotated Git tag:
```bash
git tag -a v0.5.1 -m "Release v0.5.1 — Core platform stabilization"
git push origin v0.5.1
```
