import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import {
  UserEntity,
  AdminUserEntity,
  CpoEntity,
  ChargingStationEntity,
  ConnectorEntity,
  ChargingSessionEntity,
  FinanceLedgerEntity,
  AuditLogEntity,
} from './entities';
import { AdminRole, AdminStatus } from '@chargemesh/shared-types';

@Injectable()
export class SeedService implements OnApplicationBootstrap {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
    @InjectRepository(AdminUserEntity)
    private readonly adminUserRepo: Repository<AdminUserEntity>,
    @InjectRepository(CpoEntity)
    private readonly cpoRepo: Repository<CpoEntity>,
    @InjectRepository(ChargingStationEntity)
    private readonly stationRepo: Repository<ChargingStationEntity>,
    @InjectRepository(ConnectorEntity)
    private readonly connectorRepo: Repository<ConnectorEntity>,
    @InjectRepository(ChargingSessionEntity)
    private readonly sessionRepo: Repository<ChargingSessionEntity>,
    @InjectRepository(FinanceLedgerEntity)
    private readonly financeRepo: Repository<FinanceLedgerEntity>,
    @InjectRepository(AuditLogEntity)
    private readonly auditRepo: Repository<AuditLogEntity>,
  ) {}

  async onApplicationBootstrap() {
    try {
      await this.seedAll();
    } catch (err: any) {
      this.logger.warn(`Database seeding deferred or skipped: ${err.message}`);
    }
  }

  async seedAll(): Promise<void> {
    this.logger.log('Checking database seed state...');
    await this.seedAdminUsers();
    await this.seedDrivers();
    await this.seedCpos();
    await this.seedStations();
    await this.seedSessions();
    await this.seedFinance();
    await this.seedAuditLogs();
    this.logger.log('Database seed check completed.');
  }

  private async seedSessions() {
    const count = await this.sessionRepo.count();
    if (count > 0) return;

    await this.sessionRepo.save({
      id: 'sess-seed-001',
      userId: 'usr-abhay-01',
      stationId: 'st-delhi-001',
      stationName: 'Connaught Place Supercharge Hub',
      connectorId: 'conn-01',
      connectorType: 'CCS2',
      chargePointId: 'CP-DELHI-001',
      status: 'COMPLETED',
      startTime: new Date(Date.now() - 3600000 * 5),
      endTime: new Date(Date.now() - 3600000 * 4),
      energyKwh: 32.5,
      totalCostInr: 601.25,
      pricePerKwh: 18.5,
      startSoC: 15,
      currentSoC: 80,
      powerKw: 60,
    });
    this.logger.log('Seeded completed session.');
  }

  private async seedAdminUsers() {
    const count = await this.adminUserRepo.count();
    if (count > 0) return;

    const devPasswordHash = bcrypt.hashSync('Dev@ChargeMesh2026!', 12);
    const admins: Partial<AdminUserEntity>[] = [
      {
        id: 'adm-001',
        email: 'admin@chargemesh.com',
        name: 'Abhay Singh (Platform Lead)',
        role: AdminRole.SUPER_ADMIN,
        status: AdminStatus.ACTIVE,
        department: 'Engineering & Executive',
        passwordHash: devPasswordHash,
      },
      {
        id: 'adm-002',
        email: 'ops@chargemesh.com',
        name: 'Priya Sharma (Operations)',
        role: AdminRole.OPERATIONS_ADMIN,
        status: AdminStatus.ACTIVE,
        department: 'CPO Grid Operations',
        passwordHash: devPasswordHash,
      },
      {
        id: 'adm-003',
        email: 'finance@chargemesh.com',
        name: 'Vikram Mehta (Settlements)',
        role: AdminRole.FINANCE_ADMIN,
        status: AdminStatus.ACTIVE,
        department: 'Treasury & Settlements',
        passwordHash: devPasswordHash,
      },
    ];

    await this.adminUserRepo.save(admins as AdminUserEntity[]);
    this.logger.log(`Seeded ${admins.length} initial admin users.`);
  }

  private async seedDrivers() {
    const count = await this.userRepo.count();
    if (count > 0) return;

    const drivers: Partial<UserEntity>[] = [
      {
        id: 'usr-abhay-01',
        phoneNumber: '+919876543210',
        name: 'Abhay Singh',
        email: 'abhay@gmail.com',
        vehicle: {
          make: 'Tata',
          model: 'Nexon EV Max Empowered+',
          connectorType: 'CCS2',
          batteryCapacity: 40.5,
        },
        walletBalancePaise: 204000,
        totalKwhCharged: 428.5,
        co2SavedKg: 351.4,
        totalSessions: 18,
        status: 'ACTIVE',
      },
      {
        id: 'usr-rahul-02',
        phoneNumber: '+919412602135',
        name: 'Rahul Sharma',
        email: 'rahul@gmail.com',
        vehicle: {
          make: 'MG',
          model: 'ZS EV Exclusive',
          connectorType: 'CCS2',
          batteryCapacity: 50.3,
        },
        walletBalancePaise: 150000,
        totalKwhCharged: 210.0,
        co2SavedKg: 172.2,
        totalSessions: 9,
        status: 'ACTIVE',
      },
    ];

    await this.userRepo.save(drivers as UserEntity[]);
    this.logger.log(`Seeded ${drivers.length} initial driver profiles.`);
  }

  private async seedCpos() {
    const count = await this.cpoRepo.count();
    if (count > 0) return;

    const cpos: Partial<CpoEntity>[] = [
      {
        id: 'cpo-tata',
        partyId: 'TP',
        countryCode: 'IN',
        name: 'Tata Power EZ Charge',
        protocol: 'OCPI_2_3',
        integrationStatus: 'ACTIVE',
        supportPhone: '1800-209-5161',
        supportEmail: 'customercare@tatapower.com',
        website: 'https://www.tatapower.com/evcharging',
        revenueSharePercent: 92.5,
        uptimePercent30d: 99.4,
      },
      {
        id: 'cpo-jiobp',
        partyId: 'JB',
        countryCode: 'IN',
        name: 'Jio-bp pulse',
        protocol: 'OCPI_2_3',
        integrationStatus: 'ACTIVE',
        supportPhone: '1800-891-9023',
        supportEmail: 'evsupport@jiobp.com',
        website: 'https://www.jiobp.com/pulse',
        revenueSharePercent: 90.0,
        uptimePercent30d: 98.7,
      },
      {
        id: 'cpo-zeon',
        partyId: 'ZC',
        countryCode: 'IN',
        name: 'Zeon Charging',
        protocol: 'OCPI_2_3',
        integrationStatus: 'ACTIVE',
        supportPhone: '1800-572-8989',
        supportEmail: 'care@zeoncharging.com',
        website: 'https://www.zeoncharging.com',
        revenueSharePercent: 91.0,
        uptimePercent30d: 99.1,
      },
    ];

    await this.cpoRepo.save(cpos as CpoEntity[]);
    this.logger.log(`Seeded ${cpos.length} CPO operators.`);
  }

  private async seedStations() {
    const count = await this.stationRepo.count();
    if (count > 0) return;

    const station1: Partial<ChargingStationEntity> = {
      id: 'st-delhi-001',
      chargePointId: 'CP-DELHI-001',
      name: 'Connaught Place Supercharge Hub',
      operator: 'Tata Power EZ Charge',
      cpoId: 'cpo-tata',
      address: 'Outer Circle, Near Metro Gate 4, New Delhi',
      city: 'New Delhi',
      latitude: 28.6315,
      longitude: 77.2167,
      rating: 4.8,
      totalReviews: 142,
      amenities: ['Café', 'Restrooms', 'WiFi', '24/7 Security'],
      status: 'ACTIVE',
    };

    const station2: Partial<ChargingStationEntity> = {
      id: 'st-gurgaon-002',
      chargePointId: 'CP-GURGAON-002',
      name: 'Cyber Hub Fast Charging Hub',
      operator: 'Jio-bp pulse',
      cpoId: 'cpo-jiobp',
      address: 'DLF Cyber City, Phase 2, Sector 24, Gurugram',
      city: 'Gurugram',
      latitude: 28.4950,
      longitude: 77.0895,
      rating: 4.9,
      totalReviews: 218,
      amenities: ['Mall', 'Food Court', 'Covered Parking', 'WiFi'],
      status: 'ACTIVE',
    };

    const savedS1 = await this.stationRepo.save(station1 as ChargingStationEntity);
    const savedS2 = await this.stationRepo.save(station2 as ChargingStationEntity);

    const connectors: Partial<ConnectorEntity>[] = [
      {
        id: 'conn-01',
        stationId: savedS1.id,
        connectorNumber: 1,
        type: 'CCS2',
        powerKw: 60,
        status: 'AVAILABLE',
        pricePerKwh: 18.5,
      },
      {
        id: 'conn-02',
        stationId: savedS1.id,
        connectorNumber: 2,
        type: 'CCS2',
        powerKw: 60,
        status: 'AVAILABLE',
        pricePerKwh: 18.5,
      },
      {
        id: 'conn-03',
        stationId: savedS2.id,
        connectorNumber: 1,
        type: 'CCS2',
        powerKw: 120,
        status: 'AVAILABLE',
        pricePerKwh: 21.0,
      },
      {
        id: 'conn-04',
        stationId: savedS2.id,
        connectorNumber: 2,
        type: 'Type 2 AC',
        powerKw: 22,
        status: 'AVAILABLE',
        pricePerKwh: 14.0,
      },
    ];

    await this.connectorRepo.save(connectors as ConnectorEntity[]);
    this.logger.log(`Seeded stations and connectors.`);
  }

  private async seedFinance() {
    const count = await this.financeRepo.count();
    if (count > 0) return;

    const txs: Partial<FinanceLedgerEntity>[] = [
      {
        id: 'tx-001',
        referenceId: 'CM202608251042001',
        userId: 'usr-abhay-01',
        userName: 'Abhay Singh',
        type: 'WALLET_TOPUP_UPI',
        title: '₹1,000 Added',
        amountRupees: 1000.0,
        isCredit: true,
        status: 'SUCCESS',
        dateStr: '25 Aug 2026',
        timeStr: '10:42 AM',
        rawTimestamp: Date.now() - 1000 * 60 * 45,
        paymentMethodName: 'UPI (Google Pay)',
        balanceBeforeRupees: 1040.0,
        balanceAfterRupees: 2040.0,
        remarks: 'Auto-credited instantly via NPCI UPI Gateway',
        reconciled: true,
      },
    ];

    await this.financeRepo.save(txs as FinanceLedgerEntity[]);
    this.logger.log(`Seeded initial finance ledger entries.`);
  }

  private async seedAuditLogs() {
    const count = await this.auditRepo.count();
    if (count > 0) return;

    const audits: Partial<AuditLogEntity>[] = [
      {
        id: 'aud-001',
        actorId: 'adm-001',
        actorName: 'Abhay Singh (Lead)',
        actorRole: AdminRole.SUPER_ADMIN,
        action: 'STATION_UPDATE',
        targetEntity: 'STATION',
        targetId: 'st-delhi-001',
        previousValue: { tariffPerKwh: 17.5 },
        newValue: { tariffPerKwh: 18.5 },
        reason: 'Scheduled peak tariff alignment for Cyber Hub zone',
        ipAddress: '127.0.0.1',
        timestamp: new Date(Date.now() - 3600000 * 2),
      },
    ];

    await this.auditRepo.save(audits as AuditLogEntity[]);
    this.logger.log(`Seeded initial audit logs.`);
  }
}
