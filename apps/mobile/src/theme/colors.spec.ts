import { ConnectorStatus } from '@chargemesh/shared-types';
import { colors, getStatusColor } from './colors';

describe('Mobile Colors & Theme (TEST-004 Smoke Test)', () => {
  it('should return green available color for AVAILABLE connector', () => {
    const res = getStatusColor(ConnectorStatus.AVAILABLE);
    expect(res.color).toBe(colors.status.available);
    expect(res.label).toBe('Available');
  });

  it('should NEVER return green for UNKNOWN status (UI/UX Safety Directive)', () => {
    const res = getStatusColor(ConnectorStatus.UNKNOWN);
    expect(res.color).not.toBe(colors.status.available);
    expect(res.color).toBe(colors.status.unknown);
    expect(res.label).toBe('Status Unknown');
  });

  it('should return danger red for UNAVAILABLE or OFFLINE connectors', () => {
    const unavail = getStatusColor(ConnectorStatus.UNAVAILABLE);
    const offline = getStatusColor(ConnectorStatus.OFFLINE);
    expect(unavail.color).toBe(colors.status.unavailable);
    expect(offline.color).toBe(colors.status.unavailable);
  });

  it('should return warning amber for STALE data', () => {
    const res = getStatusColor(ConnectorStatus.STALE);
    expect(res.color).toBe(colors.status.stale);
    expect(res.label).toBe('Data Delayed');
  });

  it('should return warning orange for IN_USE connectors', () => {
    const res = getStatusColor(ConnectorStatus.IN_USE);
    expect(res.color).toBe(colors.status.inUse);
    expect(res.label).toBe('In Use');
  });
});
