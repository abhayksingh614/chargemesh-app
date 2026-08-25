# ChargeMesh — Build, Install & Device Testing Guide

> **Updated:** 2026-08-24 | **Platform:** Android (primary) + iOS (secondary)

This guide covers the complete local development workflow: building the app, installing it on a device, and verifying it works correctly.

> ⚠️ **Mandatory flow for every update:**
> **Updated Code → Gradle Sync → Build → ADB Check → Uninstall/Clear App Data → Install New Build → Open App → Test → Fix Issues → Rebuild & Retest**

---

## 1. Prerequisites

### System Requirements
- **OS:** Windows 10/11 (primary), macOS, or Linux
- **Node.js:** >= 20.x
- **npm:** >= 10.x (or pnpm >= 9.x)
- **Java:** JDK 17+ (for Android builds)
- **Android Studio:** Latest stable
  - Android SDK Platform 34
  - Android Build Tools 34.x
  - NDK (installed via SDK Manager)
- **ADB (Android Debug Bridge):** Available via Android Studio or standalone

### For iOS (macOS only)
- **Xcode:** Latest stable
- **CocoaPods:** >= 1.14

---

## 2. Repository Setup

```bash
# Clone the repository
git clone https://github.com/abhayksingh614/chargemesh-app.git
cd chargemesh-app

# Install all dependencies (workspace-wide)
npm install
```

---

## 3. Environment Setup

```bash
# Mobile app environment
cp apps/mobile/.env.example apps/mobile/.env
```

Edit `apps/mobile/.env` with your local config values.

> **Never commit `.env` files.** They are excluded via `.gitignore`.

---

## 4. Android Build

### 4a. Start Metro Bundler
```bash
# From project root
npm run start --workspace=apps/mobile

# Or directly
cd apps/mobile
npx react-native start --reset-cache
```

### 4b. Build & Install (Debug APK — Recommended for Development)
```bash
cd apps/mobile
npx react-native run-android
```
This will:
1. Build the debug APK
2. Install it on the connected ADB device
3. Start Metro bundler

### 4c. Build Release APK (for Testing Production Behaviour)
```bash
cd apps/mobile/android
./gradlew assembleRelease
```

Output: `apps/mobile/android/app/build/outputs/apk/release/app-release.apk`

> ⚠️ **IMPORTANT:** The release build currently uses the **debug keystore**. This is **NOT suitable for Play Store submission**. See [`SECURITY.md`](SECURITY.md) for production keystore setup.

---

## 5. iOS Build (macOS only)

```bash
cd apps/mobile
npx pod-install          # Install CocoaPods dependencies
npx react-native run-ios
```

---

## 6. ADB Device Verification

Before installing a new build, always verify the device is connected:

```bash
# List connected devices
adb devices
```

Expected output:
```
List of devices attached
XXXXXXXX    device
```

If no device is listed:
- Enable **USB Debugging** on your Android device (Settings → Developer Options)
- Try a different USB cable/port
- Run `adb kill-server && adb start-server`

---

## 7. Fresh Install (Clean State Testing)

For every new build, **always test from a fresh app state**:

```bash
# Uninstall existing app
adb uninstall com.chargemesh.mobile

# Install new APK
adb install apps/mobile/android/app/build/outputs/apk/debug/app-debug.apk

# Launch app
adb shell am start -n com.chargemesh.mobile/.MainActivity
```

Or for a release APK:
```bash
adb install apps/mobile/android/app/build/outputs/apk/release/app-release.apk
```

---

## 8. Onboarding & Login Verification Checklist

For every new build installed on device, run through:

```
New Build Installed
    ↓
Launch App → Splash Screen appears
    ↓
Onboarding Screen (first launch) → Can Skip or Complete
    ↓
Login Screen appears
    ↓
DEV: Use demo phone + OTP 123456
    ↓
Home Screen loads with station cards
    ↓
Test navigation across all 5 tabs
    ↓
Test dark/light mode toggle
    ↓
Test language toggle (English ↔ Hindi)
```

---

## 9. Dev-Only Test Credentials

> ⚠️ **DEV/TEST ONLY — Remove before production release**

| Field | Value |
|-------|-------|
| Demo phone numbers | See `AuthContext.tsx` (labelled `DEV_DEMO_PHONES`) |
| Demo OTP | `123456` |
| Google Sign-In | Mock (returns test user in dev) |

---

## 10. Gradle Sync

If you encounter build issues after pulling new code or changing `build.gradle`:

1. Open `apps/mobile/android/` in Android Studio
2. Click **Sync Project with Gradle Files** (elephant icon or File → Sync)
3. Wait for sync to complete
4. Rebuild

---

## 11. Metro Cache Issues

If you see stale JS bundle behaviour:

```bash
# Clear Metro cache
npx react-native start --reset-cache

# Or clear all caches
cd apps/mobile
npx react-native clean
npm install
npx react-native start --reset-cache
```

---

## 12. Common Build Errors

| Error | Fix |
|-------|-----|
| `SDK location not found` | Set `ANDROID_HOME` env variable or add `local.properties` in `android/` |
| `Could not find com.android.tools.build:gradle` | Run Gradle sync in Android Studio |
| `Manifest merger failed` | Check `AndroidManifest.xml` for permission conflicts |
| `Metro bundler port 8081 in use` | Run `adb reverse tcp:8081 tcp:8081` or kill the existing process |
| `Build failed: Duplicate class` | Run `./gradlew clean` in `android/` then rebuild |
| `Keystore not found` | Ensure keystore path in `build.gradle` is correct (debug uses default, release needs production keystore) |

---

## 13. Running Shared Packages

```bash
# Build shared-types
npm run build --workspace=packages/shared-types

# Build shared-constants
npm run build --workspace=packages/shared-constants

# Typecheck all
npm run typecheck --workspace=packages/shared-types
```

---

## 14. Testing

> **Current state:** No automated tests are written. Running `jest` will pass with `--passWithNoTests`.

```bash
# Run tests (mobile)
cd apps/mobile
npm test

# Run tests (backend)
cd apps/backend
npm test

# Run tests (shared-types)
cd packages/shared-types
npm test
```

For testing procedures, acceptance criteria, and regression test plans, see [`.agents/skills/testing/SKILL.md`](../.agents/skills/testing/SKILL.md).

---

## 15. Build Identification

The mobile app uses a `CURRENT_BUILD_ID` constant in `AuthContext.tsx` to track the installed build version for dev purposes. Update this value on each significant new build to ensure fresh state detection and `AsyncStorage` cache invalidation.

```typescript
// apps/mobile/src/context/AuthContext.tsx
const CURRENT_BUILD_ID = 'BUILD_X'; // Increment on each new build
```

---

## 16. Definition of Done (Per Build)

Before marking any build milestone as complete:

- [ ] Code implemented
- [ ] Gradle sync successful
- [ ] Build successful (no errors)
- [ ] ADB device connected and verified
- [ ] Previous app uninstalled / data cleared
- [ ] New APK installed
- [ ] App launched from fresh state
- [ ] Onboarding → Login → Home verified
- [ ] Target feature tested on device
- [ ] Dark mode tested
- [ ] Light mode tested
- [ ] No crashes or visible UI errors
- [ ] Language toggle tested (if affected)
