# Official Eligibility Assessment: OpenAI Codex for Open Source Program

**Audit Date:** November 21, 2026  
**Project:** ChargeMesh (Open EV Roaming & Charging Infrastructure Platform)  
**Program:** [OpenAI Codex for Open Source Program](https://developers.openai.com/community/codex-for-oss)  
**Official Application Portal:** [https://openai.com/form/codex-for-oss/](https://openai.com/form/codex-for-oss/)  
**Evaluation Standard:** Objective, Evidence-Based Assessment (No manufactured metrics)  

---

## 1. Program Background & Purpose

The **OpenAI Codex for Open Source** program is designed to empower primary and core maintainers of active open-source software with advanced reasoning and coding tools (including ChatGPT Pro with Codex and the Codex Open Source Fund API credits). The program seeks to alleviate the operational and technical burdens of open-source stewardship—including automated PR reviews, bug detection, vulnerability triage, test generation, and documentation maintenance.

Applications are submitted via `https://openai.com/form/codex-for-oss/` and evaluated on rolling cycles against published criteria:
1. Genuine open-source licensing.
2. Public repository accessibility.
3. Verifiable primary or core maintainer leadership.
4. Active maintenance and software quality.
5. Ecosystem utility and value to the community.
6. Clear, credible strategy for utilizing Codex and API credits for project maintenance.

---

## 2. Official Eligibility Checklist

| Program Criterion | Status | Evidence Available in Repository | Missing External Requirements | Recommended Action |
| :--- | :---: | :--- | :--- | :--- |
| **1. Genuine Open Source License** | **ELIGIBLE** | Repository contains an official OSI-approved [LICENSE](file:///c:/Users/aksde/Videos/My_Codex/Chargemesh_app/LICENSE) under the Apache License 2.0. | None. Standard terms verified. | Maintain Apache-2.0 attribution in all source files. |
| **2. Public Repository Visibility** | **PARTIALLY ELIGIBLE** | Local codebase is fully structured and prepared for public visibility. Origin remote is configured as `https://github.com/abhayksingh614/chargemesh-app.git`. | Requires confirmation that the remote GitHub repository visibility is set to **Public** in GitHub repository settings. | Ensure repository visibility is toggled to Public prior to submitting application. |
| **3. Demonstrable Maintainer Role** | **ELIGIBLE** | Git commit logs demonstrate primary maintainer authorship across all 8 repository milestones (`5e55bf8` to `dacd5c9`). Maintainer is identified in [README.md](file:///c:/Users/aksde/Videos/My_Codex/Chargemesh_app/README.md) and [SECURITY.md](file:///c:/Users/aksde/Videos/My_Codex/Chargemesh_app/SECURITY.md). | None. Verifiable through Git author signatures. | Select **Primary maintainer** on official application form. |
| **4. Active Maintenance Evidence** | **ELIGIBLE** | Active commit cadence (November 2026 commits, Phase 05.1 release hardening), detailed [CHANGELOG.md](file:///c:/Users/aksde/Videos/My_Codex/Chargemesh_app/CHANGELOG.md), and complete [MAINTENANCE_ROADMAP.md](MAINTENANCE_ROADMAP.md). | None. Codebase actively maintained locally. | Push latest release tags (`v0.5.1-alpha`) to GitHub remote. |
| **5. Ecosystem Importance & Value** | **ELIGIBLE** | Solves critical infrastructure fragmentation in India's electric mobility sector by implementing open EV roaming standards (OCPP 1.6-J / 2.0.1, PostGIS spatial search, double-entry wallet ledger). | Ecosystem adoption is early-stage (alpha release). External downloads and star counts are not yet mature. | Highlight domain impact and architectural maturity in application statement. |
| **6. Issue & PR Management Workflows** | **ELIGIBLE** | Configured [`.github/ISSUE_TEMPLATE/`](file:///c:/Users/aksde/Videos/My_Codex/Chargemesh_app/.github/ISSUE_TEMPLATE/) (bug report, feature request, documentation issue), [`.github/pull_request_template.md`](file:///c:/Users/aksde/Videos/My_Codex/Chargemesh_app/.github/pull_request_template.md), and [`.github/dependabot.yml`](file:///c:/Users/aksde/Videos/My_Codex/Chargemesh_app/.github/dependabot.yml). | None. Template configurations active. | Maintain template enforcement on GitHub PRs. |
| **7. CI/CD & Build Automation** | **ELIGIBLE** | 4 functional GitHub Actions workflows in [`.github/workflows/`](file:///c:/Users/aksde/Videos/My_Codex/Chargemesh_app/.github/workflows/) covering monorepo typecheck, backend testing, admin validation, mobile testing, and secret scanning. | Workflows need remote GitHub Actions runner execution upon push. | Ensure GitHub Actions are enabled in repo settings. |
| **8. Secret & Privacy Protection** | **ELIGIBLE** | Comprehensive secret audit confirmed zero committed production keys. Fail-closed validators implemented in code. Personal emails sanitized. | None. Passed zero-trust secret audit. | Run pre-push git secret scanner. |

---

## 3. Detailed Assessment of Key Factors

### 3.1 Licensing Assessment
- **Status:** Fully Compliant.
- **License Type:** Apache License 2.0 (OSI-approved, permissive, commercially friendly).
- **Verification:** The root file [LICENSE](file:///c:/Users/aksde/Videos/My_Codex/Chargemesh_app/LICENSE) contains standard Apache-2.0 terms with proper copyright notice. It allows community distribution, modification, private use, and patent grant.

### 3.2 Maintainer Verifiability
- **Status:** Verifiable Primary Maintainer.
- **Evidence:**
  - Git history shows continuous single-origin ownership and maintainer commits.
  - Project governance and security policies explicitly name the maintainer as the escalation point.
  - [SECURITY.md](file:///c:/Users/aksde/Videos/My_Codex/Chargemesh_app/SECURITY.md) lists the official maintainer security desk.

### 3.3 Ecosystem Importance vs. Current Adoption
- **Objective Reality:**
  - ChargeMesh is currently at release stage `v0.5.1-alpha`.
  - While it has extensive code maturity (115 tests, 5 workspaces, PostgreSQL + PostGIS, OCPP 1.6/2.0.1, React Native mobile, Next.js admin), it is an emerging open-source platform without thousands of GitHub stars or millions of npm downloads.
- **Program Alignment:**
  - OpenAI evaluates both high-volume projects and critical ecosystem infrastructure projects.
  - ChargeMesh addresses clean energy infrastructure, EV charging interoperability, and open protocols in the world's most populous nation, making its mission highly aligned with societal and open-source impact.

---

## 4. Gaps & Mandatory Actions Prior to Submission

To ensure the application is evaluated positively without administrative rejection:

1. **Remote Repository Public Visibility:**
   Confirm that the GitHub repository (`https://github.com/abhayksingh614/chargemesh-app`) is set to **Public** (not Private).
2. **Push Local Commits and Tags:**
   Review and push local commits and tags (`v0.5.1-alpha`) to the remote `prod` and `beta` branches.
3. **Supply Personal Account Details:**
   The form requires:
   - Your exact GitHub handle (`abhayksingh614`)
   - The verified ChatGPT email associated with your OpenAI account
   - Your OpenAI Organization ID (available in your OpenAI Platform account settings).
