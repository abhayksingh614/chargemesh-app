# ChargeMesh Design System & UI/UX Architecture Specification

**Version:** 1.1.0  
**Status:** Production Standard  
**Applicability:** Customer Mobile App (`apps/mobile`), Partner/CPO Platform, Admin Web Portal (`apps/admin`), and Shared Monorepo Packages.

---

## 1. Brand Identity & Design Philosophy

ChargeMesh is India's unified EV charging and mobility intelligence platform. The design communicates:
* **Energy Intelligence & Connectivity:** High-speed real-time telemetry, live connector statuses, and seamless multi-CPO roaming.
* **Reliability & Trust:** Transparent pricing, instantaneous slot holds, zero false availability claims (unknown data is never masked as available), and RBI-compliant tokenized payments.
* **Sustainability & Eco-Impact:** Carbon avoided (kg CO₂), green miles, and environmental progress tracking.
* **Premium Mobility:** Minimalist typography, polished micro-interactions, high-contrast visual hierarchy, and cohesive component styling inspired by top-tier modern mobility and fintech apps.

---

## 2. Design Tokens & Foundations

### 2.1 Color Palette

```typescript
export const colors = {
  // Brand Accents
  primary: '#16A34A',          // ChargeMesh Vibrant Green (CTA, Available, Active Charging)
  primaryDark: '#064E3B',      // Forest Night (Hero banners, headers, dark cards)
  primaryLight: '#86EFAC',     // Mint Glow
  ecoLight: '#ECFDF5',         // Eco Mint Surface (Cards, badges, subtle highlights)
  ecoBorder: '#A7F3D0',        // Subtle eco stroke

  // Surfaces & Backgrounds
  background: '#F8FAF9',       // Clean application canvas
  surface: '#FFFFFF',          // Card and container background
  surfaceSecondary: '#F1F5F9', // Secondary subtle surface / input fields
  surfaceDark: '#0F172A',      // Dark viewfinder & high-contrast containers
  overlay: 'rgba(15, 23, 42, 0.72)', // Unified modal & sheet backdrop

  // Typography
  textPrimary: '#111827',      // Headings & primary labels
  textSecondary: '#6B7280',    // Secondary descriptions & metadata
  textTertiary: '#9CA3AF',     // Tertiary details & helper text
  textMuted: '#9CA3AF',        // Disabled text & input placeholders
  textInverse: '#FFFFFF',      // Text on primary buttons & dark banners

  // Borders & Dividers
  border: '#E5E7EB',
  borderLight: '#F3F4F6',
  borderDark: '#CBD5E1',
  divider: '#E5E7EB',

  // Semantic Status (Strict OCPI / OCPP Mapping)
  status: {
    available: '#16A34A',      // Usable charger
    availableBg: '#DCFCE7',
    inUse: '#EA580C',          // Occupied / Charging
    inUseBg: '#FFEDD5',
    unavailable: '#DC2626',    // Faulted / Out of service
    unavailableBg: '#FEE2E2',
    reserved: '#2563EB',       // Blue bay reservation
    reservedBg: '#DBEAFE',
    stale: '#D97706',          // Delayed telemetry warning
    staleBg: '#FEF3C7',
    unknown: '#6B7280',        // Disconnected (Never masked as Available!)
    unknownBg: '#F3F4F6',
  }
};
```

---

### 2.2 Typography Scale

| Token | Size | Weight | Line Height | Purpose |
| :--- | :--- | :--- | :--- | :--- |
| `h1` | 28px | 800 (Bold) | 34px | Screen titles, hero welcome |
| `h2` | 22px | 800 (Bold) | 28px | Section headers |
| `h3` | 18px | 700 (Bold) | 24px | Card titles, station names |
| `subtitle` | 15px | 600 (Semi) | 22px | Subtitles, group headers |
| `body` | 14px | 400 (Regular) | 20px | Standard body & form text |
| `bodyMedium` | 14px | 600 (Semi) | 20px | Active tab labels, list values |
| `caption` | 12px | 500 (Medium) | 16px | Metadata, timestamps, tags |
| `metricLarge` | 32–36px | 900 (Black) | 40px | Live kW power, wallet balance |
| `metricMedium`| 22–26px | 800 (Bold) | 30px | SoC percentage, energy (kWh) |

---

### 2.3 Spacing, Radii & Shadows

```typescript
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const borderRadius = {
  sm: 6,
  md: 10,
  lg: 14,
  xl: 18,
  xxl: 22,
  full: 9999,
};

export const shadows = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  elevated: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.10,
    shadowRadius: 16,
    elevation: 4,
  },
};
```

---

## 3. Unified Modal & Popup System Specification

Every modal in ChargeMesh follows a strict visual and functional structure:

1. **Backdrop:** Semi-transparent dark overlay (`rgba(15, 23, 42, 0.72)`) with tap-outside dismiss.
2. **Container:** Rounded (`borderRadius.xxl` = 22px), white background, max width 92%, max height 88%.
3. **Close Cross (✕):** Prominently anchored at `top: 14, right: 14` with a 36×36 touch target, subtle border, and centered line height.
4. **Header Section:** Centered status icon badge, category pill (e.g. `FAST WALLET`, `RESERVATION`, `DPDP ACT 2023`), and bold title.
5. **Scrollable Content Body:** Auto-scrolling on smaller screen sizes and keyboard avoiding.
6. **Action Row:** High-contrast primary CTA button alongside secondary cancel/dismiss label.

### Standardized Modal Components:
* `AppModal`: Foundational base component.
* `PaymentModal`: Wallet top-up with ₹200/₹500/₹1,000/₹2,000 quick chips and payment method options.
* `BookingModal`: 15/30/45-minute connector hold reservations.
* `FormInputModal`: Multi-field input dialogs (Change Password, Report Station Issue).
* `StatusModal`: Replacement for native OS alerts with rich itemized breakdowns.
* `ConfirmationModal`: Destructive actions (Sign Out, Stop Charging).
* `AuthGateModal`: Guest driver member gate with one-tap login/register CTAs.

---

## 4. Key Flow Patterns

### 4.1 Charger Discovery & Map Interface
* Map pins categorized by real-time status: Green (Available), Orange (In Use), Red (Unavailable), Grey (Unknown).
* Interactive bottom sheet displaying nearest hubs, available port count, max DC kW power, and dynamic tariff per kWh.
* Filter pills for fast connector sorting: High Speed DC (≥50 kW), Multi-CPO, Available Now, Fastag/UPI enabled.

### 4.2 Live Charging Session Flow
* Circular SoC battery gauge with animated power flow indicators.
* Real-time live metrics: Instantaneous kW delivery, accumulated kWh energy, elapsed charging duration, and accrued cost in ₹ INR.
* Safety stop button wired with confirmation dialog to prevent accidental disconnects.

### 4.3 Payment & Wallet Experience
* Pre-authorization via Fast Wallet or linked UPI/Fastag.
* Automated reconciliation upon session completion with itemized GST tax invoices (PDF generation & email dispatch).

---

## 5. Cross-Platform Scalability & Future Roadmap

* **Driver Mobile App (`apps/mobile`):** React Native (iOS & Android) with MapLibre GL, native camera scanner, and offline caching.
* **CPO / Partner Platform:** Web portal sharing design tokens, OCPI 2.3 contracts, and real-time station diagnostics.
* **Admin Platform (`apps/admin`):** Fleet management, tariff configuration, tariff settlement reconciliations, and ticket resolution.
* **Shared Types & Constants (`packages/shared-*`):** Monorepo single source of truth for business logic, status thresholds, and API interfaces.
