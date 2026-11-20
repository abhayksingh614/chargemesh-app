import {
  validateAdminDataConsistency,
  INITIAL_STATIONS,
  INITIAL_CPOS,
  INITIAL_DRIVERS,
  INITIAL_TRANSACTIONS,
} from './dataService';

describe('Admin DataService (TEST-003 Smoke Test)', () => {
  it('should validate canonical admin data consistency with zero errors', () => {
    const result = validateAdminDataConsistency();
    expect(result.isValid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it('should verify canonical stations collection', () => {
    expect(INITIAL_STATIONS.length).toBe(20);
    for (const station of INITIAL_STATIONS) {
      expect(station.id).toBeDefined();
      expect(station.name).toBeDefined();
      expect(station.coordinates.latitude).toBeGreaterThan(0);
      expect(station.coordinates.longitude).toBeGreaterThan(0);
      expect(station.connectors.length).toBeGreaterThan(0);
      expect(station.totalConnectors).toBe(station.connectors.length);
    }
  });

  it('should verify canonical CPO interoperability partners', () => {
    expect(INITIAL_CPOS.length).toBe(12);
    const activeCpos = INITIAL_CPOS.filter((c) => c.integrationStatus === 'ACTIVE');
    expect(activeCpos.length).toBeGreaterThan(0);
  });

  it('should verify driver wallet balance Paise to INR consistency', () => {
    const abhay = INITIAL_DRIVERS.find((d) => d.id === 'usr-abhay-01');
    expect(abhay).toBeDefined();
    expect(abhay!.walletBalancePaise).toBeGreaterThan(0);
  });

  it('should verify finance ledger transactions integrity', () => {
    expect(INITIAL_TRANSACTIONS.length).toBeGreaterThan(0);
    for (const tx of INITIAL_TRANSACTIONS) {
      expect(tx.id).toBeDefined();
      expect(tx.amountInr).toBeGreaterThan(0);
      expect(['SUCCESS', 'PENDING', 'FAILED']).toContain(tx.status);
    }
  });
});
