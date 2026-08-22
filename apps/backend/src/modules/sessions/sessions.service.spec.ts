import { Test, TestingModule } from '@nestjs/testing';
import { SessionsService } from './sessions.service';
import { StationsService } from '../stations/stations.service';
import { OcppService } from '../ocpp/ocpp.service';
import { TelemetryService } from '../telemetry/telemetry.service';

describe('SessionsService', () => {
  let service: SessionsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SessionsService,
        StationsService,
        OcppService,
        TelemetryService,
      ],
    }).compile();

    service = module.get<SessionsService>(SessionsService);
  });

  it('should start a session and record initial state', async () => {
    const session = await service.startSession('usr-123', {
      stationId: 'st-delhi-001',
      connectorId: 'conn-01',
      target: {
        type: 'SOC',
        value: 80,
      },
    });

    expect(session).toBeDefined();
    expect(session.id).toBeDefined();
    expect(session.status).toBe('CHARGING');
    expect(session.stationId).toBe('st-delhi-001');
  });

  it('should stop an active session and calculate final energy and cost', async () => {
    const session = await service.startSession('usr-123', {
      stationId: 'st-delhi-001',
      connectorId: 'conn-02',
    });

    const stopped = await service.stopSession(session.id, 'usr-123', 'Driver Stopped');
    expect(stopped.status).toBe('COMPLETED');
    expect(stopped.energyKwh).toBeGreaterThanOrEqual(0);
    expect(stopped.totalCostInr).toBeGreaterThanOrEqual(0);
  });
});
