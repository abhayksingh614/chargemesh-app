import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { WsAdapter } from '@nestjs/platform-ws';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const logger = new Logger('ChargeMesh-Backend');
  const app = await NestFactory.create(AppModule, { rawBody: true });
  const configService = app.get(ConfigService);

  // SEC-013: HTTP Security Headers via Helmet
  app.use(
    helmet({
      contentSecurityPolicy: false, // Disabled for pure REST/WebSocket API endpoints
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    }),
  );

  app.useWebSocketAdapter(new WsAdapter(app));

  // Enable trusted proxy for accurate client IP rate limiting behind reverse proxies
  const expressApp = app.getHttpAdapter().getInstance();
  if (process.env.TRUST_PROXY === 'true' || process.env.NODE_ENV === 'production') {
    expressApp.set('trust proxy', 1);
  }

  // SEC-004: Production CORS Allowlist validation
  const corsOrigins = configService.get<string[]>('app.corsOrigins') || [];
  const isProduction = process.env.NODE_ENV === 'production';

  app.enableCors({
    origin: (origin, callback) => {
      // Allow non-browser requests (mobile native apps, curl, internal service calls)
      if (!origin) {
        return callback(null, true);
      }

      // Check explicit origin allowlist
      if (corsOrigins.includes(origin)) {
        return callback(null, true);
      }

      // In non-production, allow wildcard if configured
      if (!isProduction && corsOrigins.includes('*')) {
        return callback(null, true);
      }

      logger.warn(`Rejected unauthorized CORS origin request from: ${origin}`);
      return callback(new Error(`CORS policy violation: Origin '${origin}' is not authorized`), false);
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: false,
    }),
  );

  app.useGlobalInterceptors(new TransformInterceptor());
  app.useGlobalFilters(new AllExceptionsFilter());

  const port = process.env.PORT || 3000;
  await app.listen(port);
  logger.log(`⚡ ChargeMesh Backend API & OCPP Hub running on http://localhost:${port}`);
}

bootstrap();
