# ChargeMesh — Legal & Privacy Reference

> **Version:** 1.2.5 | **Updated:** 2026-08-24  
> **Status:** Development Reference — Requires qualified Indian legal counsel review before production use

---

> [!CAUTION]
> **LEGAL DISCLAIMER**
>
> This document is a **planning and development reference only — not legal advice**.
> All final legal documents, regulatory positions, contractual terms, privacy policies, and compliance obligations **must be reviewed and validated by qualified Indian legal counsel** before any production launch, public distribution, or commercial agreements.
>
> Laws, RBI directions, data-protection implementation dates, and platform policies change. ChargeMesh must obtain professional legal advice covering all areas in this document before going live.

---

## Table of Contents

1. [Product Legal Role](#1-product-legal-role)
2. [Data Collected by the App](#2-data-collected-by-the-app)
3. [Privacy Policy Framework](#3-privacy-policy-framework)
4. [Data Protection — DPDP Act 2023](#4-data-protection--dpdp-act-2023)
5. [Location Data](#5-location-data)
6. [User Rights](#6-user-rights)
7. [Payment & Wallet Legal Notes](#7-payment--wallet-legal-notes)
8. [Consumer Protection Obligations](#8-consumer-protection-obligations)
9. [Vehicle Compatibility Disclaimer](#9-vehicle-compatibility-disclaimer)
10. [Availability & Status Disclaimer](#10-availability--status-disclaimer)
11. [Charging Safety Responsibility](#11-charging-safety-responsibility)
12. [Refund & Failed Charging Policy](#12-refund--failed-charging-policy)
13. [Data Retention](#13-data-retention)
14. [Grievance Redressal](#14-grievance-redressal)
15. [App Store Readiness](#15-app-store-readiness)
16. [Pre-Production Legal Checklist](#16-pre-production-legal-checklist)

---

## 1. Product Legal Role

ChargeMesh is a **software interoperability and discovery platform**. It is not a Charge Point Operator (CPO) and does not own or operate charging infrastructure.

```
User ↔ ChargeMesh (Software Platform) ↔ Payment Provider ↔ CPO (Station Owner)
```

Key responsibility boundaries:
- **ChargeMesh** provides the discovery, session management UI, and payment orchestration layer
- **CPO** owns and is responsible for the physical charging hardware and service delivery
- **Payment Provider** (e.g., Razorpay) is the regulated entity handling payment processing
- **User** contracts with ChargeMesh for platform use and with the CPO for charging service

> ⚠️ ChargeMesh must **not** represent that it owns or operates any CPO's charging infrastructure.

---

## 2. Data Collected by the App

The following personal data categories are collected or processed by the ChargeMesh mobile app:

| Data Category | Collected When | Purpose |
|---------------|---------------|---------|
| Mobile number | Registration / Login | Identity & OTP authentication |
| Full name | Registration | Account personalization |
| Email address | Registration / Login | Account notifications |
| Vehicle information | Add Vehicle | Compatibility display, session tracking |
| Charging session history | Every charge | History, billing, eco tracking |
| Payment references | Payment | Transaction reconciliation (not raw card data) |
| Wallet balance & transactions | Wallet use | Financial record |
| Precise / approximate location | Map / station discovery | Show nearby stations |
| Favourite stations | Favourites | User preference storage |
| App preferences | Settings | Theme, language persistence |
| Device/app telemetry | All use | Crash reporting, performance (planned) |
| Support communications | Support flow | Issue resolution |

> **Note (Current — v1.2.5):** All data is stored **locally on the device** via AsyncStorage. No data is sent to a remote server yet. This will change when the backend is connected (Phase 2).

---

## 3. Privacy Policy Framework

> ⚠️ A full, legally compliant Privacy Policy must be drafted by qualified Indian legal counsel before public launch.

### Minimum Required Sections

| Section | Content Required |
|---------|-----------------|
| **Identity** | Legal entity name, registered address, contact details |
| **Collection** | What data is collected, how, and when |
| **Purpose** | Specific purpose for each data category |
| **Lawful Basis** | Consent, legitimate interest, contractual necessity |
| **Payment** | Role of payment provider; no raw credential storage |
| **CPO Sharing** | What data is shared with CPOs for session authorization |
| **Vendors** | Cloud hosting, maps, analytics, support — as data processors |
| **Retention** | Retention period per data category (see Section 13) |
| **User Rights** | How users can access, correct, or delete their data |
| **Security** | Technical and organizational safeguards |
| **Children** | App is not intended for users under 18 |
| **Changes** | How policy updates will be communicated |
| **Grievance** | Data Protection contact and grievance process |

### Data Sharing with CPOs

| Data | Sharing Principle |
|------|-----------------|
| User ID / session token | Share only for charging authorization |
| Phone / name | Share only if required by CPO for service |
| Vehicle type | Share only for compatibility checks |
| Payment credentials | **Never share raw credentials** |
| Location | Share only as needed for session routing |

---

## 4. Data Protection — DPDP Act 2023

The **Digital Personal Data Protection Act 2023** (DPDP Act) governs processing of digital personal data in India. Associated rules (Digital Personal Data Protection Rules 2025, notified November 2025) define implementation requirements.

> ⚠️ Legal counsel must confirm the then-current implementation position and applicable requirements at the time of production launch.

### Key Obligations to Plan For

| Obligation | Description |
|-----------|-------------|
| **Consent / Notice** | Obtain valid consent or establish lawful basis before processing personal data |
| **Purpose Limitation** | Collect only data necessary for stated purpose |
| **Data Principal Rights** | Support access, correction, nomination, and erasure rights where applicable |
| **Retention Limits** | Define and enforce retention periods — delete data no longer needed |
| **Security** | Implement appropriate technical and organisational security measures |
| **Data Processor Agreements** | Contracts with all third-party vendors processing personal data |
| **Grievance Mechanism** | Accessible in-app and web grievance contact |
| **Data Protection Officer** | Assess DPO appointment requirement based on processing scale |
| **Significant Data Fiduciary** | Assess whether ChargeMesh qualifies under applicable thresholds |

### DPDP Workstream (Pre-Launch)

- [ ] Data mapping (what, why, where)
- [ ] Privacy notice drafting (legal counsel)
- [ ] Consent mechanism design (in-app)
- [ ] Retention policy definition
- [ ] User rights implementation (access, correction, deletion)
- [ ] Third-party data processor agreements
- [ ] Security assessment
- [ ] DPO appointment assessment

---

## 5. Location Data

| Principle | Detail |
|-----------|--------|
| **Foreground only** | Location used only when the app is active |
| **Manual fallback** | Users can always type a location instead of using GPS |
| **Purpose** | Nearby station discovery — not for advertising or tracking |
| **Retention** | Precise location is not stored beyond the session |
| **Background location** | Not used unless a specific justified feature requires it |
| **Permission UX** | Clear in-app explanation of why location is requested before the system prompt |

---

## 6. User Rights

Users have the following rights over their data (subject to applicable law and final privacy policy):

| Right | Description |
|-------|-------------|
| **Access** | View their personal data held by ChargeMesh |
| **Correction** | Update inaccurate personal data |
| **Deletion** | Request deletion of their account and data |
| **Portability** | Export their data in a machine-readable format (planned) |
| **Withdraw Consent** | Withdraw consent for data processing where consent is the basis |
| **Grievance** | Raise a data complaint with the designated grievance officer |

> Implementation of these rights requires backend and admin portal support — planned for Phase 2.

---

## 7. Payment & Wallet Legal Notes

> ⚠️ **RBI PPI Warning:** If ChargeMesh stores customer money (wallet) and lets users spend that stored value across third-party CPOs, this may implicate RBI's Prepaid Payment Instrument (PPI) framework. Entities cannot operate payment systems for PPIs without RBI approval.

**Current State (v1.2.5):** The wallet is fully mock — no real money is stored or moved. No regulatory issue arises in the current development-only state.

**Before Production:**
- [ ] Obtain formal legal/regulatory assessment on wallet architecture
- [ ] Engage a licensed PPI issuer if a stored-value cross-CPO wallet is required
- [ ] Ensure Razorpay integration complies with applicable RBI guidelines
- [ ] Define merchant of record, settlement flow, invoice issuance, and refund responsibility
- [ ] Ensure all GST/tax treatment is legally assessed

---

## 8. Consumer Protection Obligations

Under the **Consumer Protection (E-Commerce) Rules 2020**:

| Obligation | ChargeMesh Requirement |
|-----------|----------------------|
| Accurate descriptions | No false claims about charger availability or ownership |
| Transparent pricing | Show all applicable charges before payment authorization |
| Grievance mechanism | Accessible in-app and via website |
| No misleading availability | Never show `UNKNOWN` status as `Available` |
| No deceptive advertising | Truthful marketing about platform scope |
| Refund policy | Clear, published, and honoured |
| Business disclosures | Legal entity name, address, CIN in-app |
| No false ownership | Never represent that ChargeMesh owns CPO infrastructure |

---

## 9. Vehicle Compatibility Disclaimer

> ChargeMesh vehicle compatibility information (connector types, charging power) is provided for guidance purposes only. Actual compatibility depends on the specific vehicle configuration, the charging station hardware, and any recent updates from the manufacturer or CPO. ChargeMesh does not guarantee that any specific vehicle will charge successfully at any specific station.

This disclaimer must appear in the app's Help / About section and Terms of Service.

---

## 10. Availability & Status Disclaimer

> Charging station availability and status information displayed in ChargeMesh is sourced from CPO network data. ChargeMesh does not guarantee the real-time accuracy of this information. Status may be delayed, stale, or unavailable due to network or CPO system issues.

Key UI implementation rule: **`UNKNOWN` status is never displayed as `Available`.** (Implemented — see `DESIGN_SYSTEM.md`.)

---

## 11. Charging Safety Responsibility

| Responsibility | Responsible Party |
|---------------|-----------------|
| Physical hardware safety | CPO / Site Operator |
| Emergency contact information | CPO (surfaced via ChargeMesh UI) |
| User safety instructions (general) | ChargeMesh |
| Unsafe electrical guidance | ChargeMesh must **never** provide this |
| Incident reporting and handling | Defined contractually between ChargeMesh and CPO |

---

## 12. Refund & Failed Charging Policy

> A formal refund policy must be legally reviewed and published before production launch.

### Refund Scenarios

| Scenario | Required Handling |
|----------|-----------------|
| Payment succeeded, charging failed to start | Automatic reversal / refund path |
| Session stopped unexpectedly | CDR calculation + adjustment/refund |
| CDR delayed | Pending reconciliation status shown to user |
| Duplicate payment | Detection + reversal |
| CPO outage | Prevent charge authorization; refund if authorized |
| Incorrect final amount | Dispute / reconciliation / refund process |

### Requirements
- Clear SLA for refund processing timeline
- User notified of refund initiation and completion
- Refund reference numbers provided
- Manual review process for exceptions
- Contractual alignment with payment provider on refund handling

---

## 13. Data Retention

> Exact retention periods must be defined and approved by legal counsel.

| Data Category | Suggested Retention | Basis |
|---------------|--------------------|----|
| Account data | Duration of account + X months post-deletion | Contractual |
| Charging session history | Minimum 3 years | Tax / accounting |
| Payment references | Minimum 8 years | GST / tax compliance |
| Location data (live) | Not stored beyond session | Privacy minimization |
| Support tickets | 2 years post-resolution | Consumer protection |
| Crash/telemetry | 90 days rolling | Operational |

---

## 14. Grievance Redressal

ChargeMesh must provide an accessible grievance mechanism under Consumer Protection and DPDP Act requirements:

| Channel | Detail |
|---------|--------|
| In-app | Report / Help / Contact Us section |
| Email | `grievance@chargemesh.com` |
| Response SLA | Acknowledge within 48 hours; resolve within 15 working days |
| Data grievance | Separate data protection contact or DPO |
| Escalation | Refer unresolved cases to applicable regulatory authority |

---

## 15. App Store Readiness

### Google Play Store (Android)

Before Play Store submission, ensure:

- [ ] Privacy Policy URL (hosted on web, not inside app) is provided in Play Console
- [ ] Data Safety section completed in Play Console (truthfully)
- [ ] App permissions are declared and justified
- [ ] Content rating questionnaire completed
- [ ] Release signed with **production keystore** (not debug keystore — see `SECURITY.md`)
- [ ] App meets Play Store policies for payments, location, and user data
- [ ] Store listing: correct title, description, screenshots, categories

### Apple App Store (iOS)

- [ ] Privacy Nutrition Label completed truthfully in App Store Connect
- [ ] App Review Information provided
- [ ] Apple Sign-In required if other sign-in methods are offered (Apple policy)
- [ ] In-App Purchase compliance if any paid features are added

---

## 16. Pre-Production Legal Checklist

**This checklist must be completed and signed off by legal counsel before any public launch:**

### Entity & Corporate
- [ ] Indian legal entity incorporated
- [ ] PAN / TAN / GST registration obtained
- [ ] Bank account opened
- [ ] IP / trademark filing considered

### Agreements
- [ ] Terms of Service drafted and reviewed (legal counsel)
- [ ] Privacy Policy drafted and reviewed (legal counsel)
- [ ] Refund Policy drafted and reviewed (legal counsel)
- [ ] CPO Master Agreement template reviewed (legal counsel)
- [ ] Payment provider agreement reviewed (legal counsel)
- [ ] All employee / contractor IP assignment agreements signed

### Technical
- [ ] Demo credentials removed from codebase (`AuthContext.tsx`)
- [ ] Production keystore generated and secured
- [ ] AsyncStorage encryption implemented for sensitive data
- [ ] Real OTP / SMS gateway connected
- [ ] Real payment gateway connected and tested
- [ ] Privacy Policy URL implemented in-app and in Play/App Store

### Regulatory
- [ ] DPDP Act compliance assessed with legal counsel
- [ ] RBI PPI assessment completed (if wallet is live)
- [ ] Consumer Protection E-Commerce Rules compliance confirmed
- [ ] Play Store Data Safety section completed truthfully
- [ ] App Store Privacy Nutrition Label completed truthfully

---

## Full Legal Reference

For the complete legal planning framework (all 48 sections), see:  
[`.docs/ChargeMesh_Legal_Documentation.md`](../.docs/ChargeMesh_Legal_Documentation.md)

> That document is the detailed planning source. This file (`LEGAL_PRIVACY.md`) provides the accessible developer-facing summary.
