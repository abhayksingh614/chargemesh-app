# EV Charging Station Discovery Workflow

> **Component:** Geospatial Search & Connector Status Aggregator  
> **Source:** `apps/backend/src/modules/stations`, `apps/mobile/src/context/FilterContext.tsx`, `apps/mobile/src/screens/MapScreen.tsx`  

This document illustrates the station discovery workflow, from GPS coordinate acquisition to multi-criteria filtering and status freshness validation.

---

## 1. Discovery Pipeline Flowchart

```mermaid
flowchart TD
    Start["Driver Opens Map or Discovery View"] --> GeoChoice{"Location Mode?"}

    GeoChoice -->|"GPS Location"| GPSCoords["Acquire Driver Coords (Lat/Lng)"]
    GeoChoice -->|"District Search"| GeoMaster["Lookup Selected District in stateDistrictMaster.json\n(e.g., Connaught Place, New Delhi)"]

    GPSCoords --> QueryBuilder["Construct Search Request\n- Latitude & Longitude\n- Radius (default 15 km)\n- Vehicle Connector Types\n- Only Available Flag"]
    GeoMaster --> QueryBuilder

    QueryBuilder --> ApiReq["GET /api/v1/stations?lat=...&lng=...&radiusKm=15"]
    ApiReq --> SpatialEngine["Backend Stations Engine\n- Calculates Distance (Haversine / PostGIS)\n- Filters by Radius Bounds"]

    SpatialEngine --> FilterEngine["Apply Driver Constraints\n- Match Connector Type (CCS2, Type 2, GB/T, Bharat DC)\n- Minimum Power Filter (e.g. >= 50 kW Fast Charger)\n- Maximum Tariff Limit (INR/kWh)"]

    FilterEngine --> FreshnessEngine["Evaluate Freshness State\n- Age < 120s ➔ LIVE\n- 120s <= Age <= 300s ➔ RECENT\n- Age > 300s ➔ STALE (Warning Badge)"]

    FreshnessEngine --> StatusRule{"Connector Status Evaluation"}
    StatusRule -->|"Status AVAILABLE"| MarkAvailable["Tag Connector as AVAILABLE"]
    StatusRule -->|"Status UNKNOWN"| MarkUnknown["Display UNKNOWN (Never show as Available!)"]
    StatusRule -->|"Status IN_USE"| MarkOccupied["Tag Connector as OCCUPIED"]
    StatusRule -->|"Status OFFLINE"| MarkOffline["Tag Connector as OFFLINE"]

    MarkAvailable & MarkUnknown & MarkOccupied & MarkOffline --> RenderMap["Render Station Clusters & Cards on MapLibre GL\n- Sorted by Proximity\n- Displays Power, Tariff & Freshness Badge"]
```

---

## 2. Canonical Status Freshness Matrix

ChargeMesh enforces strict reliability rules to prevent "phantom availability":

| Status | Age Condition | UI Representation | Booking Allowed |
| :--- | :--- | :--- | :--- |
| **AVAILABLE (LIVE)** | Age < 120 seconds | 🟢 Green Badge ("Available") | Yes |
| **AVAILABLE (RECENT)** | 120s ≤ Age ≤ 300s | 🟡 Amber-Green Badge ("Updated 3m ago") | Yes |
| **AVAILABLE (STALE)** | Age > 300 seconds | ⚠️ Orange Warning ("Stale Data — Verify On Site") | Conditional Warning |
| **IN_USE / OCCUPIED** | Real-time | 🔵 Blue Badge ("In Use — Charging") | No |
| **UNKNOWN** | No recent heartbeat | ⚪ Grey Badge ("Status Unknown") | **Blocked (Never assume Available)** |
| **OFFLINE / FAULTED** | Hardware fault reported | 🔴 Red Badge ("Offline / Out of Service") | Blocked |
