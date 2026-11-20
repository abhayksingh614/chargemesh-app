import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from './roles.guard';
import { AdminRole } from '@chargemesh/shared-types';

describe('RolesGuard (Administrative RBAC SEC-009 & SEC-010)', () => {
  let guard: RolesGuard;
  let reflector: Reflector;

  beforeEach(() => {
    reflector = new Reflector();
    guard = new RolesGuard(reflector);
  });

  function createMockExecutionContext(user?: any): ExecutionContext {
    return {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: () => ({
        getRequest: () => ({ user }),
      }),
    } as unknown as ExecutionContext;
  }

  it('should allow access if no roles are required on handler or class', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);
    const context = createMockExecutionContext({ role: 'DRIVER' });

    expect(guard.canActivate(context)).toBe(true);
  });

  it('should throw ForbiddenException if user is not authenticated', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([AdminRole.SUPER_ADMIN]);
    const context = createMockExecutionContext(undefined);

    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });

  it('should throw ForbiddenException if driver role attempts to access admin endpoint', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([AdminRole.SUPER_ADMIN]);
    const context = createMockExecutionContext({
      id: 'usr-driver-1',
      role: 'driver',
      type: 'DRIVER',
    });

    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });

  it('should throw ForbiddenException if user has wrong admin role', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([AdminRole.SUPER_ADMIN]);
    const context = createMockExecutionContext({
      id: 'usr-admin-1',
      role: AdminRole.SUPPORT_ADMIN,
      type: 'ADMIN',
    });

    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });

  it('should allow access if user has required admin role', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([
      AdminRole.SUPER_ADMIN,
      AdminRole.FINANCE_ADMIN,
    ]);
    const context = createMockExecutionContext({
      id: 'usr-admin-fin',
      role: AdminRole.FINANCE_ADMIN,
      type: 'ADMIN',
    });

    expect(guard.canActivate(context)).toBe(true);
  });
});
