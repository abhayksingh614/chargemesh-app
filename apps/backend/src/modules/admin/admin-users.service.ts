import { Injectable, NotFoundException } from '@nestjs/common';
import { UserProfile, UserGender, ConnectorType, AuditActionType, AdminRole } from '@chargemesh/shared-types';
import { AdminAuditService } from './admin-audit.service';

@Injectable()
export class AdminUsersService {
  private readonly users: Map<string, UserProfile & { status: 'ACTIVE' | 'SUSPENDED' | 'BANNED'; adminNotes?: string }> = new Map();

  constructor(private readonly auditService: AdminAuditService) {
    const demoUser: UserProfile & { status: 'ACTIVE' | 'SUSPENDED' | 'BANNED'; adminNotes?: string } = {
      id: 'usr-abhay-01',
      name: 'Abhay Singh',
      firstName: 'Abhay',
      lastName: 'Singh',
      phoneNumber: '+91 98765 43210',
      email: 'abhay@gmail.com',
      dob: '1993-11-22',
      gender: UserGender.MALE,
      state: 'Uttar Pradesh',
      district: 'Gautam Buddha Nagar',
      city: 'Noida',
      pincode: '201301',
      address: 'Tower 4, Sector 62, Electronic City',
      userCode: 'CM-DRV-6399',
      membershipTier: 'ChargeMesh Elite Member',
      memberSince: 'November 2023',
      walletBalancePaise: 204000,
      totalKwhCharged: 428.5,
      co2SavedKg: 351.4,
      totalSessions: 18,
      authProvider: 'phone',
      joiningBonusStatus: 'CREDITED',
      joiningBonusAmountPaise: 10000,
      profileCompletionPercentage: 90,
      status: 'ACTIVE',
      adminNotes: 'Verified EV fleet owner, clean transaction record',
      chargingPreferences: {
        preferredSpeed: 'ULTRA_FAST',
        preferredConnector: ConnectorType.CCS2,
        preferredNetworks: ['Tata Power EZ Charge', 'Jio-bp pulse', 'Zeon Charging'],
        searchRadiusKm: 25,
        autoFilterIncompatible: true,
      },
    };

    const demoUser2: UserProfile & { status: 'ACTIVE' | 'SUSPENDED' | 'BANNED'; adminNotes?: string } = {
      id: 'usr-rahul-02',
      name: 'Rahul Sharma',
      firstName: 'Rahul',
      lastName: 'Sharma',
      phoneNumber: '+91 98111 22334',
      email: 'rahul.sharma@example.com',
      dob: '1990-05-14',
      gender: UserGender.MALE,
      state: 'NCT Of Delhi',
      district: 'South Delhi',
      city: 'New Delhi',
      pincode: '110017',
      address: 'Saket District Centre, Sector 3',
      userCode: 'CM-DRV-1042',
      membershipTier: 'ChargeMesh Pro Member',
      memberSince: 'January 2024',
      walletBalancePaise: 85000,
      totalKwhCharged: 195.2,
      co2SavedKg: 138.6,
      totalSessions: 9,
      authProvider: 'phone',
      joiningBonusStatus: 'CREDITED',
      joiningBonusAmountPaise: 10000,
      profileCompletionPercentage: 85,
      status: 'ACTIVE',
    };

    const demoUser3: UserProfile & { status: 'ACTIVE' | 'SUSPENDED' | 'BANNED'; adminNotes?: string } = {
      id: 'usr-ananya-03',
      name: 'Ananya Roy',
      firstName: 'Ananya',
      lastName: 'Roy',
      phoneNumber: '+91 97222 33445',
      email: 'ananya.roy@example.com',
      dob: '1995-08-20',
      gender: UserGender.FEMALE,
      state: 'Haryana',
      district: 'Gurugram',
      city: 'Gurugram',
      pincode: '122002',
      address: 'DLF Phase 5, Golf Course Road',
      userCode: 'CM-DRV-8821',
      membershipTier: 'ChargeMesh Member',
      memberSince: 'March 2024',
      walletBalancePaise: 32000,
      totalKwhCharged: 84.0,
      co2SavedKg: 59.6,
      totalSessions: 4,
      authProvider: 'google',
      joiningBonusStatus: 'CREDITED',
      joiningBonusAmountPaise: 10000,
      profileCompletionPercentage: 75,
      status: 'ACTIVE',
    };

    this.users.set(demoUser.id, demoUser);
    this.users.set(demoUser2.id, demoUser2);
    this.users.set(demoUser3.id, demoUser3);
  }

  async findAll(query?: { search?: string; status?: string; page?: number; pageSize?: number }) {
    let result = Array.from(this.users.values());

    if (query?.search) {
      const s = query.search.toLowerCase();
      result = result.filter(
        (u) =>
          u.name.toLowerCase().includes(s) ||
          u.phoneNumber.includes(s) ||
          u.email.toLowerCase().includes(s) ||
          (u.userCode && u.userCode.toLowerCase().includes(s)),
      );
    }

    if (query?.status) {
      result = result.filter((u) => u.status === query.status);
    }

    const page = Number(query?.page) || 1;
    const pageSize = Number(query?.pageSize) || 20;
    const total = result.length;
    const paginated = result.slice((page - 1) * pageSize, page * pageSize);

    return {
      success: true,
      data: paginated,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  }

  async findById(id: string) {
    const user = this.users.get(id);
    if (!user) {
      throw new NotFoundException(`Driver ${id} not found`);
    }
    return user;
  }

  async updateStatus(
    id: string,
    status: 'ACTIVE' | 'SUSPENDED' | 'BANNED',
    reason: string,
    adminActor: { id: string; name: string; role: AdminRole },
  ) {
    const user = this.users.get(id);
    if (!user) {
      throw new NotFoundException(`Driver ${id} not found`);
    }

    const previousStatus = user.status;
    user.status = status;

    await this.auditService.record({
      actorId: adminActor.id,
      actorName: adminActor.name,
      actorRole: adminActor.role,
      action: status === 'ACTIVE' ? AuditActionType.USER_REACTIVATE : AuditActionType.USER_SUSPEND,
      targetEntity: 'USER',
      targetId: user.id,
      previousValue: { status: previousStatus },
      newValue: { status },
      reason,
      ipAddress: '127.0.0.1',
    });

    return user;
  }
}
