import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { WsAdapter } from '@nestjs/platform-ws';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { TransformInterceptor } from '../src/common/interceptors/transform.interceptor';
import { AllExceptionsFilter } from '../src/common/filters/http-exception.filter';

describe('ChargeMesh Backend Hub (e2e)', () => {
  jest.setTimeout(30000);
  let app: INestApplication;
  let jwtToken: string;

  beforeAll(async () => {
    console.log('[E2E DEBUG] Step 1: createTestingModule');
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    console.log('[E2E DEBUG] Step 2: createNestApplication');
    app = moduleFixture.createNestApplication();
    app.useWebSocketAdapter(new WsAdapter(app));
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    app.useGlobalInterceptors(new TransformInterceptor());
    app.useGlobalFilters(new AllExceptionsFilter());

    console.log('[E2E DEBUG] Step 3: app.init');
    await app.init();
    console.log('[E2E DEBUG] Step 4: done init');
  }, 60000);

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  it('/api/v1/auth/login (POST) - should authenticate driver and return JWT', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({
        phoneNumber: '+919876543210',
        otp: '123456',
      })
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
    jwtToken = res.body.data.token;
  });

  it('/api/v1/stations (GET) - should list nearby stations', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/v1/stations?lat=28.6315&lng=77.2167&radiusKm=20')
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
    expect(res.body.data[0].connectors).toBeDefined();
  });

  it('/api/v1/sessions/start (POST) & /api/v1/sessions/:id/stop (POST) - full lifecycle', async () => {
    // 1. Start Session
    const startRes = await request(app.getHttpServer())
      .post('/api/v1/sessions/start')
      .set('Authorization', `Bearer ${jwtToken}`)
      .send({
        stationId: 'st-delhi-001',
        connectorId: 'conn-01',
        target: {
          type: 'SOC',
          value: 85,
        },
      })
      .expect(201);

    expect(startRes.body.success).toBe(true);
    const sessionId = startRes.body.data.id;
    expect(sessionId).toBeDefined();
    expect(startRes.body.data.status).toBe('CHARGING');

    // 2. Query Session State
    const queryRes = await request(app.getHttpServer())
      .get(`/api/v1/sessions/${sessionId}`)
      .expect(200);

    expect(queryRes.body.success).toBe(true);
    expect(queryRes.body.data.id).toBe(sessionId);

    // 3. Stop Session
    const stopRes = await request(app.getHttpServer())
      .post(`/api/v1/sessions/${sessionId}/stop`)
      .set('Authorization', `Bearer ${jwtToken}`)
      .send({
        reason: 'User Reached Target',
      })
      .expect(201);

    expect(stopRes.body.success).toBe(true);
    expect(stopRes.body.data.status).toBe('COMPLETED');
  });

  it('/health & /health/ready (GET) - DevOps liveness and readiness probe', async () => {
    const healthRes = await request(app.getHttpServer())
      .get('/health')
      .expect(200);

    expect(healthRes.body.success).toBe(true);
    expect(healthRes.body.data.status).toBe('ok');
    expect(healthRes.body.data.service).toBe('chargemesh-backend');

    const readyRes = await request(app.getHttpServer())
      .get('/health/ready')
      .expect(200);

    expect(readyRes.body.success).toBe(true);
    expect(readyRes.body.data.checks.database).toBe('connected');
  });
});
