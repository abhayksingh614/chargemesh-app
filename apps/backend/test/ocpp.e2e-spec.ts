import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { WsAdapter } from '@nestjs/platform-ws';
import WebSocket from 'ws';
import { AppModule } from '../src/app.module';
import { OcppMessageType, OcppAction } from '../src/modules/ocpp/types/ocpp.types';

describe('OCPP 1.6-J Charge Point Gateway (e2e)', () => {
  let app: INestApplication;
  let wsClient: WebSocket;
  let serverPort: number;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useWebSocketAdapter(new WsAdapter(app));
    await app.init();
    await app.listen(0);

    const address = app.getHttpServer().address();
    serverPort = typeof address === 'string' ? 3000 : address.port;
  });

  afterAll(async () => {
    if (wsClient && wsClient.readyState === WebSocket.OPEN) {
      wsClient.close();
    }
    await app.close();
  });

  it('should connect Charge Point via WebSocket and complete BootNotification flow', (done) => {
    wsClient = new WebSocket(`ws://localhost:${serverPort}/ocpp?cp=CP-TEST-001`, ['ocpp1.6']);

    wsClient.on('open', () => {
      const bootCall = JSON.stringify([
        OcppMessageType.CALL,
        'boot-msg-001',
        OcppAction.BOOT_NOTIFICATION,
        {
          chargePointVendor: 'ChargeMesh Test Simulator',
          chargePointModel: 'CMS-Fast-120',
        },
      ]);
      wsClient.send(bootCall);
    });

    wsClient.on('message', (data: any) => {
      const parsed = JSON.parse(data.toString());
      expect(parsed[0]).toBe(OcppMessageType.CALLRESULT);
      expect(parsed[1]).toBe('boot-msg-001');
      expect(parsed[2].status).toBe('Accepted');
      expect(parsed[2].interval).toBe(300);
      done();
    });

    wsClient.on('error', (err) => {
      done(err);
    });
  });
});
