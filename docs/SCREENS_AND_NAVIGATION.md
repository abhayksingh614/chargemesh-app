# ChargeMesh — Screens & Navigation

> **Version:** 1.2.5 | **Updated:** 2026-08-24  
> **Total Screens:** 22 | **Total Tabs:** 5

---

## Navigation Architecture

```
App Entry
└── SplashScreen
    └── OnboardingScreen (first launch only)
        └── LoginScreen
            ├── RegisterScreen
            └── MainTabNavigator
                ├── Tab 1: HomeScreen
                │   ├── StationDetailScreen
                │   │   └── PreChargeScreen
                │   │       └── QRScannerScreen
                │   │           └── LiveChargingScreen
                │   │               └── SessionCompleteScreen
                │   └── MapScreen
                │       └── StationDetailScreen (same flow)
                ├── Tab 2: MapScreen (standalone)
                ├── Tab 3: QRScannerScreen (center FAB — Scan & Charge)
                ├── Tab 4: ActivityScreen
                └── Tab 5: ProfileScreen
                    ├── MyAccountScreen
                    ├── MyVehiclesScreen
                    │   ├── AddVehicleScreen
                    │   └── VehicleScreen
                    ├── PaymentMethodsScreen
                    │   └── WalletTransactionsScreen
                    ├── FavoritesScreen
                    └── EcoSustainabilityScreen
```

---

## Screen Catalog

### Authentication Flow

#### 1. SplashScreen
- **File:** `apps/mobile/src/screens/SplashScreen.tsx`
- **Route:** `Splash`
- **Description:** Animated logo entry screen. Plays on every app launch. Auto-navigates to onboarding (first launch) or home (returning user).
- **Key Elements:** ChargeMesh logo animation, tagline, background gradient
- **Theme:** Fully themed (dark/light)

#### 2. OnboardingScreen
- **File:** `apps/mobile/src/screens/OnboardingScreen.tsx`
- **Route:** `Onboarding`
- **Description:** 3-slide EV onboarding carousel introducing ChargeMesh features.
- **Key Elements:** Slide indicators, hero illustrations, skip/next/get-started buttons
- **Theme:** Fully themed (dark/light)

#### 3. LoginScreen
- **File:** `apps/mobile/src/screens/LoginScreen.tsx`
- **Route:** `Login`
- **Description:** Multi-method login — phone OTP, Google Sign-In, Email & Password.
- **Key Elements:** Phone input, OTP field, Google button, email/password form, forgot password
- **DEV NOTE:** Demo credentials (phone + OTP `123456`) are active for testing. Remove before production.
- **Theme:** Fully themed (dark/light)

#### 4. RegisterScreen
- **File:** `apps/mobile/src/screens/RegisterScreen.tsx`
- **Route:** `Register`
- **Description:** New user registration — collects name, phone, email, and EV model.
- **Key Elements:** Form fields, EV picker, terms acceptance
- **Theme:** Fully themed (dark/light)

---

### Main Tab Navigator

The `MainTabNavigator` provides 5 persistent bottom tabs:

| Tab | Icon | Label | Screen |
|-----|------|-------|--------|
| 1 | Home | Home | `HomeScreen` |
| 2 | Map | Map | `MapScreen` |
| 3 | QR (center FAB) | Scan & Charge | `QRScannerScreen` |
| 4 | Activity | Activity | `ActivityScreen` |
| 5 | Person | Profile | `ProfileScreen` |

---

### Home & Discovery

#### 5. HomeScreen
- **File:** `apps/mobile/src/screens/HomeScreen.tsx`
- **Route:** `Home` (Tab 1)
- **Description:** Main discovery hub. Shows nearby stations, CPO filters, station cards, and active session banner.
- **Key Elements:** Hero search bar, CPO filter chips, station card list, active session banner
- **Theme:** Fully themed (dark/light)

#### 6. MapScreen
- **File:** `apps/mobile/src/screens/MapScreen.tsx`
- **Route:** `Map` (Tab 2)
- **Description:** Full-screen MapLibre map. Tap stations on the map or use the state/district picker to filter. Includes bottom-sheet station preview.
- **Key Elements:** MapLibre map, station markers (color-coded by status), bottom sheet, state/district filter, connector type filter chips
- **Theme:** Fully themed (dark/light)

#### 7. StationDetailScreen
- **File:** `apps/mobile/src/screens/StationDetailScreen.tsx`
- **Route:** `StationDetail`
- **Description:** Detailed station info including connector bays, live status, amenities, CPO info, and pricing.
- **Key Elements:** Station header, connector cards, amenity icons, pricing table, Start Charging CTA
- **Theme:** Fully themed (dark/light)

---

### Charging Flow

#### 8. PreChargeScreen
- **File:** `apps/mobile/src/screens/PreChargeScreen.tsx`
- **Route:** `PreCharge`
- **Description:** User selects charging target before starting. Options: Amount (₹), Energy (kWh), or Time (minutes).
- **Key Elements:** Target type selector, numeric input, estimated cost/time/energy display, connector selection, Start CTA
- **Theme:** Fully themed (dark/light)

#### 9. QRScannerScreen
- **File:** `apps/mobile/src/screens/QRScannerScreen.tsx`
- **Route:** `QRScanner` (Tab 3 — center FAB)
- **Description:** Native QR code scanner using CameraX + ML Kit. Scans ChargeMesh-encoded QR codes on station connectors.
- **Key Elements:** Camera viewfinder, scan frame overlay, torch toggle, manual entry fallback
- **Theme:** Overlay theme (camera-based, dark default)
- **Native:** CameraX + ML Kit (Android)

#### 10. LiveChargingScreen
- **File:** `apps/mobile/src/screens/LiveChargingScreen.tsx`
- **Route:** `LiveCharging`
- **Description:** Real-time session monitoring with live telemetry. Shows SoC gauge, energy delivered, power rate, duration, and cost accrued.
- **Key Elements:** ChargingGauge component, live metric cards, stop button, elapsed timer
- **Theme:** Fully themed (dark/light)

#### 11. SessionCompleteScreen
- **File:** `apps/mobile/src/screens/SessionCompleteScreen.tsx`
- **Route:** `SessionComplete`
- **Description:** Post-session summary showing total energy, cost, duration, and payment confirmation.
- **Key Elements:** Summary cards, payment breakdown, receipt download CTA, home/favorite buttons
- **Theme:** Fully themed (dark/light)

---

### Activity & History

#### 12. ActivityScreen
- **File:** `apps/mobile/src/screens/ActivityScreen.tsx`
- **Route:** `Activity` (Tab 4)
- **Description:** Charging history and bookings list. Shows past sessions with cost, energy, station, and date.
- **Key Elements:** Session history cards, booking cards, tabs (History / Bookings)
- **Theme:** Fully themed (dark/light)

---

### Profile & Account

#### 13. ProfileScreen
- **File:** `apps/mobile/src/screens/ProfileScreen.tsx`
- **Route:** `Profile` (Tab 5)
- **Description:** Quick profile hub. Shows user info, wallet balance widget, and navigation menu.
- **Key Elements:** User avatar, wallet widget, menu items (Account, Vehicles, Payments, Favorites, Eco, Settings)
- **Theme:** Fully themed (dark/light)

#### 14. MyAccountScreen
- **File:** `apps/mobile/src/screens/MyAccountScreen.tsx`
- **Route:** `MyAccount`
- **Description:** Full account management. Displays and allows editing of personal details, phone, email, address.
- **Key Elements:** Profile info cards, edit modal, avatar, verification badges
- **Theme:** Fully themed (dark/light)

#### 15. MyVehiclesScreen
- **File:** `apps/mobile/src/screens/MyVehiclesScreen.tsx`
- **Route:** `MyVehicles`
- **Description:** User's registered EV list. Allows setting active vehicle, viewing, and deleting vehicles.
- **Key Elements:** Vehicle cards, active indicator, add vehicle FAB, swipe-to-delete
- **Theme:** Fully themed (dark/light)

#### 16. AddVehicleScreen
- **File:** `apps/mobile/src/screens/AddVehicleScreen.tsx`
- **Route:** `AddVehicle`
- **Description:** EV catalog browser for registering a new vehicle. Filterable by make, model, and variant.
- **Key Elements:** Make picker, model picker, variant picker, vehicle spec preview
- **Theme:** Fully themed (dark/light)

#### 17. VehicleScreen
- **File:** `apps/mobile/src/screens/VehicleScreen.tsx`
- **Route:** `Vehicle`
- **Description:** Detailed vehicle info — specs, battery, charging compatibility, and connector types.
- **Key Elements:** Vehicle image placeholder, spec table, connector compatibility list
- **Theme:** Fully themed (dark/light)

---

### Payments & Wallet

#### 18. PaymentMethodsScreen
- **File:** `apps/mobile/src/screens/PaymentMethodsScreen.tsx`
- **Route:** `PaymentMethods`
- **Description:** Manage payment methods — ChargeMesh Wallet, UPI, Cards, FASTag.
- **Key Elements:** Wallet balance card, add UPI/card form, saved methods list
- **Theme:** Fully themed (dark/light)

#### 19. WalletTransactionsScreen
- **File:** `apps/mobile/src/screens/WalletTransactionsScreen.tsx`
- **Route:** `WalletTransactions`
- **Description:** Full transaction history for the ChargeMesh Wallet.
- **Key Elements:** Transaction list, credit/debit indicators, date filters
- **Theme:** Fully themed (dark/light)

---

### Discovery & Eco

#### 20. FavoritesScreen
- **File:** `apps/mobile/src/screens/FavoritesScreen.tsx`
- **Route:** `Favorites`
- **Description:** Saved favourite charging stations with inline search and connector type filters.
- **Key Elements:** Saved station cards, search bar, connector filter chips, empty state
- **Theme:** Fully themed (dark/light)

#### 21. EcoSustainabilityScreen
- **File:** `apps/mobile/src/screens/EcoSustainabilityScreen.tsx`
- **Route:** `EcoSustainability`
- **Description:** Personal eco impact dashboard. Shows CO₂ saved, green miles driven, and trees equivalent.
- **Key Elements:** Eco metric cards, progress bars, milestone badges
- **Theme:** Fully themed (dark/light)

---

## Navigation Files

| File | Description |
|------|-------------|
| `apps/mobile/src/navigation/RootStackNavigator.tsx` | Root stack — manages auth, onboarding, and main tab routing |
| `apps/mobile/src/navigation/MainTabNavigator.tsx` | 5-tab bottom navigator |

---

## Theme Coverage

All 22 screens have been audited and updated to use semantic theme tokens from `ThemeContext`. No screen uses hardcoded color values in production components.

| Mode | Status |
|------|--------|
| Light Mode | ✅ All 22 screens |
| Dark Mode | ✅ All 22 screens |
