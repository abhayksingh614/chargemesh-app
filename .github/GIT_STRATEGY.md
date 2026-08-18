# ChargeMesh — Git & Versioning Strategy

## Branch Structure

```
main          ← Production. Protected. Only merges from release/* or hotfix/*.
develop       ← Integration branch. All feature PRs target here.
feature/*     ← Feature development. Branch from develop.
fix/*         ← Bug fixes. Branch from develop.
release/*     ← Release preparation. Branch from develop.
hotfix/*      ← Critical prod fixes. Branch from main.
```

## Branch Naming

| Branch Type | Pattern | Example |
|-------------|---------|---------|
| Feature | `feature/CM-XXX-short-description` | `feature/CM-001-map-screen` |
| Fix | `fix/CM-XXX-short-description` | `fix/CM-042-stale-status-display` |
| Release | `release/vMAJOR.MINOR.PATCH` | `release/v1.0.0` |
| Hotfix | `hotfix/CM-XXX-short-description` | `hotfix/CM-099-payment-failure` |
| Chore | `chore/description` | `chore/update-dependencies` |

## Commit Message Format

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <short description>

[optional body]

[optional footer: issue references, breaking changes]
```

### Types
| Type | Use |
|------|-----|
| `feat` | New feature |
| `fix` | Bug fix |
| `chore` | Maintenance, tooling, dependencies |
| `docs` | Documentation only |
| `style` | Formatting, no logic change |
| `refactor` | Code restructure, no feature/fix |
| `test` | Adding or updating tests |
| `perf` | Performance improvement |
| `ci` | CI/CD changes |
| `revert` | Reverts a previous commit |

### Scopes
`mobile` | `admin` | `backend` | `shared` | `ci` | `docs` | `docker` | `cpo` | `payment` | `session`

### Examples
```
feat(mobile): add connector-level status display
fix(backend): prevent unknown status from returning as available
docs(readme): update local setup instructions
chore(ci): add postgres service to backend workflow
feat(cpo): implement OCPI 2.3.0 locations module
```

## Semantic Versioning (SemVer)

Format: `MAJOR.MINOR.PATCH`

| Increment | When |
|-----------|------|
| `PATCH` (0.1.**1**) | Bug fixes, minor improvements |
| `MINOR` (0.**2**.0) | New backward-compatible features |
| `MAJOR` (**1**.0.0) | Breaking changes, major product milestones |

> ⚠️ A new MAJOR version tag/branch requires explicit confirmation before creation.

## Release Tags

Every production release is tagged:

```bash
git tag -a v1.0.0 -m "Release v1.0.0 — MVP Pilot Launch"
git push origin v1.0.0
```

Tags are immutable. Previous release tags are never deleted or overwritten.

## Current Version History

| Version | Date | Description |
|---------|------|-------------|
| v0.1.0 | 2026-08-18 | Initial project setup, documentation, monorepo scaffold |

## Workflow: Feature to Production

```
develop → feature/CM-XXX → PR → develop
develop → release/vX.Y.Z → testing → main (merge + tag)
main    → hotfix/CM-XXX → PR → main + back-merge to develop
```

## Protected Branches

| Branch | Protection |
|--------|-----------|
| `main` | No direct push; PR required; at least 1 review |
| `develop` | No direct push; PR required |
