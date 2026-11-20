import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { OcppService } from './ocpp.service';
import { TelemetryService } from '../telemetry/telemetry.service';
import { OcppMessageType, OcppAction } from './types/ocpp.types';
import { ChargingStationEntity, ChargingSessionEntity, UserEntity } from '../../database/entities';
import * as bcrypt from 'bcrypt';

describe('OcppService', () => {
  let service: OcppService;
  let telemetryService: TelemetryService;
  let module: TestingModule;

  const mockStationRepo = {
    findOneBy: jest.fn().mockImplementation(({ chargePointId }) => {
      if (chargePointId === 'CP-SECURE-001') {
        return Promise.resolve({
          id: 'st-sec-01',
          chargePointId: 'CP-SECURE-001',
          chargePointPassword: bcrypt.hashSync('SuperSecretOcpp@2026', 10),
          status: 'ACTIVE',
        });
      }
      return Promise.resolve(null);
    }),
  };

  beforeEach(async () => {
    module = await Test.createTestingModule({
      providers: [
        OcppService,
        TelemetryService,
        {
          provide: getRepositoryToken(ChargingStationEntity),
          useValue: mockStationRepo,
        },
        {
          provide: getRepositoryToken(ChargingSessionEntity),
          useValue: {
            find: jest.fn().mockResolvedValue([]),
            update: jest.fn().mockResolvedValue({ affected: 1 }),
          },
        },
        {
          provide: getRepositoryToken(UserEntity),
          useValue: { findOneBy: jest.fn().mockResolvedValue(null) },
        },
      ],
    }).compile();

    service = module.get<OcppService>(OcppService);
    telemetryService = module.get<TelemetryService>(TelemetryService);
  });

  afterAll(async () => {
    service.onModuleDestroy();
    await module.close();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should handle BootNotification and return Accepted', async () => {
    const bootMessage = JSON.stringify([
      OcppMessageType.CALL,
      'msg-101',
      OcppAction.BOOT_NOTIFICATION,
      {
        chargePointVendor: 'Delta Electronics',
        chargePointModel: 'UFC200',
      },
    ]);

    const res = await service.handleIncomingMessage('CP-DELHI-001', bootMessage);
    expect(res).toBeDefined();

    const parsedRes = JSON.parse(res!);
    expect(parsedRes[0]).toBe(OcppMessageType.CALLRESULT);
    expect(parsedRes[1]).toBe('msg-101');
    expect(parsedRes[2].status).toBe('Accepted');
    expect(parsedRes[2].interval).toBe(300);
  });

  it('should handle Heartbeat and return currentTime', async () => {
    const hbMessage = JSON.stringify([
      OcppMessageType.CALL,
      'msg-102',
      OcppAction.HEARTBEAT,
      {},
    ]);

    const res = await service.handleIncomingMessage('CP-DELHI-001', hbMessage);
    const parsedRes = JSON.parse(res!);
    expect(parsedRes[0]).toBe(OcppMessageType.CALLRESULT);
    expect(parsedRes[1]).toBe('msg-102');
    expect(parsedRes[2].currentTime).toBeDefined();
  });

  it('should handle StartTransaction and assign transactionId', async () => {
    const startMsg = JSON.stringify([
      OcppMessageType.CALL,
      'msg-103',
      OcppAction.START_TRANSACTION,
      {
        connectorId: 1,
        idTag: 'TAG-DRIVER-99',
        meterStart: 12000,
        timestamp: new Date().toISOString(),
      },
    ]);

    const res = await service.handleIncomingMessage('CP-DELHI-001', startMsg);
    const parsedRes = JSON.parse(res!);
    expect(parsedRes[0]).toBe(OcppMessageType.CALLRESULT);
    expect(parsedRes[2].transactionId).toBeGreaterThan(0);
    expect(parsedRes[2].idTagInfo.status).toBe('Accepted');
  });

  it('should handle MeterValues and trigger telemetry stream', async () => {
    const emitSpy = jest.spyOn(telemetryService, 'emitTelemetry');

    // First start transaction #1001
    const startMsg = JSON.stringify([
      OcppMessageType.CALL,
      'msg-104',
      OcppAction.START_TRANSACTION,
      {
        connectorId: 1,
        idTag: 'TAG-DRIVER-99',
        meterStart: 0,
        timestamp: new Date().toISOString(),
      },
    ]);
    const startRes = JSON.parse((await service.handleIncomingMessage('CP-DELHI-001', startMsg))!);
    const txId = startRes[2].transactionId;

    const meterMsg = JSON.stringify([
      OcppMessageType.CALL,
      'msg-105',
      OcppAction.METER_VALUES,
      {
        connectorId: 1,
        transactionId: txId,
        meterValue: [
          {
            timestamp: new Date().toISOString(),
            sampledValue: [
              { measurand: 'SoC', value: '45' },
              { measurand: 'Power.Active.Import', value: '55.2', unit: 'kW' },
              { measurand: 'Energy.Active.Import.Register', value: '12.4', unit: 'kWh' },
            ],
          },
        ],
      },
    ]);

    await service.handleIncomingMessage('CP-DELHI-001', meterMsg);
    expect(emitSpy).toHaveBeenCalled();
  });

  describe('Charger Security & Credential Verification (SEC-011)', () => {
    it('should successfully authenticate charge point with Bcrypt hashed password via HTTP Basic Auth', async () => {
      const authHeader = `Basic ${Buffer.from('CP-SECURE-001:SuperSecretOcpp@2026').toString('base64')}`;
      const authResult = await service.authenticateChargePoint('CP-SECURE-001', authHeader);
      expect(authResult.authorized).toBe(true);
    });

    it('should reject charge point with invalid Basic Auth password', async () => {
      const authHeader = `Basic ${Buffer.from('CP-SECURE-001:WrongPassword123').toString('base64')}`;
      const authResult = await service.authenticateChargePoint('CP-SECURE-001', authHeader);
      expect(authResult.authorized).toBe(false);
      expect(authResult.reason).toBe('Invalid charge point credentials');
    });

    it('should reject charge point when Basic Auth header is missing for secured station', async () => {
      const authResult = await service.authenticateChargePoint('CP-SECURE-001', undefined);
      expect(authResult.authorized).toBe(false);
      expect(authResult.reason).toBe('Missing Basic authorization header');
    });
  });

  describe('MeterValues Invariant & Telemetry Hardening', () => {
    it('should ignore negative power and sanitize negative energy values to enforce monotonic progression', async () => {
      // Start transaction #1002
      const startMsg = JSON.stringify([
        OcppMessageType.CALL,
        'msg-201',
        OcppAction.START_TRANSACTION,
        {
          connectorId: 1,
          idTag: 'TAG-DRIVER-100',
          meterStart: 5000,
          timestamp: new Date().toISOString(),
        },
      ]);
      const startRes = JSON.parse((await service.handleIncomingMessage('CP-DELHI-001', startMsg))!);
      const txId = startRes[2].transactionId;

      // Legitimate reading: 10 kWh
      const validMeterMsg = JSON.stringify([
        OcppMessageType.CALL,
        'msg-202',
        OcppAction.METER_VALUES,
        {
          connectorId: 1,
          transactionId: txId,
          meterValue: [
            {
              timestamp: new Date().toISOString(),
              sampledValue: [
                { measurand: 'Energy.Active.Import.Register', value: '10.0', unit: 'kWh' },
              ],
            },
          ],
        },
      ]);
      await service.handleIncomingMessage('CP-DELHI-001', validMeterMsg);

      let tx = service.getActiveTransaction(txId);
      // Cumulative register is 10 kWh minus 5 kWh meterStart = 5 kWh net consumed
      expect(tx?.energyKwh).toBe(5.0);

      // Malicious negative or lower reading attempting to reverse telemetry: 5.0 kWh cumulative register (0 kWh net)
      const lowerMeterMsg = JSON.stringify([
        OcppMessageType.CALL,
        'msg-203',
        OcppAction.METER_VALUES,
        {
          connectorId: 1,
          transactionId: txId,
          meterValue: [
            {
              timestamp: new Date().toISOString(),
              sampledValue: [
                { measurand: 'Energy.Active.Import.Register', value: '5.0', unit: 'kWh' },
              ],
            },
          ],
        },
      ]);
      await service.handleIncomingMessage('CP-DELHI-001', lowerMeterMsg);

      tx = service.getActiveTransaction(txId);
      // Energy reading must remain monotonically non-decreasing (at least 5.0 kWh)
      expect(tx?.energyKwh).toBe(5.0);
    });
  });
});
