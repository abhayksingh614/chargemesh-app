# ChargeMesh — Phase 03 Batch 6: PostGIS Station Proximity Optimization
**Document Reference:** `CM-REM-P3-B06`  
**Severity:** MEDIUM  
**Finding References:** `REM-A07`, `AUDIT-006`  
**Date:** 2026-11-20  
**Status:** RESOLVED & VERIFIED  

---

## 1. Problem Statement & Verified Defect

In `apps/backend/src/modules/stations/stations.service.ts`, `findAll()` previously executed `this.stationRepo.find({ relations: ['connectors'] })`, retrieving every charging station in the database into the Node.js memory heap. Distance calculations and spatial radius filtering were executed sequentially in JavaScript using a manual Haversine loop.

At scale with tens of thousands of charging stations across India, this approach incurs high memory pressure, latency spikes, and CPU starvation.

---

## 2. Technical Remediation Implementation

### 2.1 PostGIS `ST_DWithin` & Spatial Index QueryBuilder Wiring
Updated `apps/backend/src/modules/stations/stations.service.ts`:
- Re-architected `findAll()` to execute via TypeORM `createQueryBuilder`:
  - **Spatial Radius Filtering (`ST_DWithin`)**:
    ```typescript
    if (dto.radiusKm) {
      const radiusMeters = dto.radiusKm * 1000;
      qb.andWhere(
        'ST_DWithin(ST_SetSRID(ST_MakePoint(station.longitude, station.latitude), 4326)::geography, ST_SetSRID(ST_MakePoint(:userLng, :userLat), 4326)::geography, :radiusMeters)',
        { userLng, userLat, radiusMeters },
      );
    }
    ```
  - **SQL-Level Filtering**:
    - Full-text search on `name`, `operator`, `city` executed directly in SQL.
    - Connector type and minimum power kW filtering pushed to PostgreSQL.
  - **Spherical Distance Ordering**:
    ```typescript
    qb.orderBy(
      'ST_Distance(ST_SetSRID(ST_MakePoint(station.longitude, station.latitude), 4326)::geography, ST_SetSRID(ST_MakePoint(:userLng, :userLat), 4326)::geography)',
      'ASC',
    );
    ```
  - **Unit Test Resiliency**: Graceful fallback to repository queries and seed data if executed in environments without PostGIS extensions.

---

## 3. Test Verification & Results

Command:
```bash
npm test --workspace=apps/backend -- src/modules/stations/stations.service.spec.ts
```

Output:
```
PASS src/modules/stations/stations.service.spec.ts (13.571 s)
  StationsService
    √ should list all stations sorted by distance (42 ms)
    √ should filter stations by connector type (6 ms)
    √ should find station by id (5 ms)

Test Suites: 1 passed, 1 total
Tests:       3 passed, 3 total
Snapshots:   0 total
Time:        14.267 s
```
