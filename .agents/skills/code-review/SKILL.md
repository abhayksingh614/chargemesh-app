---
name: code-review
description: >-
  Procedures for conducting local code reviews, lint validations, TypeScript checks,
  and design token adherence inspections before finalizing changes.
---

# Code Review Skill

This skill defines the checklist and inspection standards for local code reviews.

## 1. Review Checklist

1. **Architecture & Separation of Concerns**:
   - UI components must not execute direct database queries or raw unvalidated fetch calls.
   - Screen files must delegate reusable UI blocks to `components/`.
2. **Design Tokens & Theme**:
   - Verify that colors and metrics are imported from `theme.ts`.
   - Disallow hardcoded arbitrary pixel values or inline color hexes without justification.
3. **Type Safety**:
   - No implicit `any` types.
   - Use types from `@chargemesh/shared-types` where cross-service contracts exist.
4. **Error Handling & UX**:
   - Verify fallback UI on network timeout or station disconnect.
   - Confirm user-friendly error messages rather than unhandled exception alerts.

## 2. Automated Static Verification

```bash
# Run ESLint across workspace
npm run lint

# Run TypeScript compiler check across workspaces
npm run typecheck
```
