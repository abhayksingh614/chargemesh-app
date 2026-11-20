import { BadRequestException } from '@nestjs/common';
import {
  validatePasswordComplexity,
  assertPasswordComplexity,
} from './password-policy.util';

describe('Password Policy Utility (AUTH-001)', () => {
  it('should pass strong password satisfying all criteria', () => {
    const result = validatePasswordComplexity('ChargeMesh@2026!');
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
    expect(() => assertPasswordComplexity('ChargeMesh@2026!')).not.toThrow();
  });

  it('should reject passwords shorter than 10 characters', () => {
    const result = validatePasswordComplexity('Short@1');
    expect(result.valid).toBe(false);
    expect(result.errors).toEqual(
      expect.arrayContaining(['Password must be at least 10 characters long']),
    );
  });

  it('should enforce 12 character minimum for production initial admin', () => {
    const result = validatePasswordComplexity('Valid@12345', { isProductionInitialAdmin: true });
    expect(result.valid).toBe(false);
    expect(result.errors).toEqual(
      expect.arrayContaining(['Password must be at least 12 characters long']),
    );
  });

  it('should reject passwords missing uppercase characters', () => {
    const result = validatePasswordComplexity('lowercase@12345');
    expect(result.valid).toBe(false);
    expect(result.errors).toEqual(
      expect.arrayContaining(['Password must contain at least one uppercase letter (A-Z)']),
    );
  });

  it('should reject passwords missing numeric digits', () => {
    const result = validatePasswordComplexity('NoDigitsHere@Special');
    expect(result.valid).toBe(false);
    expect(result.errors).toEqual(
      expect.arrayContaining(['Password must contain at least one numeric digit (0-9)']),
    );
  });

  it('should reject passwords missing special characters', () => {
    const result = validatePasswordComplexity('NoSpecial12345678');
    expect(result.valid).toBe(false);
    expect(result.errors).toEqual(
      expect.arrayContaining([
        'Password must contain at least one special character (!@#$%^&*...)',
      ]),
    );
  });

  it('should throw BadRequestException on invalid password assertion', () => {
    expect(() => assertPasswordComplexity('weak')).toThrow(BadRequestException);
  });
});
