# ChargeMesh Admin Dashboard — UI/UX Design System & Layout Specification

This document defines the desktop enterprise information architecture, page layouts, design tokens, color hierarchy, and component guidelines for the ChargeMesh Admin Portal.

---

## 1. Information Architecture & Navigation Structure

```text
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│ [⚡ ChargeMesh Ops]        [ 🔍 Global Search: Drivers, Stations, TxID ]   [🔔]  [Admin ▼]│
├───────────────────┬─────────────────────────────────────────────────────────────────────┤
│ 📊 Dashboard      │                                                                     │
│ 👥 Users & Drivers│                                                                     │
│ 🔌 CPO Networks   │                         PAGE CONTENT VIEW                           │
│ 📍 Stations & Map │                                                                     │
│ ⚡ Live Chargers  │  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐        │
│ 📅 Bookings       │  │  Metric Card 1  │ │  Metric Card 2  │ │  Metric Card 3  │        │
│ ⏱️ Charging Log   │  └─────────────────┘ └─────────────────┘ └─────────────────┘        │
│ 💳 Finance Ledger │                                                                     │
│ 💰 Fast Wallet    │  ┌───────────────────────────────────────────────────────────────┐  │
│ 🚗 EV Master      │  │                 DataTable / Interactive View                  │  │
│ 🌱 Sustainability │  └───────────────────────────────────────────────────────────────┘  │
│ 📢 Broadcasts     │                                                                     │
│ 🛡️ Audit Logs     │                                                                     │
│ ⚙️ Settings       │                                                                     │
└───────────────────┴─────────────────────────────────────────────────────────────────────┘
```

---

## 2. Design Tokens & Theme Colors

The Admin Portal maintains seamless visual harmony with the mobile driver application while utilizing higher enterprise data density:

### 2.1 Brand & Functional Colors
- **Primary Accent**: Forest Green `#16A34A` (Active items, confirmed status, CTA buttons)
- **Primary Dark Surface**: Deep Charcoal/Navy `#0F172A` (Sidebar background, hero banners)
- **Eco Surface**: Mint Glass `#ECFDF5` / `#064E3B` in dark mode (Eco badges, green stats)

### 2.2 Semantic Status Indicators

| Status | Text Color | Light Surface | Dark Surface | Meaning / Enforcement |
| :--- | :--- | :--- | :--- | :--- |
| **Available** | `#16A34A` (Green) | `#DCFCE7` | `#052E16` | Confirmed operational and ready to charge. |
| **In Use** | `#EA580C` (Orange) | `#FFEDD5` | `#431407` | Active charging session in progress. |
| **Unavailable / Faulted** | `#DC2626` (Red) | `#FEE2E2` | `#450A0A` | Confirmed fault or out of service. |
| **Stale Data** | `#D97706` (Amber) | `#FEF3C7` | `#451A03` | Data older than 300s. Warning badge shown. |
| **Unknown** | `#6B7280` (Gray) | `#F3F4F6` | `#1F2937` | **CRITICAL: Never displayed as green!** |
| **Reserved** | `#2563EB` (Blue) | `#DBEAFE` | `#172554` | Driver booking confirmed. |

---

## 3. Core Component Guidelines

1. **Enterprise DataTables**: Standardized tables with server-side pagination, multi-column sorting, sticky header rows, CSV export, and bulk selection.
2. **Telemetry Graphs**: Line charts for real-time load distribution (kW vs. Time) and bar charts for daily revenue using Recharts.
3. **MapLibre Interactive Explorer**: Full-width station map with CPO color pins and cluster views for dense urban areas (Delhi NCR, Mumbai, Bengaluru).
4. **Audit Modal Workflows**: Any action that alters financial state or station availability must open an auditable modal requiring a mandatory reason field before submission.
