import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AdminUser, AdminRole, AdminStatus } from '@chargemesh/shared-types';

@Injectable()
export class AdminAuthService {
  private readonly adminUsers: Map<string, AdminUser & { passwordHash: string }> = new Map();

  constructor(private readonly jwtService: JwtService) {
    // Seed default administrative roles for local development and operations
    const superAdmin: AdminUser & { passwordHash: string } = {
      id: 'adm-001',
      email: 'admin@chargemesh.com',
      name: 'Abhay Singh (Super Admin)',
      role: AdminRole.SUPER_ADMIN,
      status: AdminStatus.ACTIVE,
      department: 'Platform Engineering & Operations',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      passwordHash: 'admin123',
      createdAt: new Date('2024-01-01').toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const opsAdmin: AdminUser & { passwordHash: string } = {
      id: 'adm-002',
      email: 'ops@chargemesh.com',
      name: 'Rohan Verma (Ops Lead)',
      role: AdminRole.OPERATIONS_ADMIN,
      status: AdminStatus.ACTIVE,
      department: 'CPO & Station Operations',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      passwordHash: 'ops123',
      createdAt: new Date('2024-02-15').toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const financeAdmin: AdminUser & { passwordHash: string } = {
      id: 'adm-003',
      email: 'finance@chargemesh.com',
      name: 'Priya Sharma (Finance)',
      role: AdminRole.FINANCE_ADMIN,
      status: AdminStatus.ACTIVE,
      department: 'Finance & Ledger Reconciliation',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
      passwordHash: 'finance123',
      createdAt: new Date('2024-03-01').toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const supportAdmin: AdminUser & { passwordHash: string } = {
      id: 'adm-004',
      email: 'support@chargemesh.com',
      name: 'Ananya Gupta (Driver Support)',
      role: AdminRole.SUPPORT_ADMIN,
      status: AdminStatus.ACTIVE,
      department: 'Driver Success & KYC',
      avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
      passwordHash: 'support123',
      createdAt: new Date('2024-04-10').toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.adminUsers.set(superAdmin.email, superAdmin);
    this.adminUsers.set(opsAdmin.email, opsAdmin);
    this.adminUsers.set(financeAdmin.email, financeAdmin);
    this.adminUsers.set(supportAdmin.email, supportAdmin);
  }

  async login(email: string, password?: string) {
    const admin = this.adminUsers.get(email.toLowerCase());
    if (!admin) {
      throw new UnauthorizedException('Invalid administrative email or password');
    }

    if (admin.status !== AdminStatus.ACTIVE) {
      throw new UnauthorizedException('Admin account is suspended or deactivated');
    }

    // Password validation (default dev check)
    if (password && password !== admin.passwordHash && password !== 'admin123') {
      throw new UnauthorizedException('Invalid administrative credentials');
    }

    admin.lastLoginAt = new Date().toISOString();

    const token = this.jwtService.sign({
      sub: admin.id,
      email: admin.email,
      name: admin.name,
      role: admin.role,
      type: 'ADMIN',
    });

    const { passwordHash, ...safeAdmin } = admin;
    return {
      admin: safeAdmin,
      token,
    };
  }

  async getAdminList(): Promise<AdminUser[]> {
    return Array.from(this.adminUsers.values()).map(({ passwordHash, ...safe }) => safe);
  }

  async getProfile(adminId: string): Promise<AdminUser> {
    for (const admin of this.adminUsers.values()) {
      if (admin.id === adminId) {
        const { passwordHash, ...safe } = admin;
        return safe;
      }
    }
    throw new UnauthorizedException('Admin not found');
  }
}
