# Authentication & Security Workflow

> **Component:** Authentication & Device Authorization  
> **Source:** `apps/backend/src/modules/auth`, `apps/mobile/src/services/fingerprintAuth.ts`, `apps/mobile/src/context/AuthContext.tsx`  

This document details both the API authentication pipeline and the mobile hardware-backed biometric security flow.

---

## 1. Driver Authentication & JWT Token Issuance

```mermaid
sequenceDiagram
    autonumber
    actor Driver as EV Driver
    participant App as ChargeMesh Mobile App
    participant AuthCtrl as AuthController
    participant AuthSvc as AuthService
    participant JwtSvc as JwtService
    participant SecureStore as Encrypted AsyncStorage

    Driver->>App: Enters Phone (+91...) & Password / OTP
    App->>AuthCtrl: POST /api/v1/auth/login { phoneNumber, password }
    AuthCtrl->>AuthSvc: validateUser(phoneNumber, password)
    AuthSvc->>AuthSvc: Hash comparison (bcrypt.compare)
    
    alt Credentials Valid
        AuthSvc->>JwtSvc: signAsync({ sub: user.id, phone, role })
        JwtSvc-->>AuthSvc: Returns signed JWT access token
        AuthSvc-->>AuthCtrl: { accessToken, user }
        AuthCtrl-->>App: 200 OK + Bearer Token & User Profile
        App->>SecureStore: Persist token & profile state
        App-->>Driver: Navigates to HomeScreen
    else Invalid Credentials
        AuthSvc-->>AuthCtrl: UnauthorizedException (401)
        AuthCtrl-->>App: 401 Unauthorized ("Invalid phone number or password")
        App-->>Driver: Shows Error Alert
    end
```

---

## 2. Protected Request Authorization Pipeline

```mermaid
sequenceDiagram
    autonumber
    participant App as ChargeMesh Client
    participant JwtGuard as JwtAuthGuard
    participant JwtStrategy as JwtStrategy (Passport)
    participant Controller as Protected Controller (e.g. SessionsController)

    App->>JwtGuard: HTTP Request + Header `Authorization: Bearer <token>`
    JwtGuard->>JwtStrategy: validate(payload)
    
    alt Token Valid & Non-Expired
        JwtStrategy-->>JwtGuard: Attaches req.user = { userId, phoneNumber }
        JwtGuard->>Controller: Invokes Route Handler
        Controller-->>App: 200 OK + Data
    else Token Expired or Tampered
        JwtStrategy-->>JwtGuard: Throws UnauthorizedException
        JwtGuard-->>App: 401 Unauthorized
        App->>App: Triggers Token Refresh or re-routes to Login
    end
```

---

## 3. Mobile Hardware Biometric Security Flow

```mermaid
sequenceDiagram
    autonumber
    actor Driver as EV Driver
    participant OS as Android OS (BiometricPrompt)
    participant TEE as Hardware TEE / Keystore
    participant Bridge as Native Fingerprint Bridge
    participant Overlay as FingerprintLockOverlay (UI)

    Driver->>OS: Opens or Resumes ChargeMesh App
    Overlay->>Overlay: Detects AppState 'active' & Lock Enabled
    Overlay->>Overlay: Renders Fullscreen Blur & Fingerprint Prompt
    Overlay->>Bridge: authenticateWithBiometrics()
    Bridge->>OS: BiometricPrompt.authenticate(CryptoObject)
    OS->>TEE: Prompts Sensor for Fingerprint / Face
    Driver->>OS: Touches Fingerprint Sensor
    
    alt Biometric Match Verified by TEE
        TEE-->>OS: Signature Validated
        OS-->>Bridge: onAuthenticationSucceeded()
        Bridge-->>Overlay: { success: true }
        Overlay->>Overlay: Unmounts Lock Screen
        Overlay-->>Driver: Unlocks Driver Workspace
    else Biometric Mismatch / Cancelled
        OS-->>Bridge: onAuthenticationFailed() / Error
        Bridge-->>Overlay: { success: false, error }
        Overlay-->>Driver: Prompts for Retry or Device PIN
    end
```
