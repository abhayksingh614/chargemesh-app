# ChargeMesh — Phase 03 Batch 2: Admin Password Database Persistence Remediation
**Document Reference:** `CM-REM-P3-B02`  
**Severity:** HIGH  
**Finding References:** `REM-A01`  
**Date:** 2026-11-20  
**Status:** RESOLVED & VERIFIED  

---

## 1. Problem Statement & Verified Defect

In `apps/backend/src/modules/admin/admin-auth.service.ts`, administrative password lifecycle operations (`changePassword` and `resetPasswordBySuperAdmin`) only mutated the in-memory `adminUsers: Map<string, AdminUserRecord>`. 

Because `this.adminRepo.update()` was never called:
1. Updated passwords were immediately lost upon container restart or rescheduling.
2. In multi-pod container architectures, password changes on Pod A were not visible to Pod B.
3. Database records in `admin_users` retained stale hashes.

---

## 2. Technical Remediation Implementation

### 2.1 Database Persistence Wiring
Updated `apps/backend/src/modules/admin/admin-auth.service.ts`:
- Made `findAdminById()` asynchronous and hybrid: it checks in-memory records first and falls back to querying `this.adminRepo.findOneBy({ id: adminId })` from PostgreSQL.
- Updated `changePassword()`:
  - Validates current password using `bcrypt.compare()`.
  - Enforces minimum complexity via `assertPasswordComplexity(..., { minLength: 10 })`.
  - Hashes new password with 12 bcrypt salt rounds.
  - Updates both in-memory cache and invokes:
    ```typescript
    await this.adminRepo.update(admin.id, {
      passwordHash: newHash,
      updatedAt: new Date(),
    });
    ```
- Updated `resetPasswordBySuperAdmin()`:
  - Generates or accepts a temporary password satisfying password complexity requirements.
  - Hashes temporary password with 12 bcrypt salt rounds.
  - Updates in-memory record and persists to PostgreSQL via `this.adminRepo.update()`.
- Updated `getAdminList()` and `getProfile()` to retrieve records from `this.adminRepo.find()`.

---

## 3. Test Verification & Results

Command:
```bash
npm test --workspace=apps/backend -- src/modules/admin/admin-auth.service.spec.ts
```

Output:
```
PASS src/modules/admin/admin-auth.service.spec.ts (15.458 s)
  AdminAuthService (Security & Bcrypt Verification)
    √ should be defined (94 ms)
    Administrative Login
      √ should successfully authenticate with valid dev credentials and return safe admin object (146 ms)
      √ should reject login when password is incorrect (162 ms)
      √ should reject former hardcoded default password "admin123" (134 ms)
      √ should reject login when password is empty or undefined (75 ms)
      √ should reject login for non-existent admin email with generic message (321 ms)
    Password Change & Complexity
      √ should successfully change password when current password matches and new password meets complexity (897 ms)
      √ should reject password change if current password is wrong (130 ms)
      √ should reject new password shorter than 8 characters (136 ms)
      √ should reject new password without numbers (131 ms)
    Super Admin Password Reset
      √ should allow super admin to reset password with generated temporary password (591 ms)

Test Suites: 1 passed, 1 total
Tests:       11 passed, 11 total
Snapshots:   0 total
Time:        15.98 s
```

Verified that `mockAdminRepo.update` was invoked with the exact target `adminId`, updated bcrypt hash, and timestamp.
