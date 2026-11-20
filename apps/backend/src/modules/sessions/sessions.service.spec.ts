import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { SessionsService } from './sessions.service';
import { StationsService } from '../stations/stations.service';
import { OcppService } from '../ocpp/ocpp.service';
import { TelemetryService } from '../telemetry/telemetry.service';
import {
  ChargingSessionEntity,
  MeterValueEntity,
  ChargingStationEntity,
  ConnectorEntity,
  UserEntity,
} from '../../database/entities';
import { BadRequestException } from '@nestjs/common';

describe('SessionsService', () => {
  let service: SessionsService;
  let module: TestingModule;

  const mockSessionRepo = {
    create: jest.fn().mockImplementation((dto) => dto),
    save: jest.fn().mockImplementation((val) => Promise.resolve(val)),
    update: jest.fn().mockResolvedValue({ affected: 1 }),
    findOne: jest.fn().mockResolvedValue(null),
    findOneBy: jest.fn().mockResolvedValue(null),
    find: jest.fn().mockResolvedValue([]),
  };

  const mockMeterRepo = {
    save: jest.fn().mockImplementation((val) => Promise.resolve(val)),
  };

  const mockStations = [
    {
      id: 'st-delhi-001',
      chargePointId: 'CP-DELHI-001',
      name: 'Connaught Place Supercharge Hub',
      operator: 'Tata Power EZ Charge',
      address: 'Outer Circle, Near Metro Gate 4, New Delhi',
      city: 'New Delhi',
      latitude: 28.6315,
      longitude: 77.2167,
      rating: 4.8,
      totalReviews: 142,
      amenities: ['Café'],
      status: 'ACTIVE',
      connectors: [
        {
          id: 'conn-01',
          stationId: 'st-delhi-001',
          connectorNumber: 1,
          type: 'CCS2',
          powerKw: 60,
          status: 'AVAILABLE',
          pricePerKwh: 18.5,
          lastUpdated: new Date(),
          station: null as any,
        },
        {
          id: 'conn-02',
          stationId: 'st-delhi-001',
          connectorNumber: 2,
          type: 'CCS2',
          powerKw: 60,
          status: 'AVAILABLE',
          pricePerKwh: 18.5,
          lastUpdated: new Date(),
          station: null as any,
        },
      ],
    },
  ];

  const mockStationRepo = {
    find: jest.fn().mockResolvedValue(mockStations),
    findOne: jest.fn().mockImplementation(({ where }) => {
      const targetId = Array.isArray(where) ? where[0].id : where.id || where.chargePointId;
      return Promise.resolve(mockStations.find((s) => s.id === targetId || s.chargePointId === targetId) || null);
    }),
  };

  const mockConnectorRepo = {
    save: jest.fn().mockImplementation((val) => Promise.resolve(val)),
  };

  const mockUserRepo = {
    findOneBy: jest.fn().mockImplementation(({ id }) => {
      if (id === 'usr-broke') {
        return Promise.resolve({ id: 'usr-broke', walletBalancePaise: 5000 }); // ₹50.00
      }
      return Promise.resolve({ id: 'usr-123', walletBalancePaise: 50000 }); // ₹500.00
    }),
  };

  beforeEach(async () => {
    module = await Test.createTestingModule({
      providers: [
        SessionsService,
        StationsService,
        OcppService,
        TelemetryService,
        { provide: getRepositoryToken(ChargingSessionEntity), useValue: mockSessionRepo },
        { provide: getRepositoryToken(MeterValueEntity), useValue: mockMeterRepo },
        { provide: getRepositoryToken(ChargingStationEntity), useValue: mockStationRepo },
        { provide: getRepositoryToken(ConnectorEntity), useValue: mockConnectorRepo },
        { provide: getRepositoryToken(UserEntity), useValue: mockUserRepo },
      ],
    }).compile();

    service = module.get<SessionsService>(SessionsService);
  });

  afterAll(async () => {
    await module.close();
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

  it('REM-A05: should reject session start if driver wallet balance is below pre-authorization threshold', async () => {
    await expect(
      service.startSession('usr-broke', {
        stationId: 'st-delhi-001',
        connectorId: 'conn-01',
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('REM-A05: should accept session start when driver has sufficient balance', async () => {
    const session = await service.startSession('usr-123', {
      stationId: 'st-delhi-001',
      connectorId: 'conn-01',
    });
    expect(session.status).toBe('CHARGING');
  });
});
