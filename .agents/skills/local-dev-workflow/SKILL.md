---
name: local-dev-workflow
description: >-
  Standard operating procedure for local-first development, local verification,
  README synchronization, and end-of-milestone git review before pushing to GitHub.
---

# Local Development & Git Workflow Skill

This skill defines the workflow for executing tasks locally, ensuring quality, synchronizing documentation, and verifying integrity before synchronizing with remote repositories.

## 1. Local-First Development Principles

- **Execute All Tasks Locally**: Implement, test, and debug all features, bug fixes, and refactoring on the local machine.
- **No Premature GitHub Interaction**: Avoid querying GitHub or pushing commits repeatedly during active development.
- **Continuous Local Validation**: Use local commands (lint, typecheck, unit tests, build validation) to verify code health at each step.

## 2. Standard Local Verification Checklist

Before considering any task complete, run the local verification suite:

```bash
# 1. Typecheck and lint
npm run lint
npm run typecheck # or workspace equivalent

# 2. Run unit and integration tests
npm test

# 3. Verify application build
npm run build
```

## 3. Pre-Push README Review & Synchronization

Every GitHub push must include a review of `README.md`:
1. Check if changes affect installation, features, environment variables, commands, or project structure.
2. Update `README.md` in the same commit if affected.
3. If no setup/feature change occurred, leave `README.md` unchanged.

## 4. End-of-Session Review & Push Procedure

When a feature, fix, or milestone is fully completed:

1. **Review Local Changes**:
   ```bash
   git status
   git diff --stat
   ```
2. **Pre-Push Quality Gate**:
   - [ ] Code reviewed locally
   - [ ] Automated tests passed
   - [ ] README reviewed & updated if necessary
   - [ ] No unnecessary documentation changes
   - [ ] Final version approved for GitHub push
3. **Commit with Conventional Commits**:
   - `feat(...)`: New features
   - `fix(...)`: Bug fixes
   - `chore(...)`: Tooling, configs, dependency updates
   - `docs(...)`: Documentation updates
4. **Push upon Approval**:
   ```bash
   git push origin <branch-name>
   ```
