# ChargeMesh Design System

> **Version:** 1.2.5 | **Updated:** 2026-08-24  
> **Applicability:** Mobile App (`apps/mobile`) — all 22 screens audited and compliant

---

## 1. Brand Identity & Design Philosophy

**ChargeMesh** communicates:
- **Energy & Intelligence** — Fast, real-time, always-responsive
- **Reliability & Trust** — Clear status, no false information, honest pricing
- **Sustainability** — Eco-forward, green-first visual identity
- **Premium Mobility** — Polished animations, cohesive component language, modern typography

### Core UX Principle
> **Easy to See → Easy to Read → Easy to Understand → Easy to Act**

Every screen decision should satisfy this hierarchy in order.

---

## 2. Theme System

### 2.1 ThemeContext Architecture

The app uses a dynamic **dual-theme system** powered by `ThemeContext`. There are no hardcoded colors in screen or component files — all colors must come from the theme object.

```typescript
// apps/mobile/src/context/ThemeContext.tsx

// How to consume the theme in any screen or component:
import { useTheme } from '../context/ThemeContext';

const MyComponent = () => {
  const { theme } = useTheme();
  return (
    <View style={{ backgroundColor: theme.background }}>
      <Text style={{ color: theme.textPrimary }}>Hello</Text>
    </View>
  );
};
```

**Persistence:** User theme preference is saved to AsyncStorage under `@chargemesh:theme_mode`.  
**Default:** Light mode on first launch.

### 2.2 Dark Theme Tokens

```typescript
const darkTheme = {
  primary:            '#00D084',   // ChargeMesh Neon Green
  primaryDark:        '#022C22',   // Deep Forest
  primaryLight:       'rgba(0, 208, 132, 0.16)',
  neonTeal:           '#00BFA5',

  background:         '#06131D',   // Deep Navy
  surface:            '#071826',
  surfaceSecondary:   '#0B2236',
  surfaceElevated:    '#0F273D',
  cardBg:             'rgba(7, 24, 38, 0.92)',
  cardBorder:         'rgba(255, 255, 255, 0.14)',
  inputBg:            'rgba(2, 6, 23, 0.75)',

  textPrimary:        '#FFFFFF',
  textSecondary:      '#94A3B8',
  textMuted:          '#64748B',
  textInverse:        '#0F172A',

  border:             'rgba(255, 255, 255, 0.12)',
  borderLight:        'rgba(255, 255, 255, 0.08)',
  borderDark:         'rgba(255, 255, 255, 0.22)',

  statusAvailableBg:  'rgba(0, 208, 132, 0.15)',
  statusBusyBg:       'rgba(245, 158, 11, 0.15)',
  statusUnavailableBg:'rgba(239, 68, 68, 0.15)',
  ecoLight:           'rgba(0, 208, 132, 0.12)',
  isDark: true,
};
```

### 2.3 Light Theme Tokens

```typescript
const lightTheme = {
  primary:            '#10B981',   // ChargeMesh Green
  primaryDark:        '#064E3B',   // Forest Night
  primaryLight:       '#ECFDF5',   // Eco Mint
  neonTeal:           '#0D9488',

  background:         '#F8FAFC',   // Clean canvas
  surface:            '#FFFFFF',
  surfaceSecondary:   '#F1F5F9',
  surfaceElevated:    '#FFFFFF',
  cardBg:             '#FFFFFF',
  cardBorder:         '#E2E8F0',
  inputBg:            '#F1F5F9',

  textPrimary:        '#0F172A',
  textSecondary:      '#475569',
  textMuted:          '#64748B',
  textInverse:        '#FFFFFF',

  border:             '#E2E8F0',
  borderLight:        '#F1F5F9',
  borderDark:         '#CBD5E1',

  statusAvailableBg:  '#DCFCE7',
  statusBusyBg:       '#FEF3C7',
  statusUnavailableBg:'#FEE2E2',
  ecoLight:           '#ECFDF5',
  isDark: false,
};
```

### 2.4 Static Color Palette (`theme/colors.ts`)

The `colors.ts` file provides a static set of design tokens that are not theme-dependent (e.g., semantic status colors and brand constants). It is used as a fallback or for components where theme context is unavailable.

```typescript
colors.primary           = '#16A34A'   // CTA green
colors.status.available  = '#16A34A'   // Station available
colors.status.inUse      = '#EA580C'   // Occupied/charging
colors.status.unavailable= '#DC2626'   // Faulted
colors.status.reserved   = '#2563EB'   // Reserved
colors.status.stale      = '#D97706'   // Stale telemetry
colors.status.unknown    = '#6B7280'   // Disconnected (never shown as Available)
```

---

## 3. Typography

| Token | Size | Weight | Line Height | Use |
|-------|------|--------|-------------|-----|
| `h1` | 28px | 800 | 34px | Screen titles, hero welcome |
| `h2` | 22px | 800 | 28px | Section headers |
| `h3` | 18px | 700 | 24px | Card titles, station names |
| `subtitle` | 15px | 600 | 22px | Group headers |
| `body` | 14px | 400 | 20px | Standard body & form text |
| `bodyMedium` | 14px | 600 | 20px | Active tab labels, list values |
| `caption` | 12px | 500 | 16px | Metadata, timestamps, tags |
| `metricLarge` | 32–36px | 900 | 40px | Live kW power, wallet balance |
| `metricMedium` | 22–26px | 800 | 30px | SoC %, energy kWh |

---

## 4. Spacing, Radius & Shadows

### Spacing Scale
```typescript
spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24, xxxl: 32 }
```

### Border Radius
```typescript
borderRadius = { sm: 6, md: 10, lg: 14, xl: 18, xxl: 22, full: 9999 }
```

### Shadows
```typescript
// Card (subtle lift)
card: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 }

// Elevated (prominent)
elevated: { shadowColor: '#000', shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.10, shadowRadius: 16, elevation: 4 }
```

---

## 5. Station Status Colors

Status colors are strictly mapped to OCPI/OCPP state values. **Unknown status is never displayed as Available.**

| Status | Label | Light Color | Dark Color |
|--------|-------|-------------|------------|
| `Available` | Available | `#16A34A` on `#DCFCE7` | `#00D084` on rgba(0,208,132,0.15) |
| `Occupied` | In Use | `#EA580C` on `#FFEDD5` | `#F59E0B` on rgba(245,158,11,0.15) |
| `Faulted` | Unavailable | `#DC2626` on `#FEE2E2` | `#EF4444` on rgba(239,68,68,0.15) |
| `Reserved` | Reserved | `#2563EB` on `#DBEAFE` | — |
| `Unknown` | Unknown | `#6B7280` on `#F3F4F6` | — |
| `Stale` | Data Delayed | `#D97706` on `#FEF3C7` | — |

---

## 6. Component System

### 6.1 Reusable Components (20 total)

| Component | File | Description |
|-----------|------|-------------|
| `Header` | `components/Header.tsx` | Screen top bar with back button, title, actions |
| `PrimaryButton` | `components/PrimaryButton.tsx` | Primary CTA — full-width, themed |
| `StationCard` | `components/StationCard.tsx` | Station list item card with status badge |
| `ConnectorCard` | `components/ConnectorCard.tsx` | Individual connector bay with live status |
| `FilterChip` | `components/FilterChip.tsx` | Horizontally scrollable filter pill |
| `StatusBadge` | `components/StatusBadge.tsx` | Inline status pill (Available / In Use / etc.) |
| `MetricCard` | `components/MetricCard.tsx` | Live metric display card (kWh, cost, time) |
| `ChargingGauge` | `components/ChargingGauge.tsx` | Animated circular SoC gauge |
| `ActiveSessionBanner` | `components/ActiveSessionBanner.tsx` | Persistent banner shown during active charge |
| `AppModal` | `components/AppModal.tsx` | Base modal wrapper (backdrop + container) |
| `PaymentModal` | `components/PaymentModal.tsx` | Wallet top-up with quick amount chips |
| `BookingModal` | `components/BookingModal.tsx` | 15/30/45-min slot reservation |
| `FormInputModal` | `components/FormInputModal.tsx` | Multi-field input dialogs |
| `StatusModal` | `components/StatusModal.tsx` | Rich status/info dialogs (replaces native alerts) |
| `ConfirmationModal` | `components/ConfirmationModal.tsx` | Destructive action confirmation |
| `AuthGateModal` | `components/AuthGateModal.tsx` | Guest driver login/register gate |
| `FreshnessIndicator` | `components/FreshnessIndicator.tsx` | Telemetry data freshness indicator |
| `LanguageToggle` | `components/LanguageToggle.tsx` | EN/Hindi language switcher |
| `ThreeDIcon` | `components/ThreeDIcon.tsx` | 3D-style icon rendering |

### 6.2 Modal Standard

Every modal follows this strict pattern:
1. **Backdrop:** `rgba(15, 23, 42, 0.72)` — tap outside to dismiss
2. **Container:** `borderRadius: 22`, max width 92%, max height 88%
3. **Close button:** `✕` anchored at `top: 14, right: 14`, 36×36 touch target
4. **Header:** Centered icon badge + category pill + bold title
5. **Content:** Auto-scrolling on small screens, keyboard-avoiding
6. **Action row:** Primary CTA + secondary cancel label

---

## 7. Animation & Micro-interactions

| Interaction | Implementation | Where used |
|-------------|---------------|-----------|
| Screen transitions | React Navigation native stack | All navigation |
| Button press scale | `Animated.spring` scale 0.95 | `PrimaryButton` |
| Tab icon pulse | `Animated.sequence` | Active tab indicator |
| Charging gauge animation | `Animated.timing` arc | `ChargingGauge` |
| Card appear | `Animated.FadeIn` | Station cards, session cards |
| Status badge pulse | `Animated.loop` | `ActiveSessionBanner` |
| Splash logo | `Animated.spring` scale + opacity | `SplashScreen` |

---

## 8. Bilingual Typography

The app renders all labels via `LanguageContext`. All text tokens are defined in:
- `apps/mobile/src/i18n/translations/en.ts` — English (base)
- `apps/mobile/src/i18n/translations/hi.ts` — Hindi (full translation)

**Rule:** No hardcoded string literals in screen or component files. Always use `t('key')` from `useLanguage()`.

---

## 9. Design Rules (Non-Negotiable)

1. **No hardcoded colors** in screen or component `StyleSheet` objects — use `theme.xxx` tokens.
2. **No hardcoded strings** — use `t('key')` translation strings.
3. **Status Unknown ≠ Available** — never display unknown connector state as available.
4. **All modals** must follow the standard modal pattern (Section 6.2).
5. **All screens** must be tested in both light and dark mode before marking complete.
6. **Touch targets** minimum 44×44 logical pixels for all interactive elements.
7. **Contrast ratio** minimum 4.5:1 for body text in both themes.
