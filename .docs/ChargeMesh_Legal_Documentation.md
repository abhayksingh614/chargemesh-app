# ChargeMesh — Legal Documentation Framework

> **Document:** CM-LEGAL-DOC-01 | **Version:** 1.0 | **Date:** August 2026
> **Status:** Planning Framework — Requires Qualified Legal Counsel Review Before Production Use
> **Audience:** Founders, Product, Finance, Operations, Legal Counsel, Investors

---

> [!CAUTION]
> **IMPORTANT LEGAL DISCLAIMER**
>
> This document is a **planning framework only, not legal advice**. Laws, RBI directions, tax rules, EV charging requirements, data-protection implementation dates, and platform policies can change. All final legal documents, regulatory positions, contractual terms, and compliance obligations **must be reviewed and validated by qualified Indian legal counsel** before any production use, commercial agreements, or public launch.
>
> ChargeMesh must obtain professional legal advice covering all areas described in this document before production launch.

---

## Table of Contents

1. [Executive Legal Position](#1-executive-legal-position)
2. [Corporate Structure](#2-corporate-structure)
3. [Founder & Ownership Documents](#3-founder--ownership-documents)
4. [Intellectual Property](#4-intellectual-property)
5. [Trademark & Brand Protection](#5-trademark--brand-protection)
6. [Product Legal Role Definition](#6-product-legal-role-definition)
7. [User Terms of Service — Framework](#7-user-terms-of-service--framework)
8. [Privacy Policy — Framework](#8-privacy-policy--framework)
9. [Refund & Failed Charging Policy — Framework](#9-refund--failed-charging-policy--framework)
10. [Payment Legal Architecture](#10-payment-legal-architecture)
11. [EV Charging Regulatory Framework](#11-ev-charging-regulatory-framework)
12. [Consumer Protection Obligations](#12-consumer-protection-obligations)
13. [Data Protection — DPDP Act 2023](#13-data-protection--dpdp-act-2023)
14. [CPO Master Agreement — Framework](#14-cpo-master-agreement--framework)
15. [CPO Data Licence](#15-cpo-data-licence)
16. [CPO Branding Usage](#16-cpo-branding-usage)
17. [Payment Provider Agreement — Framework](#17-payment-provider-agreement--framework)
18. [Third-Party Services & Vendors](#18-third-party-services--vendors)
19. [Employee & Developer Agreements](#19-employee--developer-agreements)
20. [App Store Legal Readiness](#20-app-store-legal-readiness)
21. [Website Legal Pages Required](#21-website-legal-pages-required)
22. [Location Data Policy](#22-location-data-policy)
23. [Vehicle Compatibility Disclaimers](#23-vehicle-compatibility-disclaimers)
24. [Availability & Status Disclaimer](#24-availability--status-disclaimer)
25. [Physical Charging & Safety Responsibility](#25-physical-charging--safety-responsibility)
26. [Data Retention Policy Framework](#26-data-retention-policy-framework)
27. [Marketing & Advertising Rules](#27-marketing--advertising-rules)
28. [Security Incident & Breach Plan](#28-security-incident--breach-plan)
29. [Liability Allocation](#29-liability-allocation)
30. [Indemnity Topics](#30-indemnity-topics)
31. [Limitation of Liability](#31-limitation-of-liability)
32. [Dispute Resolution](#32-dispute-resolution)
33. [CPO Termination Framework](#33-cpo-termination-framework)
34. [Insurance Requirements](#34-insurance-requirements)
35. [Grievance Redressal](#35-grievance-redressal)
36. [CPO Commercial Terms — Required Clauses](#36-cpo-commercial-terms--required-clauses)
37. [Tariff & Price Transparency](#37-tariff--price-transparency)
38. [Data Ownership Principles](#38-data-ownership-principles)
39. [Fundraising Legal Readiness](#39-fundraising-legal-readiness)
40. [Legal Due Diligence Folder Structure](#40-legal-due-diligence-folder-structure)
41. [Compliance Register](#41-compliance-register)
42. [Critical Legal Decisions Before MVP](#42-critical-legal-decisions-before-mvp)
43. [Recommended MVP Legal Model](#43-recommended-mvp-legal-model)
44. [Legal Document Pack](#44-legal-document-pack)
45. [Launch Legal Gate Checklist](#45-launch-legal-gate-checklist)
46. [Red Flags — Do Not Launch](#46-red-flags--do-not-launch)
47. [Questions for Indian Counsel](#47-questions-for-indian-counsel)
48. [Regulatory References](#48-regulatory-references)

---

## 1. Executive Legal Position

ChargeMesh is intended to provide a unified digital experience for discovering EV charging stations, checking availability, selecting connectors, initiating charging where supported, paying for charging, and maintaining charging history across participating CPO networks.

The legal structure must separate:
1. **ChargeMesh's software/interoperability role**
2. **The CPO's physical charging responsibility**
3. **The payment provider's regulated role**
4. **The user's contractual relationship**

### 1.1 Critical Payment Point

> [!WARNING]
> If ChargeMesh stores customer money and lets users spend that stored value across third-party CPOs, the structure may implicate RBI's Prepaid Payment Instrument (PPI)/payment-system framework. RBI states that entities cannot set up and operate payment systems for PPIs without prior approval/authorisation.

**Recommended MVP:** Use a suitable regulated payment provider and do not launch a true stored-value multi-CPO wallet without a formal legal/regulatory assessment.

### 1.2 Final Legal Architecture

```
USER <-> CHARGEMESH <-> PAYMENT PROVIDER <-> CPO
```

Every handoff should have an explicit contractual and operational responsibility boundary.

---

## 2. Corporate Structure

| Item | Action | Priority |
|------|--------|---------|
| Indian operating entity | Incorporate suitable structure (typically Private Limited for venture-backed startup) | P0 |
| PAN/TAN | Obtain as applicable | P0 |
| GST registration | Assess registration and tax treatment for platform services | P0 |
| Company bank account | Dedicated business banking | P0 |
| Accounting/statutory records | Maintain corporate records | P0 |
| Startup registrations | Assess DPIIT/Startup India eligibility | P1 |
| State registrations | Assess office/employment requirements | P1 |

> [!NOTE]
> All corporate actions require review by a qualified Company Secretary (CS) and tax professional before execution.

---

## 3. Founder & Ownership Documents

Required foundational documents:

- **Founders' Agreement** covering:
  - Shareholding/cap table
  - Founder vesting and transfer restrictions
  - Roles and decision rights
  - IP assignment to the company
  - Confidentiality obligations
  - Founder exit/deadlock provisions
  - Future fundraising/dilution framework
  - Dispute resolution mechanism

---

## 4. Intellectual Property

### 4.1 IP Assets to Protect

- ChargeMesh name, logo, and brand assets
- Mobile apps and backend code
- Admin portal
- API/integration adapters
- Canonical CPO data model
- Availability/status normalization logic
- Vehicle compatibility logic
- Payment/session orchestration
- UI/UX designs
- Documentation and proprietary datasets

### 4.2 IP Protection Actions

- All employees, founders, designers, and development vendors must sign enforceable **confidentiality and IP assignment agreements**
- Open-source software must be tracked with licence obligations (GPL, MIT, Apache, etc.)
- IP must vest in the company entity, not individuals

---

## 5. Trademark & Brand Protection

| Asset | Required Action |
|-------|----------------|
| "ChargeMesh" word mark | Trademark search and filing assessment in India |
| Logo | Trademark / design protection assessment |
| Domains | Secure primary .com, .in, and .app domains |
| App name | Platform naming conflict check (Google Play, Apple App Store) |
| CPO marks | Use only with written contractual permission |

> [!IMPORTANT]
> Trademark filing and clearance must be completed before public launch to avoid disputes with existing registrations.

---

## 6. Product Legal Role Definition

| Role | ChargeMesh Position |
|------|-------------------|
| Technology platform | Yes |
| Station discovery service | Yes |
| Interoperability/orchestration layer | Yes |
| Consumer charging interface | Yes |
| Physical charger operator | No (unless separately contracted) |
| Electricity distributor | No |
| PPI issuer | Not assumed |
| Payment system operator | Not assumed |
| Payment aggregator | Not assumed unless separately structured/authorised |

---

## 7. User Terms of Service — Framework

> [!IMPORTANT]
> The User Terms of Service must be drafted by qualified Indian legal counsel. The following represents the minimum content framework required.

### 7.1 Required Sections

| Section | Content Required |
|---------|----------------|
| Eligibility/account | Age/identity requirements for app use |
| Vehicle information | How vehicle data is used |
| Station discovery | Service description and limitations |
| Availability disclaimer | Explicit statement that availability is sourced from CPOs and not guaranteed |
| Charging initiation | How charging is initiated and ChargeMesh's role |
| Payment authorization | What the user is authorizing when they confirm payment |
| Tariff display | Explanation of pre-charge tariffs and final billing |
| Variable pricing | Disclosure that final amount may differ from estimate |
| Session management | How sessions are managed and recorded |
| Refunds | Refund policy and process |
| Bookings | Terms for reservations where supported |
| User responsibilities | User obligations and prohibited uses |
| Fraud prevention | Anti-fraud terms |
| CPO relationship | Disclosure that ChargeMesh aggregates participating CPO networks |
| Service availability | Uptime/availability disclaimers |
| IP | Intellectual property of ChargeMesh platform |
| Privacy-policy incorporation | Reference to Privacy Policy |
| Grievance mechanism | How users can raise complaints |
| Liability limits | Subject to applicable Indian law |
| Termination | Account termination conditions |
| Dispute resolution | Governing law, jurisdiction, and dispute process |
| Terms updates | How users are notified of changes |

### 7.2 Key Disclaimers to Include

- Availability data is sourced from participating CPOs and may not be real-time
- ChargeMesh does not operate physical charging infrastructure unless separately stated
- Vehicle compatibility information is guidance only
- Final charging costs may differ from pre-charge estimates depending on the session and CPO tariff

---

## 8. Privacy Policy — Framework

> [!IMPORTANT]
> The Privacy Policy must be drafted by qualified Indian legal counsel aligned with the Digital Personal Data Protection Act 2023 and applicable Rules. The following represents the minimum content framework.

### 8.1 Data Categories Collected

- Mobile number / name / email
- Vehicle information (make, model, variant, connector type)
- Charging history (sessions, energy, cost, duration)
- Payment references (not raw credentials)
- Precise and/or approximate location
- Support communications
- Device/app telemetry (crash reports, performance)
- Security/fraud signals

### 8.2 Required Privacy Notice Sections

| Section | Content |
|---------|---------|
| Identity | Legal entity name and contact details |
| Collection | What data is collected and when |
| Purpose | Why each category is collected |
| Payment | Payment provider's role in processing |
| CPO sharing | What data is shared with CPOs for charging |
| Vendors | Hosting, maps, analytics, support platform |
| Retention | Category-based retention periods |
| Rights | Applicable user rights and how to exercise them |
| Security | Safeguards in place |
| Grievance | Privacy contact / Data Protection Officer |

### 8.3 Location Data Principles

- Foreground location for nearby charger discovery
- Manual-location fallback always available
- Permission-aware UX (explain why location is needed)
- Minimize retention of precise location data
- Background location only if a genuine feature requires it

### 8.4 CPO Data Sharing Principles

| Data | Default Approach |
|------|-----------------|
| User ID | Share only if needed for charging authorization |
| Phone/name | Share only if required by CPO for service delivery |
| Vehicle | Share only when needed for compatibility |
| Payment credentials | Never share raw credentials |
| Charging token/reference | Share secure token/reference only |
| Location | Share only as necessary for session |

---

## 9. Refund & Failed Charging Policy — Framework

> [!IMPORTANT]
> The refund policy must be legally reviewed. The following represents the minimum framework.

### 9.1 Refund Scenarios

| Scenario | Required Framework |
|----------|-------------------|
| Payment succeeded, charging failed to start | Automatic reversal/refund path |
| Charging stopped early unexpectedly | Final CDR calculation + adjustment/refund |
| CDR delayed | Pending reconciliation status communicated to user |
| Duplicate payment | Detection + reversal/refund |
| CPO outage preventing charging | Prevent unsupported charging; refund if authorized |
| Wrong final amount | Dispute/reconciliation/refund process |

### 9.2 Refund Policy Requirements

- Clear SLA for refund processing timeline
- User must be informed of refund initiation and completion
- Refund reference numbers must be provided
- Manual review process for exceptions
- Contractual alignment with payment provider on refund handling

---

## 10. Payment Legal Architecture

### 10.1 Payment Layer Ownership

| Layer | Preferred Owner |
|-------|----------------|
| Payment UI/orchestration | ChargeMesh |
| Payment processing | Regulated payment provider |
| Card/UPI credentials | Provider / tokenized mechanism |
| Stored-value PPI | Authorised PPI issuer only if used |
| Merchant/settlement | Explicit contract with defined merchant of record |
| Refund processing | Defined merchant/payment party |

### 10.2 RBI PPI Framework

> [!WARNING]
> RBI's PPI framework covers stored-value instruments. Entities cannot operate payment systems for PPIs without approval/authorisation. Semi-closed PPIs operate at identified merchant locations with an acceptance arrangement.
>
> ChargeMesh must NOT launch a stored-value wallet that can be used across multiple CPOs without a formal legal/regulatory assessment and, if required, appropriate authorization or partnership with a licensed PPI issuer.

### 10.3 Commercial Payment Questions (Must Be Resolved Contractually)

- Who is merchant of record?
- Who issues the tax invoice?
- Who receives customer payment?
- Who settles with the CPO?
- Who handles refunds?
- Who bears payment processing fees?
- Who bears chargebacks?
- What happens when a session starts but CDR is delayed?
- What happens when CPO tariff and final CDR differ?

---

## 11. EV Charging Regulatory Framework

### 11.1 Ministry of Power Guidelines 2024

The Ministry of Power's Guidelines for Installation and Operation of Electric Vehicle Charging Infrastructure-2024 apply to **manufacturers, owners, and operators** of EV charging infrastructure across private, semi-restricted, public, and highway/expressway settings.

**ChargeMesh's Position:**
- ChargeMesh must contractually identify whether it is only a software/interoperability platform or also an infrastructure owner/operator
- If ChargeMesh later operates stations, it must reassess regulatory, safety, and licensing requirements
- These guidelines primarily apply to the CPO partners, not to ChargeMesh as a software platform

### 11.2 Physical Safety

| Responsibility | Party |
|---------------|-------|
| Hardware/site safety | CPO/site operator (where contracted) |
| Station emergency/support information | CPO (surfaced through ChargeMesh UI) |
| User safety instructions | ChargeMesh (general guidance) |
| No unsafe electrical guidance | ChargeMesh must not provide unsafe electrical instructions |
| Incident reporting and ownership | Defined contractually between ChargeMesh and CPO |

---

## 12. Consumer Protection Obligations

### 12.1 Consumer Protection (E-Commerce) Rules 2020

The Consumer Protection (E-Commerce) Rules 2020 apply to services bought/sold over digital or electronic networks and cover e-commerce entities.

### 12.2 Required Compliance

- Accurate service descriptions (no false claims about charger availability or ownership)
- Transparent pricing (show all applicable charges before authorization)
- Grievance mechanism (must be accessible in-app and via web)
- No misleading availability claims
- No deceptive advertising
- Clear refund/cancellation policy
- Complaint/reference tracking system
- Required business disclosures
- No representation that ChargeMesh owns third-party CPO infrastructure

---

## 13. Data Protection — DPDP Act 2023

### 13.1 Overview

The Digital Personal Data Protection Act 2023 provides a framework for processing digital personal data and recognises individual data-protection rights and lawful processing. Its provisions come into force on dates notified by the Central Government.

> [!IMPORTANT]
> Launch compliance must be checked against the then-current implementation position of the DPDP Act and associated Rules (Digital Personal Data Protection Rules 2025, notified November 2025). ChargeMesh's legal counsel must confirm applicable requirements at the time of production launch.

### 13.2 Key DPDP Obligations to Plan For

- **Consent/Notice:** Obtain consent or establish lawful basis for processing personal data
- **Purpose Limitation:** Collect only data necessary for the stated purpose
- **Data Principal Rights:** Support rights including access, correction, and erasure where applicable
- **Retention Limits:** Define and enforce retention periods by data category
- **Security:** Implement appropriate technical and organizational security measures
- **Significant Data Fiduciaries:** Assess whether ChargeMesh qualifies under applicable thresholds
- **Data Protection Officer:** Assess DPO appointment requirements
- **Grievance:** Maintain a data grievance mechanism

### 13.3 DPDP Compliance Workstream

| Workstream | Owner | Priority |
|-----------|-------|---------|
| Data mapping (what data, why, where) | Legal/Product | P0 |
| Privacy notice drafting | Legal | P0 |
| Consent mechanism design | Legal/Product | P0 |
| Retention policy | Legal/Product | P0 |
| User rights process | Legal/Engineering | P0 |
| Security assessment | CTO/Security | P0 |
| DPO assessment | Legal | P1 |
| Third-party data processor agreements | Legal | P0 |

---

## 14. CPO Master Agreement — Framework

> [!IMPORTANT]
> The CPO Master Agreement must be drafted and reviewed by qualified Indian legal counsel. The following represents the minimum required clauses.

### 14.1 Required Agreement Clauses

| Clause Area | Content |
|------------|---------|
| Parties/authority | Legal entities and authorized signatories |
| Scope and territory | Geographic scope and service scope |
| Station coverage | Which stations are included and conditions |
| OCPI/proprietary API | Technical protocol and version obligations |
| Data quality and freshness | Required data standards and SLAs |
| Tariffs | Tariff accuracy responsibility and update process |
| Remote start/stop | Conditions for remote control features |
| Sessions/CDRs | Session and CDR exchange obligations |
| Authorization | How ChargeMesh users are authorized at CPO |
| Payment/settlement | Who collects, who settles, what the process is |
| Refunds/chargebacks | Who handles and who bears cost |
| Taxes/invoicing | GST treatment, invoice issuance responsibility |
| Consumer support | Support escalation matrix |
| SLA/incidents | Uptime, response times, incident severity |
| Security/privacy | Data protection and security obligations |
| IP/trademarks | Brand usage rights and restrictions |
| Audit | Audit rights for reconciliation and compliance |
| Change management | API change notice and approval process |
| Business continuity | Disaster recovery obligations |
| Liability/indemnity | Liability cap and indemnity for each party |
| Insurance | Required insurance coverage |
| Termination | Notice periods and conditions |
| Data return/deletion | Post-termination data handling |
| Dispute resolution | Governing law, jurisdiction, arbitration |

---

## 15. CPO Data Licence

| Data Category | Contractual Permission Required |
|--------------|--------------------------------|
| Station identity/address | Display/search in ChargeMesh |
| Coordinates | Map/navigation display |
| EVSE/connectors | Compatibility/availability display |
| Status | Consumer availability display |
| Tariff | Pre-charge price display |
| CPO logo/name | Only under brand permission |
| Session/CDR | Operations/reconciliation |
| Aggregated analytics | Only if contract explicitly permits |

---

## 16. CPO Branding Usage

| Requirement | Detail |
|-------------|--------|
| Approved logo files | Use only CPO-supplied, approved logo files |
| Placement rules | Follow CPO brand guidelines |
| Trademark usage guide | Respect CPO trademark requirements |
| Prohibited representations | No claims of ownership, endorsement beyond what is agreed |
| App-store/marketing usage | Obtain explicit written permission |
| Removal after termination | Remove all CPO branding within agreed timeframe after termination |

---

## 17. Payment Provider Agreement — Framework

> [!IMPORTANT]
> The Payment Provider Agreement must be reviewed by qualified Indian legal counsel including for GST/tax implications and RBI compliance.

### 17.1 Required Agreement Areas

- Processing scope and supported payment methods
- Merchant onboarding requirements
- Settlement terms and timeline
- Refund processing and timeline
- Chargeback handling and responsibility
- Failed transaction handling
- Fraud controls and monitoring
- Data/security requirements
- Card/payment tokenization
- Reconciliation process and tools
- Reporting access
- Business continuity
- Termination and transition

---

## 18. Third-Party Services & Vendors

### 18.1 Key Vendor Categories

| Vendor Category | Legal Requirement |
|----------------|------------------|
| Cloud infrastructure | Data processing agreement, security, SLA |
| Maps/geospatial | Usage rights, data licence |
| OTP/SMS | Data processing, retention |
| Email service | Data processing |
| Payment provider | Full regulated agreement (see Section 17) |
| Analytics/crash reporting | Privacy compliance, data minimization |
| Support platform | Customer data protection |
| Security testing | Confidentiality, scope of work |
| Development/design agencies | IP assignment, confidentiality |
| Accounting/tax | Professional services agreement |
| Legal counsel | Engagement letter |

### 18.2 Vendor Agreement Requirements

Material vendors should have:
- Confidentiality / NDA
- Security obligations
- Data processing agreement (especially for personal data)
- IP/work-product ownership
- SLA
- Termination and data return/deletion

---

## 19. Employee & Developer Agreements

All individuals with access to ChargeMesh systems, data, or IP must have signed agreements covering:

- Employment / consulting terms
- Confidentiality obligations
- **IP assignment** to the company (all work created during engagement)
- Security obligations
- Acceptable use policy
- Access control obligations
- Return of property on exit
- Exit/deprovisioning process
- Conflict of interest disclosure
- Open-source disclosure requirements

---

## 20. App Store Legal Readiness

| Item | Required |
|------|---------|
| Privacy policy URL (live) | Yes |
| Terms of Service URL (live) | Yes |
| Support URL/contact | Yes |
| Account deletion flow | Where required by platform/app model |
| Data disclosure / privacy labels | Yes |
| Payment disclosures | Yes |
| Location permission explanation | Yes |
| Third-party CPO disclosure | Yes |
| Age rating | Assess based on content |

---

## 21. Website Legal Pages Required

The ChargeMesh website must have:

- Terms of Service
- Privacy Policy
- Refund/Cancellation Policy
- Contact/Support page
- Grievance/Complaints page
- Partner/CPO information
- Legal notices
- Security/vulnerability disclosure contact where appropriate

---

## 22. Location Data Policy

| Requirement | Implementation |
|-------------|---------------|
| Foreground location for nearby charger discovery | Standard location permission |
| Manual-location fallback | Always available without granting location |
| Permission-aware UX | Explain purpose before requesting |
| Clear explanation of use | In-app and in Privacy Policy |
| Minimize retention | Do not store precise location longer than necessary |
| Background location | Only if a genuine product feature requires it, with explicit disclosure |

---

## 23. Vehicle Compatibility Disclaimers

Compatibility information must be presented as **guidance based on vehicle and connector data**. It is not a technical guarantee.

**Required disclosures:**
- Vehicle compatibility is based on the vehicle profile and connector data stored by ChargeMesh
- Unknown or unverified compatibility must not be represented as guaranteed
- Users should verify physical connector compatibility before committing to a session

---

## 24. Availability & Status Disclaimer

> [!IMPORTANT]
> ChargeMesh must never present stale or unknown charger data as guaranteed availability.

**Suggested required disclosure in Terms of Service and app UI:**

> "Availability information is sourced from participating charging operators and may change before or during your journey. ChargeMesh does not guarantee that a connector will remain available until you arrive."

---

## 25. Physical Charging & Safety Responsibility

Unless ChargeMesh separately operates infrastructure, the CPO/site operator should remain responsible for:

- Hardware operation and maintenance
- Electrical infrastructure
- Site access and physical safety
- Compliance with electricity/charging regulations
- User physical safety at the charging station

This allocation must be **explicit in CPO contracts** and reflected in user-facing terms.

---

## 26. Data Retention Policy Framework

| Data Category | Retention Approach |
|--------------|-------------------|
| User account | Active period + legally required post-closure |
| Payment references | Payment/tax/legal requirements (typically 7 years for financial records) |
| Charging history | Service/legal requirements |
| CDR records | Contractual + financial/legal |
| Support tickets | Defined legal/support period |
| API/system logs | Risk-based (90 days to 1 year typical) |
| Location telemetry | Minimize — do not retain longer than necessary |
| Security logs | Risk/legal-based (typically 1-3 years) |

---

## 27. Marketing & Advertising Rules

Based on Consumer Protection (E-Commerce) Rules 2020 and general consumer protection law:

| Prohibited | Required |
|-----------|---------|
| Do NOT claim all chargers are live | Keep evidence for performance claims |
| Do NOT claim universal CPO compatibility without evidence | Disclose limitations |
| Do NOT hide unavoidable fees | Show all charges transparently |
| Do NOT use CPO trademarks without permission | Obtain written authorization |
| Do NOT claim ownership of CPO stations | Clearly identify ChargeMesh as a platform |
| Do NOT use misleading availability statistics | Use accurate, verifiable statistics |

---

## 28. Security Incident & Breach Plan

The security incident response plan must include:

1. Detect and classify the incident
2. Contain the incident
3. Preserve evidence
4. Identify affected data and systems
5. Assess CPO, payment provider, and vendor impact
6. Assess legal notification requirements (DPDP, payment provider, CPOs)
7. Coordinate with partners and affected vendors
8. Communicate to affected users where required
9. Remediate root cause
10. Document and report internally

---

## 29. Liability Allocation

| Event | Starting Contractual Allocation |
|-------|--------------------------------|
| Hardware failure | CPO |
| Physical/electrical site issue | CPO/site operator |
| Incorrect CPO status/tariff feed | CPO |
| ChargeMesh software outage | ChargeMesh |
| ChargeMesh normalization error | ChargeMesh |
| Payment provider outage | Payment provider (subject to contract) |
| User misuse | User (subject to applicable law) |

---

## 30. Indemnity Topics

CPO agreements and user terms should address indemnity for:

- IP infringement
- Data/privacy breach
- Regulatory breach
- Fraud
- Third-party claims
- Physical infrastructure incidents
- Misrepresentation
- Confidentiality breach

---

## 31. Limitation of Liability

ChargeMesh agreements should include appropriate:

- Liability cap (typically linked to fees paid or a fixed amount)
- Excluded losses (consequential, indirect, loss of revenue/profit)
- Carve-outs for: data/security breaches, IP indemnity, payment losses
- Physical injury/property damage treatment
- Fraud/wilful misconduct (not excluded)
- Regulatory penalties where legally permissible

> [!NOTE]
> Liability caps and exclusions under Indian law must be reviewed by qualified Indian legal counsel.

---

## 32. Dispute Resolution

| Topic | Requirement |
|-------|-----------|
| Governing law | Specified (India) |
| Courts | Specified jurisdiction |
| Arbitration | Assess for commercial agreements |
| Seat/venue | Specified |
| Interim relief | Where required |
| Escalation before arbitration | Recommended escalation/mediation step |

---

## 33. CPO Termination Framework

Upon CPO agreement termination, the following must be addressed:

1. Required notice period served
2. Emergency termination conditions defined
3. Stop new charging sessions for departing CPO
4. Complete active sessions safely
5. CDR reconciliation completed
6. Final settlement completed
7. All refunds processed
8. Station delisted from ChargeMesh discovery
9. All CPO data returned or deleted per agreement
10. All CPO brand assets removed from app and marketing
11. CPO credentials revoked and deleted

---

## 34. Insurance Requirements

ChargeMesh should assess and obtain appropriate insurance coverage:

| Insurance Type | Purpose |
|----------------|---------|
| Cyber liability | Data breach and cyber incident costs |
| Technology E&O / Professional indemnity | Errors and omissions in technology services |
| Commercial general liability | General liability coverage |
| Directors & Officers (D&O) | Protection for founders/directors |
| Crime/fraud | Financial fraud coverage |
| Physical infrastructure liability | If ChargeMesh ever operates stations |

---

## 35. Grievance Redressal

| Requirement | ChargeMesh Plan |
|-------------|----------------|
| Support channel | In-app + web/email |
| Ticket system | Unique reference number per complaint |
| Tracking | User-visible ticket status where feasible |
| Escalation | ChargeMesh -> CPO/payment partner |
| SLA | Category-based response targets |
| Records | Retain as legally required |
| Grievance Officer | Designated officer per applicable requirement |

---

## 36. CPO Commercial Terms — Required Clauses

Complete list of commercial clause areas required in CPO agreements:

Scope of services | Territory | Integration protocol | Supported modules | Station coverage | Tariff responsibility | Authorization responsibility | Transaction ownership | Settlement terms | Fees/revenue share | Refunds/chargebacks | Taxes/invoicing | Data ownership | Privacy | Security | SLA | Support | Incident management | Audit rights | Liability | Indemnity | IP | Confidentiality | Termination | Data deletion/return | Transition assistance

---

## 37. Tariff & Price Transparency

The following pricing elements must be disclosed where applicable:

| Element | Disclosure Requirement |
|---------|----------------------|
| INR/kWh | Where energy-based billing applies |
| Time-based fees | Where time-based billing applies |
| Flat/session fees | Where flat fees apply |
| Idle/parking fees | Where applicable |
| Taxes/mandatory charges | GST and other applicable charges |
| Minimum charge | If applicable |
| Reservation fee | If reservations are supported |
| Estimated vs. final amount | Clearly distinguish when final amount differs from estimate |

**Rule:** Never fabricate a tariff when the authoritative CPO source is unknown.

---

## 38. Data Ownership Principles

| Data | Recommended Principle |
|------|----------------------|
| CPO infrastructure data | CPO remains owner/source |
| ChargeMesh normalized catalog | ChargeMesh operational representation |
| Consumer profile | User-controlled subject to applicable law |
| Charging session | Joint operational/transaction record subject to contract |
| CDR | CPO authoritative source for CPO-generated CDR |
| Payment record | Payment provider + contractual parties |
| Analytics | Use according to contract/privacy notice |

---

## 39. Fundraising Legal Readiness

Before investor due diligence, ensure:

- Clean cap table with accurate share register
- Founder IP assignments to company completed
- Employee/contractor IP assignments completed
- Material CPO/payment contracts in place or in progress
- Privacy policy and terms live
- Security policies documented
- Corporate filings current
- Tax/GST records maintained
- Liabilities/disputes disclosed
- Open-source compliance documented

---

## 40. Legal Due Diligence Folder Structure

| Folder | Contents |
|--------|---------|
| Corporate | Incorporation documents, charter, filings |
| Founders | Agreements, cap table, share records |
| IP | Trademark search/filings, IP assignments, OSS compliance |
| Product | Terms, privacy, refund policies |
| CPO | Executed commercial agreements |
| Payments | Provider contracts |
| Data | Privacy policies, data-processing agreements |
| Security | Security policies, audit reports, penetration test results |
| Tax | GST registration, accounting records |
| Employment | Employment/contractor agreements |
| Insurance | Active insurance policies |
| Disputes | Claims/notices received |

---

## 41. Compliance Register

| Area | Owner | Priority | Evidence Required |
|------|-------|---------|-------------------|
| Corporate incorporation | Founder/CS | P0 | Corporate records |
| Tax/GST | Finance/CA | P0 | Registrations/returns |
| Trademark | Legal | P1 | Search/filing evidence |
| CPO contracts | Legal/BD | P0 | Signed agreements |
| Payment structure | Legal/Finance | P0 | Counsel review + provider contract |
| Privacy/DPDP | Legal/Product | P0 | Data map + policy |
| Consumer protection | Legal/Product | P0 | Terms/grievance mechanism |
| Security | CTO/Security | P0 | Security policies/tests |
| EV charging role | Legal/CPO | P0 | Role assessment document |
| App stores | Product/Legal | P1 | App store submission checklist |

---

## 42. Critical Legal Decisions Before MVP

| Decision | Why It Matters |
|----------|---------------|
| Will ChargeMesh hold stored value? | Triggers payment regulation |
| Who is merchant of record? | Determines invoicing/refund/liability structure |
| Who contracts with the user for charging? | Defines the consumer relationship |
| Who issues the invoice to the user? | Tax clarity and GST compliance |
| Who settles with the CPO? | Commercial/payment architecture |
| What CPO data can be used and how? | Data/IP rights from CPO |
| How is unknown status handled legally? | Consumer trust and liability protection |
| What is the failed-start refund process? | Customer protection obligation |
| Is ChargeMesh a physical infrastructure operator? | Regulatory/safety scope |

---

## 43. Recommended MVP Legal Model

```
CHARGEMESH SOFTWARE + CPO SERVICE AGREEMENTS + REGULATED PAYMENT PROVIDER + USER TERMS + PRIVACY FRAMEWORK
```

**MVP legal model principles:**
- ChargeMesh does not operate physical infrastructure at MVP
- No independent stored-value PPI unless properly authorised/structured
- Payment processing through suitable regulated payment provider
- CPO responsible for its infrastructure and source data
- ChargeMesh provides discovery/orchestration services
- User terms disclose participating CPO role
- Standard CPO master agreement + technical schedule
- DPDP-compliant privacy framework

---

## 44. Legal Document Pack

| Document | Priority | Status |
|----------|---------|--------|
| Corporate incorporation file | P0 | Required |
| Founders' Agreement | P0 | Required |
| IP Assignment Agreements (founders, employees, contractors) | P0 | Required |
| CPO Master Agreement template | P0 | Required |
| CPO Technical Schedule | P0 | Required |
| Payment Provider Agreement | P0 | Required |
| User Terms of Service | P0 | Required |
| Privacy Policy | P0 | Required |
| Refund/Cancellation Policy | P0 | Required |
| Grievance Policy | P0 | Required |
| Vendor Agreements (cloud, maps, analytics, etc.) | P0/P1 | Required |
| Employee/Contractor Agreements | P0 | Required |
| Trademark clearance/filing | P1 | Required |
| Security policy | P0 | Required |
| Data retention policy | P0 | Required |
| Incident response policy | P0 | Required |
| Insurance policies | P1 | Required |

> [!CAUTION]
> All documents in this list marked P0 must be completed and reviewed by qualified legal counsel BEFORE the production launch or any commercial charging sessions.

---

## 45. Launch Legal Gate Checklist

Before production launch, confirm:

- [ ] Entity verified and active
- [ ] Founder/developer IP verified and assigned to company
- [ ] Trademark search completed
- [ ] Payment model reviewed by legal counsel
- [ ] Payment provider contracted
- [ ] Pilot CPO agreements signed
- [ ] User Terms / Privacy Policy / Refund Policy approved and live
- [ ] Grievance process live and functional
- [ ] Data map complete
- [ ] Vendor contracts reviewed
- [ ] Security controls reviewed and tested
- [ ] EV charging regulatory role assessed
- [ ] Tax/GST treatment reviewed
- [ ] App-store disclosures ready
- [ ] Incident response plan ready
- [ ] Insurance reviewed
- [ ] DPDP compliance assessed

---

## 46. Red Flags — Do Not Launch

> [!CAUTION]
> Do NOT launch production charging if any of the following conditions exist:

- Holding third-party customer funds without a proper legal/payment structure
- Using CPO data without contractual permission
- No clear merchant/settlement responsibility defined
- Stale or unknown charger status shown as guaranteed availability
- No failed-payment/failed-charge refund path
- Storing unnecessary raw payment credentials
- No privacy notice or data governance framework
- No grievance mechanism
- Unclear physical liability allocation
- Unclear IP ownership
- Using CPO APIs without contractual authorization
- User Terms not approved by qualified legal counsel
- DPDP compliance not assessed

---

## 47. Questions for Indian Counsel

Before production, the following must be answered by qualified Indian legal counsel:

1. Is the proposed payment flow regulated payment activity? Does it trigger PPI/payment-system authorization?
2. Can ChargeMesh hold stored value, or should an authorised PPI/payment partner hold it?
3. Who should be merchant of record, and what are the GST/invoicing implications?
4. What GST/tax treatment applies to ChargeMesh's platform fee and to the charging transaction?
5. How should CPO/ChargeMesh/payment provider liability be allocated?
6. What DPDP Act and Rules compliance is required at launch, given the current implementation timeline?
7. Are state/local EV charging obligations triggered by ChargeMesh's role?
8. What consumer disclosures are required under Consumer Protection (E-Commerce) Rules 2020?
9. What changes legally if ChargeMesh operates charging stations later?
10. What insurance limits are appropriate for the business at launch and scale?
11. What are the trademark filing priority and costs?
12. What company structure best serves the fundraising and regulatory objectives?

---

## 48. Regulatory References

| Regulation | Description |
|-----------|-------------|
| Ministry of Power — Guidelines for Installation and Operation of Electric Vehicle Charging Infrastructure-2024 | Applies to manufacturers, owners, and operators of EV charging infrastructure in India |
| Reserve Bank of India — Master Directions on Prepaid Payment Instruments | Regulates PPI issuers and payment system operators |
| Digital Personal Data Protection Act 2023 | Framework for processing digital personal data in India |
| Digital Personal Data Protection Rules 2025 | Implementation rules under DPDP Act, notified November 2025 |
| Consumer Protection (E-Commerce) Rules 2020 | Applies to services provided over digital/electronic networks |
| OCPI 2.3.0 — EVRoaming Foundation | Open Charge Point Interface protocol for CPO/eMSP communication |
| Information Technology Act 2000 (as amended) | Applicable IT law framework |
| GST legislation | Applicable to platform service fees and charging transactions |

---

*Document prepared from ChargeMesh Legal, Compliance & Contracts Framework CM-DOC-06 v3.0 and related concept documents, August 2026.*

*This document is a planning framework only. All legal documents, regulatory positions, and compliance obligations must be reviewed and validated by qualified Indian legal counsel before any production use or commercial launch.*
