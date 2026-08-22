# Global Rule: Build, Install & Device Verification Process

Whenever a new app update/build is created, always follow this mandatory process:

1. **Build the Updated App**
   * Generate the latest app build with all implemented changes.
   * Ensure the build completes successfully without errors.

2. **Update Gradle**
   * Update/sync Gradle as required for the latest build.
   * Resolve any Gradle or dependency-related issues before proceeding.

3. **Check ADB Connection**
   * Verify whether the target Android phone is connected through ADB (`adb devices`).
   * If the device is not connected, ensure the device is connected and authorized through ADB before continuing.
   * Confirm that the device is properly detected and in `device` state.

4. **Check Existing App Installation**
   * Check whether the app is already installed on the connected phone (`adb shell pm list packages | grep com.chargemesh.mobile`).
   * If the app is installed, **uninstall the existing version** (`adb uninstall com.chargemesh.mobile` or clear app data).
   * Clear/remove the existing app data as part of the cleanup process to ensure clean initial state.

5. **Install the New Build**
   * Install the newly generated build on the connected phone (`adb install -r <apk_path>`).
   * Verify that the installation completes with `Success`.

6. **Launch & Verify**
   * Open the newly installed app (`adb shell monkey -p com.chargemesh.mobile -c android.intent.category.LAUNCHER 1`).
   * Test the updated functionality and the affected screens/features.
   * Check for crashes, UI issues, broken functionality, or unexpected behavior (`adb shell pidof com.chargemesh.mobile` and logcat).

7. **Fix & Retest**
   * If any issue is found during device testing, fix the issue.
   * Build the app again and repeat the complete process:
     **Build → Gradle Sync/Update → ADB Check → Uninstall/Clear Data → Install → Open → Test**

---

### Mandatory Flow

```text
Updated Code ➔ Gradle Sync/Update ➔ Build ➔ ADB Check ➔ Uninstall Existing App ➔ Clear App Data ➔ Install New Build ➔ Open App ➔ Test ➔ Fix Issues ➔ Rebuild & Retest
```
