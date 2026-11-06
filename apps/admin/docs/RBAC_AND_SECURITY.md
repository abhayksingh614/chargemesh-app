# ChargeMesh Admin Dashboard — RBAC & Security Specification

This document details the Role-Based Access Control (RBAC) hierarchy, permission policies, sensitive data masking rules, and security protections enforced across the ChargeMesh Admin Dashboard.

---

## 1. Role Definitions & Hierarchy

```
┌────────────────────────────────────────────────────────┐
│                      SUPER ADMIN                       │
│    (Full System Access, RBAC Provisioning, Audit)      │
└──────────┬───────────────────┬───────────────────┬─────┘
           │                   │                   │
           ▼                   ▼                   ▼
┌────────────────────┐ ┌───────────────┐ ┌───────────────┐
│  OPERATIONS ADMIN  │ │ FINANCE ADMIN │ │ SUPPORT ADMIN │
│  (CPOs, Stations,  │ │ (Payments,    │ │ (Drivers,     │
│   EVSE, Sessions)  │ │  Ledger, Ref) │ │  Tickets, Log)│
└──────────┬─────────┘ └───────┬───────┘ └───────┬───────┘
           │                   │                 │
           └───────────────────┼─────────────────┘
                               ▼
┌────────────────────────────────────────────────────────┐
│                   ANALYST (READ-ONLY)                  │
│       (Aggregated Reports, ESG Impact, Analytics)      │
└────────────────────────────────────────────────────────┘
```

---

## 2. Granular RBAC Permissions Matrix

| Admin Action | Super Admin | Operations Admin | Finance Admin | Support Admin | Analyst |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **View Dashboard Metrics** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **View Driver Directory** | ✅ | ✅ (Masked PII) | ✅ (Masked PII) | ✅ | ✅ (Aggregated) |
| **Suspend / Reactivate User** | ✅ | ❌ | ❌ | ✅ | ❌ |
| **View CPO & Credentials** | ✅ (Full) | ✅ (Masked Keys) | ❌ | ❌ | ❌ |
| **Trigger CPO Sync** | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Create / Edit Stations** | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Remote Start/Stop Charger** | ✅ | ✅ | ❌ | ✅ (Emerg. Stop) | ❌ |
| **View Financial Ledger** | ✅ | ❌ | ✅ | ❌ | ✅ (Aggregated) |
| **Process Payment Refund** | ✅ | ❌ | ✅ | ❌ | ❌ |
| **Execute Wallet Adjustment** | ✅ | ❌ | ✅ | ❌ | ❌ |
| **Manage EV Master Database** | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Publish Push Broadcasts** | ✅ | ✅ | ❌ | ❌ | ❌ |
| **View System Audit Logs** | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Admin User Provisioning** | ✅ | ❌ | ❌ | ❌ | ❌ |

---

## 3. Sensitive Data Masking Policy

To comply with data privacy regulations (DPDP Act India / GDPR):

1. **Driver Phone Numbers**: Full number visible only to Support and Super Admins. Operations and Finance views mask phone as `+91 98765 *****`.
2. **Payment Card & Bank Details**: Only the last 4 digits and card brand (e.g. `•••• 4821 - Visa`) are stored or rendered. Full PAN and CVV are **strictly never accepted, stored, or exposed**.
3. **CPO Partner API Keys**: Encrypted at rest via AES-256-GCM; displayed in Admin UI as `sk_live_••••••••9021`.
