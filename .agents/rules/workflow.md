# ChargeMesh — Local-First & Master Engineering Workflow Rules

Refer to [DEVELOPMENT_RULES.md](../../DEVELOPMENT_RULES.md) for the authoritative 40-section Master Rules.

## Key Directives:
1. **Local-First Execution**: Build, test, debug, validate, and document everything on the local machine first.
2. **No Periodic GitHub Operations**: Do not query, fetch, or push to GitHub during active local development iterations.
3. **Pre-Push Quality Gate**:
   - [ ] Local tests and typechecks pass with 0 errors
   - [ ] Security audit: 0 credentials or secrets in code or commits
   - [ ] Pre-push `README.md` review: updated if setup/features changed
   - [ ] Synchronized documentation across `docs/`, `TASKS.md`, and `CHANGELOG.md`
   - [ ] Final user review and explicit approval before any GitHub push
