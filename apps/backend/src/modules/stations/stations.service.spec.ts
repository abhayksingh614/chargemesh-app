import { Test, TestingModule } from '@nestjs/testing';
import { StationsService } from './stations.service';
import { OcppService } from '../ocpp/ocpp.service';
import { TelemetryService } from '../telemetry/telemetry.service';

describe('StationsService', () => {
  let service: StationsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StationsService, OcppService, TelemetryService],
    }).compile();

    service = module.get<StationsService>(StationsService);
  });

  it('should list all stations sorted by distance', async () => {
    const stations = await service.findAll({ lat: 28.6315, lng: 77.2167 });
    expect(stations.length).toBeGreaterThan(0);
    expect(stations[0].id).toBe('st-delhi-001');
    expect(stations[0].distanceKm).toBeCloseTo(0, 0);
  });

  it('should filter stations by connector type', async () => {
    const stations = await service.findAll({ connectorType: 'CHADEMO' });
    expect(stations.every((s) => s.connectors.some((c) => c.type === 'CHADEMO'))).toBe(true);
  });

  it('should find station by id', async () => {
    const station = await service.findById('st-delhi-001');
    expect(station).toBeDefined();
    expect(station.name).toContain('Connaught Place');
  });
});
