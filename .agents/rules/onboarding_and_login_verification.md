# Global Rule: Onboarding & Login Verification Process

Whenever a **new app build is installed on the phone**, the following flow must be mandatory on the **first launch**:

1. **Onboarding Screen**
   * The onboarding screen must appear on the first launch of the newly installed build.
   * Verify that all onboarding screens load correctly with proper background artwork and typography.
   * Verify that the **Get Started** and **Skip** buttons work properly.

2. **Login/Registration Screen**
   * After completing or skipping onboarding, the **Login/Registration screen** must be displayed.
   * Verify that the login and registration functionality (Mobile OTP, Email/Password, Google OAuth) works correctly.
   * Verify that the **Skip ➔** button on Login/Registration allows guest exploration without login.

3. **Fresh Installation Requirement**
   * Before testing the first-launch flow, ensure the previous app installation/data has been removed or versioned so that the app behaves like a fresh installation.
   * The onboarding and login flow must **not be skipped automatically** because of data from a previous build.

---

### Mandatory First-Launch Flow

```text
New Build Installed ➔ Fresh App State ➔ Launch App ➔ Onboarding Screen ➔ Complete/Skip Onboarding ➔ Login/Registration Screen ➔ Test
```

This rule must be followed and verified **every time a new build is installed on the phone**.
