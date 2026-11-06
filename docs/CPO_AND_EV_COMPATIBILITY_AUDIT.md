# ChargeMesh — Complete CPO & EV Compatibility Audit Report

> **Version:** 1.4.0 | **Updated:** 2026-08-26  
> **Scope:** Strictly 4-Wheeler (Passenger EV) Ecosystem in India  
> **Source Datasets:**  
> - `apps/mobile/src/data/evCatalog.json` (17 Brands, 40 Models, 63 Variants)
> - `apps/mobile/src/services/mockData.ts` (15 CPO Networks, 35 Charging Stations)

---

## 1. Integrated CPO Networks (15 Active CPOs)

| CPO ID | CPO Network Name | Party ID | Support Contact | Charger Types | Primary Connectors | Tariff Range (₹/kWh) |
| :--- | :--- | :---: | :---: | :--- | :--- | :---: |
| `cpo-tata` | **Tata Power EZ Charge** | `TP` | 1800-209-5161 | AC / DC Fast | CCS2, Type 2 | ₹18.5 |
| `cpo-jiobp` | **Jio-bp pulse** | `JB` | 1800-891-9023 | DC Ultra-Fast / AC | CCS2, Type 2 | ₹21.0 |
| `cpo-statiq` | **Statiq Grid** | `SQ` | +91-9876543210 | DC Fast / AC | CCS2, CHAdeMO, Type 2 | ₹17.5 |
| `cpo-chargezone` | **ChargeZone** | `CZ` | 1800-120-2223 | DC Fast Corridors | CCS2, Type 2 | ₹19.0 |
| `cpo-ather` | **Ather Grid** | `AG` | 1800-103-0055 | AC / Fast AC | Type 2 | ₹15.0 |
| `cpo-zeon` | **Zeon Charging** | `ZC` | 1800-572-8888 | DC Ultra-Fast | CCS2, Type 2 | ₹19.5 - ₹22.5 |
| `cpo-glida` | **Glida (Fortum Charge & Drive)** | `GL` | 1800-102-3322 | DC Ultra-Fast | CCS2, Type 2 | ₹21.0 |
| `cpo-shell` | **Shell Recharge** | `SR` | 1800-266-0115 | DC Fast Forecourts | CCS2, Type 2 | ₹22.0 |
| `cpo-magenta` | **Magenta ChargeGrid** | `MC` | 1800-419-8800 | AC / DC Fast Hubs | CCS2, Type 2 | ₹18.0 |
| `cpo-relux` | **Relux Electric** | `RE` | 1800-599-4444 | DC Fast Corridors | CCS2, Type 2 | ₹20.5 |
| `cpo-kazam` | **Kazam EV** | `KZ` | +91-9988776655 | DC Fast & AC Hubs | CCS2, Type 2 | ₹17.5 |
| `cpo-electriva` | **Electriva** | `EL` | 1800-123-9988 | Municipal Fast DC | CCS2, Type 2 | ₹16.8 |
| `cpo-lion` | **LionCharge** | `LC` | 1800-889-1122 | Highway Fast Hubs | CCS2, Type 2 | ₹19.0 |
| `cpo-goec` | **GO EC Autotech** | `GE` | 1800-890-5566 | Highway Ultra-Fast | CCS2, Type 2 | ₹21.5 |
| `cpo-blusmart` | **BluSmart Hubs** | `BS` | 1800-200-9988 | Urban Fast Multi-Bay | CCS2, Type 2 | ₹17.0 |

---

## 2. 4-Wheeler EV Manufacturers in Master Catalog (17 Brands)

| Brand | Logo | Models | Variants | Models Configured |
| :--- | :---: | :---: | :---: | :--- |
| **Tata Motors** | 🚗 | 5 | 10 | Nexon EV, Punch EV, Curvv EV, Tiago EV, Tigor EV |
| **MG Motor** | 🚙 | 3 | 5 | ZS EV, Windsor EV, Comet EV |
| **Mahindra** | ⚡ | 3 | 5 | XUV400 EV, BE 6e, XEV 9e |
| **Hyundai** | 🚙 | 3 | 4 | Ioniq 5, Creta EV, Kona Electric |
| **Kia** | 🚘 | 2 | 3 | EV6, EV9 |
| **BYD** | 🔋 | 4 | 8 | Atto 3, Seal, eMAX 7, e6 MPV |
| **Citroën** | 🚙 | 1 | 1 | ë-C3 |
| **BMW** | 🏎️ | 3 | 3 | iX1, i4, iX |
| **Mercedes-Benz** | ⭐ | 3 | 3 | EQA, EQE SUV, EQS Sedan |
| **Volvo** | 🛡️ | 2 | 3 | EX40 / XC40 Recharge, C40 Recharge |
| **Audi** | 🏎️ | 3 | 6 | Q8 e-tron, e-tron GT, e-tron SUV / Sportback |
| **Porsche** | 🏁 | 2 | 4 | Taycan, Macan Electric |
| **Jaguar** | 🐆 | 1 | 1 | I-PACE EV400 |
| **Mini** | 🇬🇧 | 2 | 2 | Cooper SE, Countryman Electric |
| **Lotus** | 🏎️ | 1 | 2 | Eletre Hyper-SUV |
| **Rolls-Royce** | 👑 | 1 | 1 | Spectre |
| **Maruti Suzuki** | 🚙 | 1 | 2 | e Vitara |
| **TOTALS** | — | **40 Models** | **63 Variants** | **100% 4-Wheeler Coverage in India** |

---

## 3. Charging Standards & Compatibility Summary

1. **Standard 4W Passenger Standard in India:**
   - **Combined Charging System 2 (CCS2)**: Standard dual-socket for DC fast charging (up to 350 kW) and Type 2 AC destination charging (up to 22 kW).
2. **AC-Only Exception:**
   - **MG Comet EV**: Type 2 AC socket only (max 7.4 kW / 3.3 kW AC; no DC pins).
