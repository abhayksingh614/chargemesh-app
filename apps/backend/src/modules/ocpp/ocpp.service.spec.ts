import { Test, TestingModule } from '@nestjs/testing';
import { OcppService } from './ocpp.service';
import { TelemetryService } from '../telemetry/telemetry.service';
import { OcppMessageType, OcppAction } from './types/ocpp.types';

describe('OcppService', () => {
  let service: OcppService;
  let telemetryService: TelemetryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OcppService, TelemetryService],
    }).compile();

    service = module.get<OcppService>(OcppService);
    telemetryService = module.get<TelemetryService>(TelemetryService);
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
});
