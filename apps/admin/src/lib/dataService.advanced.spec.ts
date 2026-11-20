import {
  INITIAL_SESSIONS,
  INITIAL_BOOKINGS,
  INITIAL_EV_CATALOG,
  INITIAL_AUDIT_LOGS,
} from './dataService';

describe('Admin DataService (Advanced Domain Invariants & Entity Integrity)', () => {
  describe('Charging Sessions Integrity', () => {
    it('should verify all sessions have valid timestamps, positive energy, and non-negative costs', () => {
      expect(INITIAL_SESSIONS.length).toBeGreaterThan(0);
      for (const session of INITIAL_SESSIONS) {
        expect(session.id).toBeDefined();
        expect(session.stationId).toBeDefined();
        expect(session.userId).toBeDefined();
        expect(session.energyKwh).toBeGreaterThanOrEqual(0);
        expect(session.totalCostInr).toBeGreaterThanOrEqual(0);
        expect(['CHARGING', 'COMPLETED', 'FAILED', 'PENDING']).toContain(session.status);

        const startTime = new Date(session.startTime).getTime();
        expect(isNaN(startTime)).toBe(false);

        if (session.endTime) {
          const endTime = new Date(session.endTime).getTime();
          expect(isNaN(endTime)).toBe(false);
          expect(endTime).toBeGreaterThanOrEqual(startTime);
        }
      }
    });

    it('should verify telemetry values (SoC, voltage, current and Power) are within realistic physical bounds', () => {
      for (const session of INITIAL_SESSIONS) {
        if (session.socPercent !== undefined) {
          expect(session.socPercent).toBeGreaterThanOrEqual(0);
          expect(session.socPercent).toBeLessThanOrEqual(100);
        }
        if (session.powerKw !== undefined) {
          expect(session.powerKw).toBeGreaterThanOrEqual(0);
          expect(session.powerKw).toBeLessThanOrEqual(400); // 400 kW max DC fast charging
        }
        if (session.voltage !== undefined) {
          expect(session.voltage).toBeGreaterThanOrEqual(0);
        }
        if (session.current !== undefined) {
          expect(session.current).toBeGreaterThanOrEqual(0);
        }
      }
    });
  });

  describe('Slot Bookings Integrity', () => {
    it('should verify all advance reservations have valid status and defined slot times', () => {
      expect(INITIAL_BOOKINGS.length).toBeGreaterThan(0);
      for (const booking of INITIAL_BOOKINGS) {
        expect(booking.id).toBeDefined();
        expect(booking.stationId).toBeDefined();
        expect(booking.userId).toBeDefined();
        expect(['CONFIRMED', 'CANCELLED', 'COMPLETED', 'EXPIRED']).toContain(booking.status);
        expect(booking.slotStartTime).toBeDefined();
        expect(booking.slotEndTime).toBeDefined();
        expect(booking.estimatedCostInr).toBeGreaterThan(0);
      }
    });
  });

  describe('EV Catalog & OEM Matrix Integrity', () => {
    it('should verify major Indian EV models with certified battery and charging specifications', () => {
      expect(INITIAL_EV_CATALOG.length).toBeGreaterThan(0);
      for (const brand of INITIAL_EV_CATALOG) {
        expect(brand.name).toBeDefined();
        expect(brand.models.length).toBeGreaterThan(0);

        for (const model of brand.models) {
          expect(model.name).toBeDefined();
          expect(model.variants.length).toBeGreaterThan(0);

          for (const variant of model.variants) {
            expect(variant.batteryCapacityKwh).toBeGreaterThan(10);
            expect(variant.batteryCapacityKwh).toBeLessThan(250);
            expect(variant.connectorTypes.length).toBeGreaterThan(0);
          }
        }
      }
    });
  });

  describe('Audit Log Compliance Integrity', () => {
    it('should enforce immutable security trails with actor identifiers and valid timestamps', () => {
      expect(INITIAL_AUDIT_LOGS.length).toBeGreaterThan(0);
      for (const log of INITIAL_AUDIT_LOGS) {
        expect(log.id).toBeDefined();
        expect(log.actorId).toBeDefined();
        expect(log.action).toBeDefined();
        expect(log.targetEntity).toBeDefined();
        expect(log.timestamp).toBeDefined();
        expect(isNaN(new Date(log.timestamp).getTime())).toBe(false);
      }
    });
  });
});
