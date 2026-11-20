import { BadRequestException } from '@nestjs/common';

export interface PasswordValidationResult {
  valid: boolean;
  errors: string[];
}

export interface PasswordComplexityOptions {
  minLength?: number;
  requireUppercase?: boolean;
  requireLowercase?: boolean;
  requireDigit?: boolean;
  requireSpecial?: boolean;
  isProductionInitialAdmin?: boolean;
}

export const DEFAULT_PASSWORD_POLICY: Required<Omit<PasswordComplexityOptions, 'isProductionInitialAdmin'>> = {
  minLength: 10,
  requireUppercase: true,
  requireLowercase: true,
  requireDigit: true,
  requireSpecial: true,
};

export function validatePasswordComplexity(
  password: string,
  options: PasswordComplexityOptions = {},
): PasswordValidationResult {
  const minLength = options.isProductionInitialAdmin
    ? Math.max(options.minLength || 12, 12)
    : (options.minLength ?? DEFAULT_PASSWORD_POLICY.minLength);

  const requireUppercase = options.requireUppercase ?? DEFAULT_PASSWORD_POLICY.requireUppercase;
  const requireLowercase = options.requireLowercase ?? DEFAULT_PASSWORD_POLICY.requireLowercase;
  const requireDigit = options.requireDigit ?? DEFAULT_PASSWORD_POLICY.requireDigit;
  const requireSpecial = options.requireSpecial ?? DEFAULT_PASSWORD_POLICY.requireSpecial;

  const errors: string[] = [];

  if (!password || password.length < minLength) {
    errors.push(`Password must be at least ${minLength} characters long`);
  }
  if (requireUppercase && !/[A-Z]/.test(password || '')) {
    errors.push('Password must contain at least one uppercase letter (A-Z)');
  }
  if (requireLowercase && !/[a-z]/.test(password || '')) {
    errors.push('Password must contain at least one lowercase letter (a-z)');
  }
  if (requireDigit && !/[0-9]/.test(password || '')) {
    errors.push('Password must contain at least one numeric digit (0-9)');
  }
  if (requireSpecial && !/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password || '')) {
    errors.push('Password must contain at least one special character (!@#$%^&*...)');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

export function assertPasswordComplexity(
  password: string,
  options: PasswordComplexityOptions = {},
): void {
  const result = validatePasswordComplexity(password, options);
  if (!result.valid) {
    throw new BadRequestException(result.errors.join('; '));
  }
}
