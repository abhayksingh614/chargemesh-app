# ChargeMesh — EV Vehicle Database

> **Version:** 1.2.5 | **Updated:** 2026-08-24  
> **Canonical Source:** `apps/mobile/src/data/evCatalog.json`

---

## 1. Overview

The ChargeMesh EV vehicle catalog is a curated database of electric vehicles available in India. It powers the **Add Vehicle** flow in the mobile app, allowing users to select their exact vehicle make, model, and variant for accurate charging compatibility checking.

---

## 2. Data Source & Architecture

```
Canonical Source
└── apps/mobile/src/data/evCatalog.json   ← Single source of truth (JSON)
    └── Accessed via TypeScript in AddVehicleScreen and MyVehiclesScreen

Canonical Rule:
  evCatalog.json → AddVehicleScreen / MyVehiclesScreen → Vehicle selector UI
```

- **Do not** maintain duplicate EV data outside `evCatalog.json`
- **Do not** hardcode vehicle specs in TypeScript files
- To add or update a vehicle, edit only `evCatalog.json`

---

## 3. JSON Data Model

### Top-Level Structure

```json
{
  "brands": [
    {
      "id": "tata",
      "name": "Tata Motors",
      "logoEmoji": "🚗",
      "models": [ ... ]
    }
  ]
}
```

### Brand Object

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | Unique brand ID (lowercase, hyphenated) |
| `name` | `string` | Display name of the brand |
| `logoEmoji` | `string` | Emoji used as brand icon in the UI |
| `models` | `Model[]` | Array of vehicle models for this brand |

### Model Object

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | Unique model ID within the brand |
| `name` | `string` | Display name of the model |
| `variants` | `Variant[]` | Array of trim/battery variants |

### Variant Object

| Field | Type | Unit | Description |
|-------|------|------|-------------|
| `name` | `string` | — | Trim/variant name (e.g., "Empowered+ Long Range") |
| `batteryCapacityKwh` | `number` | kWh | Usable battery capacity |
| `maxDcPowerKw` | `number` | kW | Maximum DC fast charging rate |
| `maxAcPowerKw` | `number` | kW | Maximum AC charging rate |
| `rangeKm` | `number` | km | Manufacturer claimed range |
| `connectorTypes` | `string[]` | — | Supported connector standards |

---

## 4. Supported Connector Types

| Code | Standard | Type |
|------|----------|------|
| `CCS2` | Combined Charging System 2 | DC Fast Charging |
| `TYPE2` | IEC 62196 Type 2 (Mennekes) | AC Charging |
| `CHAdeMO` | CHAdeMO standard | DC Fast Charging (legacy) |
| `BHARAT_AC001` | Bharat AC-001 | AC (3.3 kW, India standard) |
| `BHARAT_DC001` | Bharat DC-001 | DC (15 kW, India standard) |

> **Current catalog:** Most vehicles use `CCS2` (DC) + `TYPE2` (AC). Bharat standards and CHAdeMO are present in mock station data but not currently in the EV catalog variants.

---

## 5. Brand & Model Catalog (Summary)

### 🚗 Tata Motors
| Model | Variants | Battery Range | DC Power |
|-------|----------|--------------|----------|
| Nexon EV | Empowered+, Max, Medium Range | 30–45 kWh | 30–60 kW |
| Punch EV | Long Range, Standard | 25–35 kWh | 30–50 kW |
| Tiago EV | Long Range, Medium Range | 19.2–24 kWh | 15–50 kW |
| Curvv EV | Long Range | ~55 kWh | 70 kW |

### 🚐 Mahindra Electric
| Model | Variants | Battery Range | DC Power |
|-------|----------|--------------|----------|
| XEV 9e | Long Range, Standard | ~79 kWh | up to 175 kW |
| BE 6e | Long Range, Standard | ~59 kWh | up to 175 kW |
| XUV400 EV | Pro, EC Pro | 39.4 kWh | 50 kW |

### 🚖 MG Motor
| Model | Variants | Battery Range | DC Power |
|-------|----------|--------------|----------|
| ZS EV | Excite Pro, Exclusive Pro | 50.3 kWh | 76 kW |
| Comet EV | Style, Play, Pace | 17.3 kWh | 3.3 kW AC only |
| Windsor EV | Essence, Excite | 38 kWh | 60 kW |

### 🚕 Hyundai
| Model | Variants | Battery Range | DC Power |
|-------|----------|--------------|----------|
| Ioniq 5 | Standard Range, Long Range | 58–72.6 kWh | 220 kW |
| Ioniq 6 | Standard Range, Long Range | 53–77.4 kWh | 220 kW |

### 🚘 Kia
| Model | Variants | Battery Range | DC Power |
|-------|----------|--------------|----------|
| EV6 | GT Line AWD, GT Line RWD | 77.4 kWh | 350 kW |
| EV9 | GT Line AWD | 99.8 kWh | 350 kW |

### 🔋 BYD
| Model | Variants | Battery Range | DC Power |
|-------|----------|--------------|----------|
| Atto 3 | Superior, Dynamic | 49.92–60.48 kWh | 70–80 kW |
| Seal | Performance AWD, Premium, Dynamic | 61.44–82.56 kWh | 110–150 kW |
| eMAX 7 | Superior, Premium | 55.4–71.8 kWh | 89–115 kW |

### 🚙 Citroën
| Model | Variants | Battery Range | DC Power |
|-------|----------|--------------|----------|
| ë-C3 | Shine, Feel | 29.2 kWh | 30 kW |

### 🏎️ BMW
| Model | Variants | Battery Range | DC Power |
|-------|----------|--------------|----------|
| iX1 | xDrive30 | 66.5 kWh | 130 kW |
| i4 | eDrive40 | 83.9 kWh | 205 kW |
| iX | xDrive50 | 111.5 kWh | 195 kW |

### ⭐ Mercedes-Benz
| Model | Variants | Battery Range | DC Power |
|-------|----------|--------------|----------|
| EQA | 250+ | 70.5 kWh | 100 kW |
| EQE SUV | 500 4MATIC | 90.6 kWh | 170 kW |
| EQS Sedan | 580 4MATIC | 107.8 kWh | 200 kW |

### 🛡️ Volvo
| Model | Variants | Battery Range | DC Power |
|-------|----------|--------------|----------|
| EX40 / XC40 Recharge | Twin Motor, Single Motor | 69–78 kWh | 130–150 kW |
| C40 Recharge | Twin Motor | 78 kWh | 150 kW |

---

## 6. How to Add a New Vehicle

1. Open `apps/mobile/src/data/evCatalog.json`
2. Find the matching brand entry (or add a new brand object)
3. Add a new model under the brand's `models` array
4. Add variant(s) with accurate specs (`batteryCapacityKwh`, `maxDcPowerKw`, `maxAcPowerKw`, `rangeKm`, `connectorTypes`)
5. Use the exact connector type codes from Section 4

**Do not** add data to `stateDistrictMaster.ts` or any other TypeScript file — only the JSON is the canonical source.

---

## 7. Future Enhancements (Planned)

- Vehicle image assets per model
- Additional regional brands (Ola, Euler, Greaves)
- Two-wheeler EV catalog (Ola Electric, Ather, TVS)
- Real-time spec updates from manufacturer API
- Vehicle-to-station compatibility scoring
