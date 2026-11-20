# ChargeMesh — Phase 03 Batch 8: External Provider Integrations Architecture
**Document Reference:** `CM-ARCH-P3-B08`  
**Classification:** Provider Architectural Specification & Security Contract  
**Finding References:** `REM-B01`, `REM-B02`, `REM-B03`  
**Date:** 2026-11-20  
**Status:** ARCHITECTURAL SPECIFICATION APPROVED  

---

## 1. Executive Summary

ChargeMesh connects EV drivers, charging points (EVSEs), and administrative operators. While local development uses in-memory and stubbed adapters for external dependencies, production deployment requires resilient, secure, and auditable integrations with third-party providers.

This document formalizes the production integration architecture, security standards, credential management, and failure modes for:
1. **SMS Gateway (`REM-B01`)**
2. **Payment Gateway & Webhook Signature Verification (`REM-B02`)**
3. **Map Vector Tile Infrastructure (`REM-B03`)**

---

## 2. SMS Gateway Architecture (`REM-B01`)

### 2.1 Interface & Adapter Specification
All SMS providers implement the `IOtpProvider` contract defined in `apps/backend/src/modules/auth/otp/otp.interface.ts`:

```typescript
export interface OtpSendResult {
  requestId: string;
  cooldownSeconds: number;
  debugCode?: string;
}

export interface IOtpProvider {
  readonly providerName: string;
  sendOtp(phoneNumber: string, code: string): Promise<OtpSendResult>;
  isAvailable(): boolean;
}
```

```
               ┌───────────────────────────┐
               │        OtpService         │
               └─────────────┬─────────────┘
                             │
                     [ IOtpProvider ]
                             │
     ┌───────────────────────┼────────────────────────┐
     ▼                       ▼                        ▼
┌──────────────┐    ┌─────────────────┐    ┌─────────────────────┐
│  MockOtp     │    │  ProductionSms  │    │  AWS SNS / Twilio   │
│  (Dev Only)  │    │  (Fail-Closed)  │    │  (Live Production)  │
└──────────────┘    └─────────────────┘    └─────────────────────┘
```

### 2.2 Provider Adapter Implementations

#### A. AWS Simple Notification Service (SNS)
- **SDK Dependency:** `@aws-sdk/client-sns`
- **IAM Permission Required:** `sns:Publish`
- **Configuration Contract:**
  ```env
  SMS_PROVIDER=aws-sns
  AWS_REGION=ap-south-1
  AWS_ACCESS_KEY_ID=<vault-managed>
  AWS_SECRET_ACCESS_KEY=<vault-managed>
  AWS_SNS_SENDER_ID=CHGMES
  ```
- **Dispatch Implementation Pattern:**
  ```typescript
  const client = new SNSClient({ region: config.region });
  const command = new PublishCommand({
    PhoneNumber: formattedE164,
    Message: `Your ChargeMesh security code is: ${code}. Valid for 5 minutes. Do not share this OTP.`,
    MessageAttributes: {
      'AWS.SNS.SMS.SenderID': { DataType: 'String', StringValue: 'CHGMES' },
      'AWS.SNS.SMS.SMSType': { DataType: 'String', StringValue: 'Transactional' },
    },
  });
  await client.send(command);
  ```

#### B. Twilio Verify / Messaging API
- **SDK Dependency:** `twilio`
- **Configuration Contract:**
  ```env
  SMS_PROVIDER=twilio
  TWILIO_ACCOUNT_SID=<vault-managed>
  TWILIO_AUTH_TOKEN=<vault-managed>
  TWILIO_MESSAGING_SERVICE_SID=<vault-managed>
  ```

#### C. MSG91 (India DLT Compliant)
- **API Standard:** Flow API (TRAI DLT mandated for Indian telecom networks)
- **Configuration Contract:**
  ```env
  SMS_PROVIDER=msg91
  MSG91_AUTH_KEY=<vault-managed>
  MSG91_TEMPLATE_ID=<dlt-approved-template-id>
  MSG91_SENDER_ID=CHGMES
  ```

### 2.3 Security Directives
1. **Zero Credential Hardcoding:** Provider credentials must be injected solely via container environment variables or AWS Secrets Manager.
2. **Fail-Closed Principle:** If credentials are missing in `NODE_ENV=production`, `ProductionSmsProviderStub` rejects the request with HTTP 503 (`ServiceUnavailableException`). It must **never** log or leak the OTP code to console or responses.
3. **Debug Code Suppression:** `debugCode` is strictly masked (`undefined`) in all production responses.

---

## 3. Payment Gateway & Webhook Signature Verification (`REM-B02`)

### 3.1 Overview & Financial Flow
Driver wallet balance replenishment operates via Indian payment rails (UPI, RuPay, Visa, Mastercard, NetBanking) mediated by Razorpay or Stripe:

```
Driver Mobile App          ChargeMesh Backend         Payment Gateway
      │                            │                         │
      │── 1. Create Top-Up Order ─>│                         │
      │                            │── 2. Create Order API ─>│
      │                            │<── 3. Return Order ID ──│
      │<── 4. Return Order Params ─│                         │
      │                                                      │
      │────────────── 5. Driver Pays via UPI / Card ────────>│
      │                                                      │
      │                                      6. Webhook Post │
      │                            │<────── (Signed Payload) ┘
      │                            │
      │                     [ VERIFY SIGNATURE ]
      │                     [ ATOMIC TRANSACTION: ]
      │                     [ 1. Idempotency Check ]
      │                     [ 2. Lock User Row     ]
      │                     [ 3. Update Balance    ]
      │                     [ 4. Record Ledger     ]
      │<── 7. WebSocket Push ──────│
```

### 3.2 Webhook Signature Verification Contract

#### Razorpay Webhook Authentication
- **Header:** `X-Razorpay-Signature`
- **Secret:** `RAZORPAY_WEBHOOK_SECRET`
- **Verification Algorithm:** HMAC SHA-256 against raw request buffer:
  ```typescript
  import * as crypto from 'crypto';

  export function verifyRazorpaySignature(
    rawBody: Buffer | string,
    signature: string,
    webhookSecret: string,
  ): boolean {
    const expected = crypto
      .createHmac('sha256', webhookSecret)
      .update(rawBody)
      .digest('hex');

    return crypto.timingSafeEqual(
      Buffer.from(signature, 'utf8'),
      Buffer.from(expected, 'utf8'),
    );
  }
  ```

### 3.3 Idempotency & Replay Defense
To eliminate duplicate crediting caused by network retries:
1. **Idempotency Key:** Extract `event_id` or `payment.id`.
2. **Atomic Lock:** Check and set Redis key `chargemesh:payment:processed:<paymentId>` with `SETNX` and 7-day TTL. If key already exists, return HTTP 200 OK without re-crediting.
3. **Database Transaction:** Execute balance adjustment within `dataSource.transaction` with `setLock('pessimistic_write')` on `UserEntity`.

---

## 4. Map Vector Tile Provider Architecture (`REM-B03`)

### 4.1 Specification
- **Mobile Stack:** `@maplibre/maplibre-react-native`
- **Admin Portal Stack:** `maplibre-gl` (React/Next.js)
- **Supported Tile Providers:**
  - MapLibre Demo Tiles (development default)
  - Stadia Maps (production recommended)
  - Mapbox Vector Tiles (fallback)

### 4.2 Configuration Contract
```env
NEXT_PUBLIC_MAP_STYLE_URL=https://tiles.stadiamaps.com/styles/alidade_smooth.json
NEXT_PUBLIC_MAP_API_KEY=<stadia-or-mapbox-key>
EXPO_PUBLIC_MAP_STYLE_URL=https://tiles.stadiamaps.com/styles/alidade_smooth.json
EXPO_PUBLIC_MAP_API_KEY=<stadia-or-mapbox-key>
```

### 4.3 Client-Side Clustering & Spatial Optimization
- Stations are queried using PostGIS `ST_DWithin` bounded by viewport bounding boxes (`northEast`, `southWest`).
- Client-side Supercluster aggregates dense metropolitan charging hubs to prevent UI jank.
