import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException, BadRequestException } from '@nestjs/common';
import { AdminAuthService } from './admin-auth.service';
import { AdminRole } from '@chargemesh/shared-types';
import { AdminUserEntity } from '../../database/entities';

describe('AdminAuthService (Security & Bcrypt Verification)', () => {
  let service: AdminAuthService;
  let module: TestingModule;

  const mockAdminRepo = {
    findOneBy: jest.fn().mockResolvedValue(null),
    update: jest.fn().mockResolvedValue({ affected: 1 }),
    find: jest.fn().mockResolvedValue([]),
    save: jest.fn().mockImplementation((val) => Promise.resolve(val)),
  };

  beforeEach(async () => {
    module = await Test.createTestingModule({
      providers: [
        AdminAuthService,
        { provide: getRepositoryToken(AdminUserEntity), useValue: mockAdminRepo },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue('mock.jwt.admin.token'),
          },
        },
      ],
    }).compile();

    service = module.get<AdminAuthService>(AdminAuthService);
  });

  afterAll(async () => {
    await module.close();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('Administrative Login', () => {
    it('should successfully authenticate with valid dev credentials and return safe admin object', async () => {
      const result = await service.login('admin@chargemesh.com', 'Dev@ChargeMesh2026!');
      expect(result).toHaveProperty('token', 'mock.jwt.admin.token');
      expect(result.admin.email).toBe('admin@chargemesh.com');
      expect(result.admin.role).toBe(AdminRole.SUPER_ADMIN);
      expect((result.admin as any).passwordHash).toBeUndefined();
    });

    it('should reject login when password is incorrect', async () => {
      await expect(
        service.login('admin@chargemesh.com', 'WrongPassword123!'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should reject former hardcoded default password "admin123"', async () => {
      await expect(
        service.login('admin@chargemesh.com', 'admin123'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should reject login when password is empty or undefined', async () => {
      await expect(
        service.login('admin@chargemesh.com', ''),
      ).rejects.toThrow(UnauthorizedException);
      await expect(
        service.login('admin@chargemesh.com', undefined),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should reject login for non-existent admin email with generic message', async () => {
      await expect(
        service.login('hacker@unknown.org', 'AnyPassword123!'),
      ).rejects.toThrow('Invalid administrative credentials');
    });
  });

  describe('Password Change & Complexity', () => {
    it('should successfully change password when current password matches and new password meets complexity', async () => {
      const changeRes = await service.changePassword(
        'adm-001',
        'Dev@ChargeMesh2026!',
        'NewSecurePass2026!',
      );
      expect(changeRes.success).toBe(true);

      // Verify old password no longer works
      await expect(
        service.login('admin@chargemesh.com', 'Dev@ChargeMesh2026!'),
      ).rejects.toThrow(UnauthorizedException);

      // Verify new password works
      const loginRes = await service.login('admin@chargemesh.com', 'NewSecurePass2026!');
      expect(loginRes.token).toBe('mock.jwt.admin.token');
      expect(mockAdminRepo.update).toHaveBeenCalledWith(
        'adm-001',
        expect.objectContaining({
          passwordHash: expect.any(String),
          updatedAt: expect.any(Date),
        }),
      );
    });

    it('should reject password change if current password is wrong', async () => {
      await expect(
        service.changePassword('adm-001', 'IncorrectCurrent!', 'NewSecurePass2026!'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should reject new password shorter than 8 characters', async () => {
      await expect(
        service.changePassword('adm-001', 'Dev@ChargeMesh2026!', 'Short1!'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject new password without numbers', async () => {
      await expect(
        service.changePassword('adm-001', 'Dev@ChargeMesh2026!', 'AllLettersOnly!'),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('Super Admin Password Reset', () => {
    it('should allow super admin to reset password with generated temporary password', async () => {
      const resetRes = await service.resetPasswordBySuperAdmin('adm-002');
      expect(resetRes.success).toBe(true);
      expect(resetRes.temporaryPassword).toBeDefined();

      // Verify login with temporary password
      const loginRes = await service.login('ops@chargemesh.com', resetRes.temporaryPassword);
      expect(loginRes.admin.email).toBe('ops@chargemesh.com');
      expect(mockAdminRepo.update).toHaveBeenCalledWith(
        'adm-002',
        expect.objectContaining({
          passwordHash: expect.any(String),
          updatedAt: expect.any(Date),
        }),
      );
    });
  });
});
