# Contributing to ChargeMesh

Thank you for contributing to ChargeMesh. Please read this guide before opening a PR.

---

## Branching Strategy

| Branch | Purpose |
|--------|---------|
| `main` | Production-ready code only |
| `develop` | Active development integration branch |
| `feature/CM-XXX-description` | Feature branches (linked to issue/ticket) |
| `fix/CM-XXX-description` | Bug fix branches |
| `chore/description` | Non-feature, non-fix changes |

All PRs must target `develop`, never `main` directly.

---

## Development Setup

See [README.md](../README.md) for full setup instructions.

---

## Code Standards

- **TypeScript strict mode** — no `any` unless unavoidable with documented justification
- **Shared types** in `packages/shared-types` — do not duplicate model definitions
- **Shared constants** in `packages/shared-constants` — do not hardcode thresholds
- **No CPO credentials in mobile** — ever
- **No CPO API calls from mobile** — ever

### Critical Rules (Non-Negotiable)

1. `UNKNOWN` connector status must never be displayed as `AVAILABLE`
2. `STALE` status must always show a freshness warning
3. All charging session state transitions must go through the backend state machine
4. All payment actions must use idempotency keys
5. All financial records must be traceable end-to-end

---

## Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat(mobile): add connector status refresh button
fix(backend): correct stale threshold calculation
chore(ci): update Node version to 20
docs(readme): update setup instructions
```

---

## Pull Request Checklist

Before opening a PR, confirm:

- [ ] Code builds without errors
- [ ] TypeScript has no errors (`npm run typecheck`)
- [ ] Linter passes (`npm run lint`)
- [ ] Tests pass (`npm run test`)
- [ ] No secrets or CPO credentials committed
- [ ] Status rules respected (Unknown ≠ Available)
- [ ] New API endpoints documented
- [ ] Migration included if DB schema changed

---

## Security

Never commit:
- `.env` files
- API keys or secrets
- CPO credentials
- Payment provider secret keys
- AWS credentials

If you accidentally commit a secret, rotate it immediately.
