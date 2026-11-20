import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  Max,
  validateSync,
  ValidationError,
} from 'class-validator';

export enum Environment {
  Development = 'development',
  Production = 'production',
  Test = 'test',
}

export class EnvironmentVariables {
  @IsEnum(Environment)
  @IsOptional()
  NODE_ENV: Environment = Environment.Development;

  @IsNumber()
  @Min(1)
  @Max(65535)
  @IsOptional()
  PORT: number = 3000;

  @IsNumber()
  @Min(1)
  @Max(65535)
  @IsOptional()
  OCPP_PORT: number = 9000;

  @IsString()
  @IsOptional()
  JWT_SECRET?: string;

  @IsString()
  @IsOptional()
  JWT_EXPIRES_IN: string = '7d';

  @IsString()
  @IsOptional()
  CORS_ORIGINS?: string;

  @IsString()
  @IsOptional()
  CORS_ALLOWED_ORIGINS?: string;

  @IsString()
  @IsOptional()
  DB_HOST: string = 'localhost';

  @IsNumber()
  @Min(1)
  @Max(65535)
  @IsOptional()
  DB_PORT: number = 5434;

  @IsString()
  @IsOptional()
  DB_NAME: string = 'chargemesh_dev';

  @IsString()
  @IsOptional()
  DB_USER: string = 'chargemesh';

  @IsString()
  @IsOptional()
  DB_PASSWORD?: string;

  @IsString()
  @IsOptional()
  REDIS_HOST: string = 'localhost';

  @IsNumber()
  @Min(1)
  @Max(65535)
  @IsOptional()
  REDIS_PORT: number = 6379;

  @IsString()
  @IsOptional()
  REDIS_PASSWORD?: string;

  @IsString()
  @IsOptional()
  ADMIN_INITIAL_EMAIL?: string;

  @IsString()
  @IsOptional()
  ADMIN_INITIAL_PASSWORD?: string;

  @IsString()
  @IsOptional()
  SMS_PROVIDER?: string;

  @IsString()
  @IsOptional()
  SMS_API_KEY?: string;
}

const DEFAULT_INSECURE_JWT = 'chargemesh-super-secret-jwt-key-2026';

export function validateEnvironment(config: Record<string, unknown>): Record<string, unknown> {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validatedConfig, { skipMissingProperties: false });

  const errorMessages: string[] = [];

  if (errors.length > 0) {
    const formatValidationErrors = (errs: ValidationError[]): void => {
      for (const err of errs) {
        if (err.constraints) {
          errorMessages.push(...Object.values(err.constraints));
        }
        if (err.children && err.children.length > 0) {
          formatValidationErrors(err.children);
        }
      }
    };
    formatValidationErrors(errors);
  }

  const nodeEnv = (config.NODE_ENV as string) || Environment.Development;
  const isProduction = nodeEnv === Environment.Production;
  const jwtSecret = config.JWT_SECRET as string | undefined;

  // SEC-003: Strict production validation for JWT Secret
  if (isProduction) {
    if (!jwtSecret || jwtSecret.trim() === '') {
      errorMessages.push(
        'FATAL SEC-003 CONFIG ERROR: In production, JWT_SECRET must be explicitly set and non-empty.',
      );
    } else if (jwtSecret === DEFAULT_INSECURE_JWT) {
      errorMessages.push(
        'FATAL SEC-003 CONFIG ERROR: Default development JWT_SECRET is strictly forbidden in production.',
      );
    } else if (jwtSecret.length < 32) {
      errorMessages.push(
        'FATAL SEC-003 CONFIG ERROR: In production, JWT_SECRET must be at least 32 characters long.',
      );
    }
  }

  if (errorMessages.length > 0) {
    throw new Error(
      `ChargeMesh Configuration Validation Failed:\n  - ${errorMessages.join('\n  - ')}`,
    );
  }

  return config;
}
