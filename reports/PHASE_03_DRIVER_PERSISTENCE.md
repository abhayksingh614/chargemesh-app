# ChargeMesh — Phase 03 Batch 3: Driver Data Persistence Remediation
**Document Reference:** `CM-REM-P3-B03`  
**Severity:** HIGH  
**Finding References:** `REM-A02`  
**Date:** 2026-11-20  
**Status:** RESOLVED & VERIFIED  

---

## 1. Problem Statement & Verified Defect

In `apps/backend/src/modules/admin/admin-users.service.ts`, administrative driver management functions (`findById`, `findAll`) solely queried an in-memory `users: Map<string, UserProfile>`.

As a consequence:
1. Real drivers registered into the PostgreSQL `users` table via mobile OTP registration were invisible in the admin portal user list (`/api/v1/admin/users`).
2. Looking up a registered user by ID from the admin portal returned HTTP 404 Not Found (`Driver usr-... not found`).
3. Driver status changes (suspension, banning, reactivation) only modified in-memory records and did not persist driver status across app restarts.

---

## 2. Technical Remediation Implementation

### 2.1 Database Integration & QueryBuilder Wiring
Updated `apps/backend/src/modules/admin/admin-users.service.ts`:
- **`findAll()`**:
  - Implemented SQL query builder execution against `this.userRepo`:
    ```typescript
    const qb = this.userRepo.createQueryBuilder('u');
    if (query?.status) qb.andWhere('u.status = :status', { status: query.status });
    if (query?.search) {
      const s = `%${query.search.trim().toLowerCase()}%`;
      qb.andWhere('(LOWER(u.name) LIKE :s OR u.phoneNumber LIKE :s OR LOWER(u.email) LIKE :s)', { s });
    }
    qb.orderBy('u.createdAt', 'DESC').skip((page - 1) * pageSize).take(pageSize);
    ```
  - Graceful fallback to seeded in-memory demo records if the database is unpopulated or in isolated unit-test environments.
- **`findById(id: string)`**:
  - Queries `this.userRepo.findOneBy({ id })` from PostgreSQL.
  - Transforms `UserEntity` into a comprehensive `UserProfile` payload.
  - Throws `NotFoundException` only if the user is absent from both database and memory.
- **`updateStatus(id, status, reason, adminActor)`**:
  - Atomically updates `users.status` and `users.updatedAt` in PostgreSQL via `this.userRepo.update()`.
  - Records an immutable audit log entry in `auditService.record()`.

---

## 3. Test Verification & Results

Command:
```bash
npm test --workspace=apps/backend -- src/modules/admin/admin-users.service.spec.ts
```

Output:
```
PASS src/modules/admin/admin-users.service.spec.ts (11.638 s)
  AdminUsersService (Driver Data Persistence REM-A02)
    √ should find driver by ID from database repository (29 ms)
    √ should fallback to demo user in memory if not in database (5 ms)
    √ should throw NotFoundException if driver is not found in database or memory (27 ms)
    √ should retrieve drivers via createQueryBuilder and paginate correctly (8 ms)
    √ should update driver status and persist to database while recording audit log (5 ms)

Test Suites: 1 passed, 1 total
Tests:       5 passed, 5 total
Snapshots:   0 total
Time:        12.142 s
```
