# Workspace Instructions

## Master Engineering & Development Rules
Refer to [DEVELOPMENT_RULES.md](DEVELOPMENT_RULES.md) for the complete 40-section engineering, security, UI/UX, CPO protocol, testing, and release standard.

## Core Operational Directives
- **Build, Install & Device Verification**: Refer to [.agents/rules/build_and_device_verification.md](.agents/rules/build_and_device_verification.md). For every new app update/build, strictly follow the mandatory flow: **Updated Code ➔ Gradle Sync/Update ➔ Build ➔ ADB Check ➔ Uninstall/Clear App Data ➔ Install New Build ➔ Open App ➔ Test ➔ Fix Issues ➔ Rebuild & Retest**.
- **Onboarding & Login Verification**: Refer to [.agents/rules/onboarding_and_login_verification.md](.agents/rules/onboarding_and_login_verification.md). For every new build on phone: **New Build Installed ➔ Fresh App State ➔ Launch App ➔ Onboarding Screen ➔ Complete/Skip Onboarding ➔ Login/Registration Screen ➔ Test**.
- **Local-First Execution**: Perform all development, implementation, debugging, and verification activities on the local machine.
- **GitHub Interaction**: Do not check or push to GitHub repeatedly. Execute tasks locally, review everything together at the end, and only push final changes to GitHub after review.
- **Pre-Push README Review**: Every GitHub push must include a review of `README.md`. Update `README.md` only when code changes affect setup, features, configuration, usage, architecture, or dependencies.
- **Definition of Done**: Implement + Test + Review + Document + Verify locally before marking any milestone done.
