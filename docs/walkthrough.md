# Walkthrough — Version 1.0.0 (Prototype) Build & APK Generation

Completed the clean build, version incrementation, and APK generation for the **ChargeMesh V 1.0.0 (Prototype)** release.

---

## 1. Release & Build Information

- **Application Name:** ChargeMesh
- **Package Name:** `com.chargemesh.mobile`
- **Release Version:** `V 1.0.0 (Prototype)`
- **Version Name:** `1.0.0`
- **Version Code:** `9`
- **Build Type:** Distributable Prototype APK (Signed with internal debug keystore)
- **Primary Target Architectures:** `arm64-v8a`, `armeabi-v7a`, `x86`, `x86_64`

---

## 2. Distributable Artifact Path

The distributable APK has been compiled and saved to:

```
apps/mobile/android/app/build/outputs/apk/debug/ChargeMesh-v1.0.0-Prototype.apk
```

**Full Local Path:**
`c:\Users\aksde\Videos\My_Codex\Chargemesh-app\apps\mobile\android\app\build\outputs\apk\debug\ChargeMesh-v1.0.0-Prototype.apk`

---

## 3. Verified APK Metadata

```json
{
  "version": 3,
  "artifactType": {
    "type": "APK",
    "kind": "Directory"
  },
  "applicationId": "com.chargemesh.mobile",
  "variantName": "debug",
  "elements": [
    {
      "type": "SINGLE",
      "filters": [],
      "attributes": [],
      "versionCode": 9,
      "versionName": "1.0.0",
      "outputFile": "app-debug.apk"
    }
  ],
  "elementType": "File"
}
```

---

## 4. Summary of Changes in V 1.0.0 (Prototype)

1. **Version Synchronization Across All Layers:**
   - [`apps/mobile/android/app/build.gradle`](file:///c:/Users/aksde/Videos/My_Codex/Chargemesh-app/apps/mobile/android/app/build.gradle): `versionCode 9`, `versionName "1.0.0"`.
   - [`apps/mobile/package.json`](file:///c:/Users/aksde/Videos/My_Codex/Chargemesh-app/apps/mobile/package.json): `"version": "1.0.0"`.
   - [`apps/mobile/src/constants/appConstants.ts`](file:///c:/Users/aksde/Videos/My_Codex/Chargemesh-app/apps/mobile/src/constants/appConstants.ts): `APP_VERSION = '1.0.0'`, `APP_VERSION_LABEL = 'V 1.0.0 (Prototype)'`.
   - [`apps/mobile/src/i18n/translations/en.ts`](file:///c:/Users/aksde/Videos/My_Codex/Chargemesh-app/apps/mobile/src/i18n/translations/en.ts): `appVersion: 'ChargeMesh V 1.0.0 (Prototype)'`.
   - [`apps/mobile/src/i18n/translations/hi.ts`](file:///c:/Users/aksde/Videos/My_Codex/Chargemesh-app/apps/mobile/src/i18n/translations/hi.ts): `appVersion: 'चार्जमेश V 1.0.0 (प्रोटोटाइप)'`.
   - [`apps/mobile/src/screens/SplashScreen.tsx`](file:///c:/Users/aksde/Videos/My_Codex/Chargemesh-app/apps/mobile/src/screens/SplashScreen.tsx): `ChargeMesh V 1.0.0 (Prototype) · ISO 15118 Ready`.
   - [`apps/mobile/src/components/ReleaseUpdatesModal.tsx`](file:///c:/Users/aksde/Videos/My_Codex/Chargemesh-app/apps/mobile/src/components/ReleaseUpdatesModal.tsx): Updated release notes for V 1.0.0.
   - [`CHANGELOG.md`](file:///c:/Users/aksde/Videos/My_Codex/Chargemesh-app/CHANGELOG.md) & [`README.md`](file:///c:/Users/aksde/Videos/My_Codex/Chargemesh-app/README.md): Documented V 1.0.0 prototype milestone.

2. **Core Production-Ready Features in this Build:**
   - 📷 **CameraX QR Scanner:** Real-time hardware barcode decoding via Google ML Kit.
   - 👆 **Native Fingerprint App Lock:** Android `BiometricPrompt` Hardware Keystore session lock.
   - 💰 **Dedicated Add Money & Wallet Ledger:** Multi-payment options (Card, UPI VPA, Net Banking) with accurate running balance history.
   - 🚗 **Complete 4W EV Catalog:** 17 Indian brands, 40 EV models, 63 variants.
   - ⚡ **15 Indian CPO Charging Networks:** Directory of 35 charging hubs across India.
   - 🗺️ **MapLibre Interactive Maps:** 36 States and 700+ Districts search.
   - 🌓 **Dynamic Light & Dark Modes:** High-contrast semantic design tokens.
   - 🇮🇳 **Bilingual English & Hindi UI:** Seamless real-time language switching.
