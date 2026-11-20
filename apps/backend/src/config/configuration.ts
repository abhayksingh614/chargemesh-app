export interface DatabaseConfig {
  host: string;
  port: number;
  name: string;
  user: string;
  password?: string;
  ssl: boolean;
}

export interface RedisConfig {
  host: string;
  port: number;
  password?: string;
}

export interface RateLimitConfig {
  ttl: number;
  limit: number;
}

export interface SmsConfig {
  provider: string;
  apiKey?: string;
}

export interface AppConfig {
  nodeEnv: string;
  isProduction: boolean;
  port: number;
  jwtSecret: string;
  jwtExpiresIn: string;
  ocppPort: number;
  corsOrigins: string[];
  database: DatabaseConfig;
  redis: RedisConfig;
  rateLimit: RateLimitConfig;
  sms: SmsConfig;
}

export default (): { app: AppConfig } => {
  const nodeEnv = process.env.NODE_ENV || 'development';
  const isProduction = nodeEnv === 'production';

  // SEC-003: JWT Secret resolution
  let jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    if (isProduction) {
      throw new Error(
        'FATAL SEC-003: JWT_SECRET must be configured in production environment.',
      );
    }
    jwtSecret = 'chargemesh-super-secret-jwt-key-2026';
  }

  // SEC-004: CORS Origins resolution
  const rawCors = process.env.CORS_ALLOWED_ORIGINS || process.env.CORS_ORIGINS;
  let corsOrigins: string[];
  if (rawCors) {
    corsOrigins = rawCors.split(',').map((o) => o.trim()).filter(Boolean);
  } else if (isProduction) {
    corsOrigins = [
      'https://admin.chargemesh.com',
      'https://app.chargemesh.com',
    ];
  } else {
    corsOrigins = [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:3001',
      '*',
    ];
  }

  return {
    app: {
      nodeEnv,
      isProduction,
      port: parseInt(process.env.PORT || process.env.BACKEND_PORT || '3000', 10),
      jwtSecret,
      jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
      ocppPort: parseInt(process.env.OCPP_PORT || '9000', 10),
      corsOrigins,
      database: {
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5434', 10),
        name: process.env.DB_NAME || 'chargemesh_dev',
        user: process.env.DB_USER || 'chargemesh',
        password: process.env.DB_PASSWORD || 'chargemesh_dev_password',
        ssl: process.env.DB_SSL === 'true',
      },
      redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379', 10),
        password: process.env.REDIS_PASSWORD || undefined,
      },
      rateLimit: {
        ttl: parseInt(process.env.RATE_LIMIT_TTL_SECONDS || '60', 10) * 1000,
        limit: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
      },
      sms: {
        provider: process.env.SMS_PROVIDER || (isProduction ? 'production-stub' : 'mock'),
        apiKey: process.env.SMS_API_KEY || process.env.SMS_PROVIDER_API_KEY || undefined,
      },
    },
  };
};
