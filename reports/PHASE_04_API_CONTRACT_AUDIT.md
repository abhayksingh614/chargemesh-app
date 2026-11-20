# CHARGEMESH — PHASE 04 WORKSTREAM 5: BACKEND API CONTRACT AUDIT
**Version:** 1.0  
**Date:** 2026-11-20  
**Auditor:** Principal Software Architect, Staff Backend Engineer, API Standards Reviewer  
**Repository:** `https://github.com/abhayksingh614/chargemesh-app`  
**Base URL:** `http://localhost:3000/api/v1`  

---

## 1. Executive API Assessment

An exhaustive contract audit of all 24 backend endpoints across the 9 controller modules was performed.

### Key Audit Findings:
1. **Unvalidated Admin Payloads (API-001):** The majority of administrative controllers (`AdminAuthController`, `AdminUsersController`, `AdminCpoController`) define `@Body() body: { ... }` inline TypeScript types rather than `class-validator` DTO classes. Consequently, NestJS global `ValidationPipe` cannot enforce runtime type constraints, string lengths, or regex patterns on administrative requests.
2. **Missing Driver Wallet API (API-002):** No driver wallet or payment gateway routes exist in the backend (`/api/v1/wallet/*`).
3. **Missing Role Guards (API-003):** Administrative endpoints require a valid JWT, but do not enforce role-based access control (`@Roles()`), allowing regular drivers to invoke admin management endpoints.
4. **Mock Fallback Leaks (API-004):** `StationsService`, `AdminUsersService`, and `AdminFinanceService` fall back to static in-memory mock datasets when database queries return zero records.

---

## 2. Complete Backend API Inventory

| HTTP Method | Endpoint | Module | Auth Guard | Role Required | Request DTO / Body | Class-Validator Enforced? | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `GET` | `/health` | Health | None | Public | None | N/A | Operational |
| `GET` | `/health/live` | Health | None | Public | None | N/A | Operational |
| `GET` | `/health/ready` | Health | None | Public | None | N/A | Operational |
| `POST` | `/api/v1/auth/send-otp` | Auth | None (Throttle 5/m) | Public | `{ phoneNumber, purpose? }` | No (Inline) | Operational |
| `POST` | `/api/v1/auth/verify-otp` | Auth | None (Throttle 5/m) | Public | `{ phoneNumber, code, purpose? }` | No (Inline) | Operational |
| `POST` | `/api/v1/auth/register` | Auth | None | Public | `RegisterDto` | **Yes** (`@IsNotEmpty`) | Operational |
| `GET` | `/api/v1/auth/profile` | Auth | `jwt` | Driver / Admin | None | N/A | Operational |
| `GET` | `/api/v1/stations` | Stations | None | Public | `FindStationsDto` (Query) | **Yes** (`@IsOptional`) | Operational |
| `GET` | `/api/v1/stations/:id` | Stations | None | Public | None | N/A | Operational |
| `POST` | `/api/v1/sessions/start` | Sessions | `jwt` | Driver | `StartSessionDto` | **Yes** (`@IsNotEmpty`) | Operational |
| `POST` | `/api/v1/sessions/:id/stop` | Sessions | `jwt` | Driver | `{ reason?: string }` | No (Inline) | Operational |
| `GET` | `/api/v1/sessions/:id` | Sessions | `jwt` | Driver | None | N/A | Operational |
| `GET` | `/api/v1/sessions/my` | Sessions | `jwt` | Driver | None | N/A | Operational |
| `POST` | `/api/v1/admin/auth/login` | Admin Auth | None (Throttle 5/m) | Public | `{ email, password? }` | No (Inline) | Operational |
| `GET` | `/api/v1/admin/auth/profile` | Admin Auth | `jwt` | Any Admin | None | N/A | Defect (`req.user.sub` undefined) |
| `GET` | `/api/v1/admin/auth/users` | Admin Auth | `jwt` | Any Admin | None | N/A | Operational |
| `POST` | `/api/v1/admin/auth/change-password` | Admin Auth | `jwt` | Any Admin | `{ currentPassword, newPassword }` | No (Inline) | Defect (`adminId` undefined) |
| `GET` | `/api/v1/admin/users` | Admin Users | `jwt` | Any Admin | Query: `search, status, page, pageSize` | No (Inline) | Operational |
| `GET` | `/api/v1/admin/users/:id` | Admin Users | `jwt` | Any Admin | None | N/A | Operational |
| `PUT` | `/api/v1/admin/users/:id/status` | Admin Users | `jwt` | Any Admin (Missing RBAC) | `{ status, reason }` | No (Inline) | Operational |
| `GET` | `/api/v1/admin/finance/transactions` | Admin Finance| `jwt` | Any Admin | Query: `search, userId, type, page` | No (Inline) | Operational |
| `POST` | `/api/v1/admin/finance/wallet/adjust` | Admin Finance| `jwt` | Any Admin (Missing RBAC) | `AdminWalletAdjustmentRequest` | No (Interface) | Operational |
| `GET` | `/api/v1/admin/cpos` | Admin CPO | `jwt` | Any Admin | Query: `status, search` | No (Inline) | Operational |
| `GET` | `/api/v1/admin/cpos/:id` | Admin CPO | `jwt` | Any Admin | None | N/A | Operational |
| `POST` | `/api/v1/admin/cpos` | Admin CPO | `jwt` | Any Admin (Missing RBAC) | `Partial<AdminCpoDetail>` | No (Interface) | Operational |
| `PUT` | `/api/v1/admin/cpos/:id` | Admin CPO | `jwt` | Any Admin (Missing RBAC) | `Partial<AdminCpoDetail>` | No (Interface) | Operational |
| `GET` | `/api/v1/admin/dashboard/summary` | Admin Dash | `jwt` | Any Admin | None | N/A | Operational |
| `GET` | `/api/v1/admin/dashboard/metrics` | Admin Dash | `jwt` | Any Admin | None | N/A | Operational |
| `GET` | `/api/v1/admin/audit-logs` | Admin Audit| `jwt` | Any Admin | Query: `action, actorId, page` | No (Inline) | Operational |

---

## 3. Contract Standardization Deficiencies & Recommendations

1. **Adopt Standardized DTOs:** Convert all inline request bodies in administrative controllers into decorated DTO classes using `class-validator` (`@IsEmail()`, `@IsString()`, `@MinLength()`, `@IsEnum()`).
2. **Standardize Identity Access:** In `JwtStrategy`, ensure `id`, `sub`, and `userId` are populated uniformly so controllers accessing `req.user.userId` or `req.user.sub` receive identical valid IDs.
3. **Enforce Role Guards:** Add `@UseGuards(AuthGuard('jwt'), RolesGuard)` and `@Roles(AdminRole.SUPER_ADMIN, ...)` across administrative controllers.
4. **Driver Wallet API Contract:** Author dedicated DTOs and endpoints for driver wallet top-up, transaction history, and webhook handlers.
