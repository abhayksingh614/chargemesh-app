# ChargeMesh — Security Documentation

> **Version:** 1.2.5 | **Updated:** 2026-08-24  
> **Scope:** Mobile App (Android/iOS), Backend API, Admin Portal, GitHub Repository

---

## 1. Security Principles

1. **No real secrets in source code** — ever. All credentials via environment variables.
2. **No real secrets in `.env.example`** — templates use placeholder values only.
3. **No `.env` files committed** — excluded via `.gitignore`.
4. **No credentials in documentation** — all examples use `your_xxx_here` placeholders.
5. **Least privilege** — every service account and API key must have minimum required permissions.
6. **Defence in depth** — security is applied at every layer, not just at the perimeter.

---

## 2. Current Security Status (v1.2.5)

| Item | Status | Action Required |
|------|--------|----------------|
| Demo credentials in AuthContext | ⚠️ DEV ONLY | Remove before production |
| Debug keystore for release APK | ⚠️ HIGH RISK | Replace with production keystore |
| No real API keys in codebase | ✅ Clean | Maintain |
| `.env` files excluded from git | ✅ Clean | Maintain |
| `.env.example` has no real secrets | ✅ Clean | Maintain |
| AsyncStorage unencrypted | ⚠️ Medium | Encrypt for production |
| Backend not connected | ✅ No exposure | N/A (mock-only) |

---

## 3. Demo / Development Credentials

> ⚠️ **DEV/TEST ONLY — MUST BE REMOVED BEFORE PRODUCTION RELEASE**

The following demo credentials are included in `apps/mobile/src/context/AuthContext.tsx` for development and testing purposes only:

| Credential | Value | Purpose |
|------------|-------|---------|
| Demo phone numbers | See `AuthContext.tsx` → `DEV_DEMO_PHONES` | Skip real OTP flow in dev |
| Demo OTP | `123456` | Auto-pass OTP verification in dev |
| Google Sign-In | Mock user returned | Skip real OAuth in dev |

### Removal Checklist (Before Production)
- [ ] Remove all demo phone numbers from `AuthContext.tsx`
- [ ] Remove hardcoded OTP `123456` bypass
- [ ] Replace mock Google Sign-In with real Firebase Auth
- [ ] Connect real OTP/SMS gateway (AWS SNS or equivalent)
- [ ] Set `DEV_SKIP_OTP_VERIFICATION=false` in `.env`
- [ ] Remove `DEV_DEMO_OTP` from `.env.example`

---

## 4. Android Signing & Keystore

### 4.1 Current Situation

> ⚠️ **HIGH RISK — Action required before Play Store release**

The release build configuration in `apps/mobile/android/app/build.gradle` currently uses the **debug keystore** for signing release APKs. This is:
- Acceptable for internal testing and development
- **Not acceptable for Google Play Store submission**
- **Not acceptable for public/production distribution**

### 4.2 Debug vs Production Signing

| Aspect | Debug Keystore | Production Keystore |
|--------|---------------|---------------------|
| Location | `~/.android/debug.keystore` | Secure, separate storage |
| Password | `android` (public knowledge) | Strong, unique password |
| Alias | `androiddebugkey` | Custom alias |
| Play Store | ❌ Rejected | ✅ Required |
| Security | ❌ Not secure | ✅ Required |

### 4.3 Generating a Production Keystore

```bash
# Generate a production keystore
# Run this ONCE and store the output in a secure location
keytool -genkey -v \
  -keystore chargemesh-release.keystore \
  -alias chargemesh-release \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000
```

You will be prompted for:
- **Keystore password** — Use a strong, randomly generated password (≥ 20 chars)
- **Key alias** — Use `chargemesh-release`
- **Key password** — Can be the same as keystore password or different
- **Distinguished Name (DN)** — Organization name, location, country

### 4.4 Storing the Keystore Securely

> ⚠️ **NEVER commit the keystore file to GitHub or any version control system.**

Recommended storage:
- **Primary:** AWS Secrets Manager or AWS KMS (for CI/CD use)
- **Backup:** Encrypted password manager (1Password, Bitwarden, etc.)
- **Physical backup:** Encrypted USB drive stored in a secure location

### 4.5 Configuring Gradle for Production Signing

1. Place `chargemesh-release.keystore` outside the repository (e.g., `~/.android/chargemesh-release.keystore`)
2. Create `apps/mobile/android/keystore.properties` (already in `.gitignore`):

```properties
# apps/mobile/android/keystore.properties
# DO NOT COMMIT THIS FILE
storeFile=/path/to/chargemesh-release.keystore
storePassword=your_keystore_password
keyAlias=chargemesh-release
keyPassword=your_key_password
```

3. Update `apps/mobile/android/app/build.gradle`:

```groovy
// Load keystore properties
def keystorePropertiesFile = rootProject.file("keystore.properties")
def keystoreProperties = new Properties()
if (keystorePropertiesFile.exists()) {
    keystoreProperties.load(new FileInputStream(keystorePropertiesFile))
}

android {
    signingConfigs {
        debug {
            // Debug config remains unchanged
        }
        release {
            if (keystorePropertiesFile.exists()) {
                storeFile file(keystoreProperties['storeFile'])
                storePassword keystoreProperties['storePassword']
                keyAlias keystoreProperties['keyAlias']
                keyPassword keystoreProperties['keyPassword']
            }
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled true
            proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
        }
    }
}
```

### 4.6 Play Store Release Process

1. Build a signed AAB (Android App Bundle — preferred over APK for Play Store):
   ```bash
   cd apps/mobile/android
   ./gradlew bundleRelease
   ```
   Output: `app/build/outputs/bundle/release/app-release.aab`

2. Or build a signed APK:
   ```bash
   ./gradlew assembleRelease
   ```

3. Upload the `.aab` to Google Play Console → Release Management → Production.

4. **Enrol in Google Play App Signing** — Google manages the final signing key, and you upload with your upload key. This is the recommended approach.

### 4.7 Keystore Backup & Recovery

- ⚠️ **A lost production keystore means you cannot update your app on the Play Store.** There is no recovery mechanism.
- Keep at least 2 encrypted backups in separate physical and cloud locations.
- Store the keystore password separately from the keystore file.
- Document who has access to the keystore.

---

## 5. Environment Variables & Secrets Management

### 5.1 Rules

| Rule | Details |
|------|---------|
| Never commit `.env` | Excluded via `.gitignore` (`.env`, `.env.*`) |
| Never put secrets in code | Use env vars or secret managers |
| Never log secrets | Ensure log statements don't print passwords or keys |
| Rotate secrets regularly | API keys, JWT secrets, database passwords |

### 5.2 Secret Categories

| Secret Type | Development | Production |
|-------------|-------------|------------|
| Database credentials | `.env` (local) | AWS Secrets Manager |
| JWT secret | `.env` (local) | AWS Secrets Manager |
| Razorpay keys | `.env` (test keys only) | AWS Secrets Manager |
| Firebase credentials | `google-services.json` (dev) | CI/CD secure variable |
| Keystore password | `keystore.properties` (local, gitignored) | AWS Secrets Manager |
| AWS credentials | `~/.aws/credentials` (local) | IAM Roles (not keys) |

### 5.3 What Goes in the Mobile App Bundle

The React Native app bundle is distributed to users — assume everything in it is readable. Only put these in the app:

- ✅ Public API base URL
- ✅ Firebase public identifiers (API key, project ID, app ID)
- ✅ Razorpay **public** key ID (`rzp_test_xxx` or `rzp_live_xxx`)
- ✅ MapLibre tile server URL
- ❌ **Never:** Database passwords, JWT secrets, private keys, Razorpay secret key

---

## 6. Data Security

### 6.1 AsyncStorage

The app uses `AsyncStorage` to persist:
- User authentication state
- Vehicle list
- Wallet balance
- Theme preference
- Language preference
- Favourites list

> ⚠️ `AsyncStorage` is **not encrypted** by default on Android. For production, consider using `@react-native-async-storage/async-storage` with encryption, or `react-native-encrypted-storage` for sensitive data (auth tokens, etc.).

### 6.2 No Real PII in Mock Data

The current mock data does not contain real personally identifiable information (PII):
- Phone numbers in `AuthContext.tsx` are demo/test numbers, not real user data
- Station data is fictionalised
- Transaction data is generated mock data

---

## 7. API Security (Planned — Backend Phase)

When the backend is connected, implement:

| Control | Implementation |
|---------|---------------|
| Authentication | JWT (RS256) with short expiry (15 min) + refresh tokens |
| Authorization | Role-based (driver, admin, CPO operator) |
| Rate limiting | Per-IP and per-user limits via Redis |
| Input validation | `class-validator` on all DTOs |
| SQL injection prevention | Parameterized queries via TypeORM |
| HTTPS only | TLS 1.2+ enforced at API gateway |
| CORS | Whitelist only known origins |
| Secrets | AWS Secrets Manager (not env vars in production) |

---

## 8. GitHub Repository Security

### 8.1 Files That Must Never Be Committed

| File Type | Example | Why |
|-----------|---------|-----|
| Environment files | `.env`, `.env.local` | Contains real credentials |
| Keystore files | `*.keystore`, `*.jks`, `*.p12` | Signs the app |
| Private keys | `*.pem`, `*.key` | Cryptographic secrets |
| Service account JSON | `*-firebase-adminsdk-*.json` | Full Firebase access |
| AWS credentials | `~/.aws/credentials` | Cloud account access |

All of the above are excluded in `.gitignore`.

### 8.2 Pre-Push Checklist

Before every `git push`, verify:
- [ ] No real credentials in any modified file
- [ ] No `.env` files staged
- [ ] No keystore files staged
- [ ] No private key files staged
- [ ] `README.md` updated if features or setup changed
- [ ] `CHANGELOG.md` updated for significant changes

---

## 9. Incident Response

If a secret is accidentally committed:

1. **Immediately rotate** the exposed credential (revoke/regenerate the key/password)
2. **Remove** the secret from the commit history using `git filter-branch` or BFG Repo Cleaner
3. **Force-push** the cleaned history (coordinate with team)
4. **Audit** for any unauthorized use of the exposed credential
5. **Document** the incident and add process controls to prevent recurrence

> A rotated credential that was committed is still in git history until history is cleaned. Assume the credential is compromised immediately.
