import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { StationsService } from './stations.service';
import { OcppService } from '../ocpp/ocpp.service';
import { TelemetryService } from '../telemetry/telemetry.service';
import { ChargingStationEntity, ConnectorEntity } from '../../database/entities';

describe('StationsService', () => {
  let service: StationsService;
  let module: TestingModule;

  const mockStations: Partial<ChargingStationEntity>[] = [
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
      amenities: ['Café', 'Restrooms', 'WiFi', '24/7 Security'],
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
      ],
    },
    {
      id: 'st-noida-003',
      chargePointId: 'CP-NOIDA-003',
      name: 'Sector 62 Fleet Station',
      operator: 'Zeon Charging',
      address: 'Electronic City, Sector 62, Noida',
      city: 'Noida',
      latitude: 28.6280,
      longitude: 77.3649,
      rating: 4.6,
      totalReviews: 89,
      amenities: ['Restrooms', 'Security'],
      status: 'ACTIVE',
      connectors: [
        {
          id: 'conn-05',
          stationId: 'st-noida-003',
          connectorNumber: 1,
          type: 'CHADEMO',
          powerKw: 50,
          status: 'AVAILABLE',
          pricePerKwh: 17.5,
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

  beforeEach(async () => {
    module = await Test.createTestingModule({
      providers: [
        StationsService,
        OcppService,
        TelemetryService,
        { provide: getRepositoryToken(ChargingStationEntity), useValue: mockStationRepo },
        { provide: getRepositoryToken(ConnectorEntity), useValue: mockConnectorRepo },
      ],
    }).compile();

    service = module.get<StationsService>(StationsService);
  });

  afterAll(async () => {
    await module.close();
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
