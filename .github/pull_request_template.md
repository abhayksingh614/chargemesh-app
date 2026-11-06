# Pull Request

## Summary
<!-- Provide a clear, concise summary of the changes proposed in this PR. -->

## Type of Change
<!-- Select all that apply: -->
- [ ] `feat`: New feature or user capability
- [ ] `fix`: Bug fix
- [ ] `chore`: Tooling, build config, dependency upgrade
- [ ] `docs`: Documentation updates only
- [ ] `perf`: Performance improvement
- [ ] `refactor`: Restructuring without feature/bug change
- [ ] `test`: Adding or updating automated tests

## Related Issues
<!-- Link to related issue(s), e.g. Closes #123 -->
Closes #

## Affected Workspaces
- [ ] `apps/mobile`
- [ ] `apps/backend`
- [ ] `apps/admin`
- [ ] `packages/shared-types`
- [ ] `packages/shared-constants`
- [ ] `docs/` or `.github/`

## Verification Checklist
- [ ] Code builds without errors locally
- [ ] `npm run typecheck` passes with zero errors
- [ ] `npm run test:backend` passes (if backend affected)
- [ ] No secrets, `.env` files, or production credentials committed
- [ ] Domain Status Rules Respected:
  - `UNKNOWN` connector status is NEVER displayed as available
  - Status older than 300s renders a `STALE` freshness warning badge
- [ ] Documentation updated (if API or architecture changed)

## Screenshots or Evidence (if UI change)
<!-- Attach before/after screenshots or curl terminal output -->

## Notes for Reviewers
<!-- Any specific context or architecture details the reviewer should examine -->
