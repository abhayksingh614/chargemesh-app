import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { AdminUser, AdminRole, AdminStatus } from '@chargemesh/shared-types';
import { assertPasswordComplexity } from '../../common/utils/password-policy.util';
import { AdminUserEntity } from '../../database/entities';

export interface AdminUserRecord extends AdminUser {
  passwordHash: string;
}

@Injectable()
export class AdminAuthService {
  private readonly logger = new Logger(AdminAuthService.name);
  private readonly adminUsers: Map<string, AdminUserRecord> = new Map();
  private readonly SALT_ROUNDS = 12;

  constructor(
    private readonly jwtService: JwtService,
    @InjectRepository(AdminUserEntity)
    private readonly adminRepo: Repository<AdminUserEntity>,
  ) {
    this.seedInitialAdmins();
  }

  private seedInitialAdmins() {
    const isProduction = process.env.NODE_ENV === 'production';
    const initialEmail = process.env.ADMIN_INITIAL_EMAIL?.trim().toLowerCase();
    const initialPassword = process.env.ADMIN_INITIAL_PASSWORD;

    if (isProduction) {
      if (initialEmail && initialPassword) {
        assertPasswordComplexity(initialPassword, { isProductionInitialAdmin: true });
        const hashedPassword = bcrypt.hashSync(initialPassword, this.SALT_ROUNDS);
        const prodAdmin: AdminUserRecord = {
          id: 'adm-prod-001',
          email: initialEmail,
          name: process.env.ADMIN_INITIAL_NAME || 'System Super Administrator',
          role: AdminRole.SUPER_ADMIN,
          status: AdminStatus.ACTIVE,
          department: 'Platform Engineering & Operations',
          passwordHash: hashedPassword,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        this.adminUsers.set(prodAdmin.email, prodAdmin);
        this.logger.log(`Provisioned initial production admin user: ${initialEmail}`);
      } else {
        this.logger.warn(
          'Running in production with NO initial admin credentials provisioned via environment. ' +
          'Set ADMIN_INITIAL_EMAIL and ADMIN_INITIAL_PASSWORD to enable administrative access.',
        );
      }
      return;
    }

    // Development / Test Environment Provisioning
    const devPassword = initialPassword || 'Dev@ChargeMesh2026!';
    const defaultPasswordHash = bcrypt.hashSync(devPassword, 10);

    const superAdmin: AdminUserRecord = {
      id: 'adm-001',
      email: initialEmail || 'admin@chargemesh.com',
      name: 'Abhay Singh (Super Admin)',
      role: AdminRole.SUPER_ADMIN,
      status: AdminStatus.ACTIVE,
      department: 'Platform Engineering & Operations',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      passwordHash: defaultPasswordHash,
      createdAt: new Date('2024-01-01').toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const opsAdmin: AdminUserRecord = {
      id: 'adm-002',
      email: 'ops@chargemesh.com',
      name: 'Rohan Verma (Ops Lead)',
      role: AdminRole.OPERATIONS_ADMIN,
      status: AdminStatus.ACTIVE,
      department: 'CPO & Station Operations',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      passwordHash: defaultPasswordHash,
      createdAt: new Date('2024-02-15').toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const financeAdmin: AdminUserRecord = {
      id: 'adm-003',
      email: 'finance@chargemesh.com',
      name: 'Priya Sharma (Finance)',
      role: AdminRole.FINANCE_ADMIN,
      status: AdminStatus.ACTIVE,
      department: 'Finance & Ledger Reconciliation',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
      passwordHash: defaultPasswordHash,
      createdAt: new Date('2024-03-01').toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const supportAdmin: AdminUserRecord = {
      id: 'adm-004',
      email: 'support@chargemesh.com',
      name: 'Ananya Gupta (Driver Support)',
      role: AdminRole.SUPPORT_ADMIN,
      status: AdminStatus.ACTIVE,
      department: 'Driver Success & KYC',
      avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
      passwordHash: defaultPasswordHash,
      createdAt: new Date('2024-04-10').toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.adminUsers.set(superAdmin.email, superAdmin);
    this.adminUsers.set(opsAdmin.email, opsAdmin);
    this.adminUsers.set(financeAdmin.email, financeAdmin);
    this.adminUsers.set(supportAdmin.email, supportAdmin);
  }

  async login(email: string, password?: string) {
    if (!email || !password) {
      throw new UnauthorizedException('Invalid administrative credentials');
    }

    const cleanEmail = email.toLowerCase().trim();
    let admin = this.adminUsers.get(cleanEmail);

    if (!admin) {
      try {
        const dbAdmin = await this.adminRepo.findOneBy({ email: cleanEmail });
        if (dbAdmin) {
          admin = {
            id: dbAdmin.id,
            email: dbAdmin.email,
            name: dbAdmin.name,
            role: dbAdmin.role as AdminRole,
            status: dbAdmin.status as AdminStatus,
            department: dbAdmin.department,
            passwordHash: dbAdmin.passwordHash,
            createdAt: dbAdmin.createdAt.toISOString(),
            updatedAt: dbAdmin.updatedAt.toISOString(),
          };
          this.adminUsers.set(cleanEmail, admin);
        }
      } catch {}
    }

    if (!admin) {
      // Mitigate timing attack with constant-time dummy compare
      await bcrypt.compare(password, '$2b$12$e8xXmQ1N9a8hF9qg.Y5G/eU1H6YxLhN.G8K8G8K8G8K8G8K8G8K8G');
      throw new UnauthorizedException('Invalid administrative credentials');
    }

    if (admin.status !== AdminStatus.ACTIVE) {
      throw new UnauthorizedException('Admin account is suspended or deactivated');
    }

    const isMatch = await bcrypt.compare(password, admin.passwordHash);
    if (!isMatch) {
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

    return {
      admin: this.toSafeAdmin(admin),
      token,
    };
  }

  async changePassword(adminId: string, currentPassword?: string, newPassword?: string) {
    if (!currentPassword || !newPassword) {
      throw new BadRequestException('Current and new passwords are required');
    }

    const admin = await this.findAdminById(adminId);
    if (!admin) {
      throw new UnauthorizedException('Admin account not found');
    }

    const isMatch = await bcrypt.compare(currentPassword, admin.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedException('Current password does not match');
    }

    this.validatePasswordStrength(newPassword);

    const newHash = await bcrypt.hash(newPassword, this.SALT_ROUNDS);
    admin.passwordHash = newHash;
    admin.updatedAt = new Date().toISOString();

    try {
      await this.adminRepo.update(admin.id, {
        passwordHash: newHash,
        updatedAt: new Date(),
      });
      this.logger.log(`Persisted updated password hash to database for admin ${admin.id} (${admin.email})`);
    } catch (err: any) {
      this.logger.warn(`Could not persist updated password to database for ${admin.id}: ${err.message}`);
    }

    return {
      success: true,
      message: 'Password updated successfully',
    };
  }

  async resetPasswordBySuperAdmin(targetAdminId: string, tempPassword?: string) {
    const admin = await this.findAdminById(targetAdminId);
    if (!admin) {
      throw new BadRequestException('Target admin account not found');
    }

    const generatedPassword = tempPassword || `Temp@${Date.now()}!`;
    this.validatePasswordStrength(generatedPassword);

    const newHash = await bcrypt.hash(generatedPassword, this.SALT_ROUNDS);
    admin.passwordHash = newHash;
    admin.updatedAt = new Date().toISOString();

    try {
      await this.adminRepo.update(admin.id, {
        passwordHash: newHash,
        updatedAt: new Date(),
      });
      this.logger.log(`SuperAdmin reset password hash persisted in database for admin ${admin.id} (${admin.email})`);
    } catch (err: any) {
      this.logger.warn(`Could not persist reset password to database for ${admin.id}: ${err.message}`);
    }

    return {
      success: true,
      adminId: admin.id,
      email: admin.email,
      temporaryPassword: generatedPassword,
    };
  }

  async getAdminList(): Promise<AdminUser[]> {
    try {
      const dbAdmins = await this.adminRepo.find();
      if (dbAdmins && dbAdmins.length > 0) {
        return dbAdmins.map(a => ({
          id: a.id,
          email: a.email,
          name: a.name,
          role: a.role as AdminRole,
          status: a.status as AdminStatus,
          department: a.department,
          createdAt: a.createdAt.toISOString(),
          updatedAt: a.updatedAt.toISOString(),
        }));
      }
    } catch {}
    return Array.from(this.adminUsers.values()).map(a => this.toSafeAdmin(a));
  }

  async getProfile(adminId: string): Promise<AdminUser> {
    const admin = await this.findAdminById(adminId);
    if (!admin) {
      throw new UnauthorizedException('Admin not found');
    }
    return this.toSafeAdmin(admin);
  }

  private async findAdminById(adminId: string): Promise<AdminUserRecord | undefined> {
    for (const admin of this.adminUsers.values()) {
      if (admin.id === adminId) {
        return admin;
      }
    }
    try {
      const dbAdmin = await this.adminRepo.findOneBy({ id: adminId });
      if (dbAdmin) {
        const record: AdminUserRecord = {
          id: dbAdmin.id,
          email: dbAdmin.email,
          name: dbAdmin.name,
          role: dbAdmin.role as AdminRole,
          status: dbAdmin.status as AdminStatus,
          department: dbAdmin.department,
          passwordHash: dbAdmin.passwordHash,
          createdAt: dbAdmin.createdAt.toISOString(),
          updatedAt: dbAdmin.updatedAt.toISOString(),
        };
        this.adminUsers.set(dbAdmin.email, record);
        return record;
      }
    } catch {}
    return undefined;
  }

  private toSafeAdmin(admin: AdminUserRecord): AdminUser {
    const { passwordHash: _passwordHash, ...safe } = admin;
    return safe;
  }

  private validatePasswordStrength(password: string) {
    assertPasswordComplexity(password, { minLength: 10 });
  }
}
