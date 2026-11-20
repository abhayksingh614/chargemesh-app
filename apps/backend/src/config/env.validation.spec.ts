import { validateEnvironment } from './env.validation';

describe('Environment Validation (CFG-001 & SEC-003)', () => {
  it('should accept valid development configuration with defaults', () => {
    const config = {
      NODE_ENV: 'development',
      PORT: '3000',
    };
    expect(() => validateEnvironment(config)).not.toThrow();
  });

  it('should throw error when PORT is invalid', () => {
    const config = {
      PORT: 'invalid-port',
    };
    expect(() => validateEnvironment(config)).toThrow(
      /ChargeMesh Configuration Validation Failed/,
    );
  });

  describe('Production JWT Secret Safeguards (SEC-003)', () => {
    it('should throw fatal error in production if JWT_SECRET is missing', () => {
      const config = {
        NODE_ENV: 'production',
        PORT: '3000',
      };
      expect(() => validateEnvironment(config)).toThrow(
        /In production, JWT_SECRET must be explicitly set/,
      );
    });

    it('should throw fatal error in production if JWT_SECRET equals default development key', () => {
      const config = {
        NODE_ENV: 'production',
        JWT_SECRET: 'chargemesh-super-secret-jwt-key-2026',
      };
      expect(() => validateEnvironment(config)).toThrow(
        /Default development JWT_SECRET is strictly forbidden in production/,
      );
    });

    it('should throw fatal error in production if JWT_SECRET is less than 32 characters', () => {
      const config = {
        NODE_ENV: 'production',
        JWT_SECRET: 'too-short-secret',
      };
      expect(() => validateEnvironment(config)).toThrow(
        /In production, JWT_SECRET must be at least 32 characters long/,
      );
    });

    it('should pass production check when JWT_SECRET is strong (>= 32 chars) and custom', () => {
      const config = {
        NODE_ENV: 'production',
        PORT: '3000',
        JWT_SECRET: 'super-secure-production-charge-mesh-jwt-secret-key-2026-xyz',
      };
      expect(() => validateEnvironment(config)).not.toThrow();
    });
  });
});
