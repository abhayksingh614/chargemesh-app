import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AdminCpoDetail, CpoProtocol, CpoIntegrationStatus, AuditActionType, AdminRole } from '@chargemesh/shared-types';
import { AdminAuditService } from './admin-audit.service';
import { CpoEntity } from '../../database/entities';

@Injectable()
export class AdminCpoService {
  private readonly cpos: Map<string, AdminCpoDetail> = new Map();

  constructor(
    @InjectRepository(CpoEntity)
    private readonly cpoRepo: Repository<CpoEntity>,
    private readonly auditService: AdminAuditService,
  ) {
    const list: AdminCpoDetail[] = [
      {
        id: 'cpo-tata',
        name: 'Tata Power EZ Charge',
        partyId: 'TP',
        countryCode: 'IN',
        protocol: CpoProtocol.OCPI_2_3,
        integrationStatus: CpoIntegrationStatus.ACTIVE,
        supportPhone: '1800-209-5161',
        supportEmail: 'customercare@tatapower.com',
        website: 'https://www.tatapower.com/evcharging',
        syncFrequencySeconds: 300,
        totalStationCount: 142,
        totalOnlineChargers: 412,
        totalSessionsLifetime: 18450,
        revenueSharePercent: 92.5,
        uptimePercent30d: 99.4,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: new Date().toISOString(),
        lastSyncAt: new Date(Date.now() - 1000 * 60 * 3).toISOString(),
        lastSyncResult: {
          status: 'SUCCESS',
          locationsSynced: 142,
          tariffsSynced: 8,
          errorCount: 0,
          timestamp: new Date(Date.now() - 1000 * 60 * 3).toISOString(),
        },
      },
      {
        id: 'cpo-jiobp',
        name: 'Jio-bp pulse',
        partyId: 'JB',
        countryCode: 'IN',
        protocol: CpoProtocol.OCPI_2_3,
        integrationStatus: CpoIntegrationStatus.ACTIVE,
        supportPhone: '1800-891-9023',
        supportEmail: 'evsupport@jiobp.com',
        website: 'https://www.jiobp.com/pulse',
        syncFrequencySeconds: 300,
        totalStationCount: 98,
        totalOnlineChargers: 280,
        totalSessionsLifetime: 12100,
        revenueSharePercent: 91.0,
        uptimePercent30d: 98.9,
        createdAt: '2024-02-01T00:00:00.000Z',
        updatedAt: new Date().toISOString(),
        lastSyncAt: new Date(Date.now() - 1000 * 60 * 4).toISOString(),
        lastSyncResult: {
          status: 'SUCCESS',
          locationsSynced: 98,
          tariffsSynced: 6,
          errorCount: 0,
          timestamp: new Date(Date.now() - 1000 * 60 * 4).toISOString(),
        },
      },
      {
        id: 'cpo-statiq',
        name: 'Statiq Grid',
        partyId: 'SQ',
        countryCode: 'IN',
        protocol: CpoProtocol.OCPI_2_3,
        integrationStatus: CpoIntegrationStatus.ACTIVE,
        supportPhone: '+91-9876543210',
        supportEmail: 'support@statiq.in',
        website: 'https://www.statiq.in',
        syncFrequencySeconds: 300,
        totalStationCount: 86,
        totalOnlineChargers: 210,
        totalSessionsLifetime: 9400,
        revenueSharePercent: 90.0,
        uptimePercent30d: 97.8,
        createdAt: '2024-02-15T00:00:00.000Z',
        updatedAt: new Date().toISOString(),
        lastSyncAt: new Date(Date.now() - 1000 * 60 * 8).toISOString(),
        lastSyncResult: {
          status: 'SUCCESS',
          locationsSynced: 86,
          tariffsSynced: 5,
          errorCount: 0,
          timestamp: new Date(Date.now() - 1000 * 60 * 8).toISOString(),
        },
      },
      {
        id: 'cpo-zeon',
        name: 'Zeon Charging',
        partyId: 'ZC',
        countryCode: 'IN',
        protocol: CpoProtocol.OCPI_2_3,
        integrationStatus: CpoIntegrationStatus.ACTIVE,
        supportPhone: '1800-572-8888',
        supportEmail: 'support@zeoncharging.com',
        website: 'https://www.zeoncharging.com',
        syncFrequencySeconds: 300,
        totalStationCount: 64,
        totalOnlineChargers: 180,
        totalSessionsLifetime: 7800,
        revenueSharePercent: 93.0,
        uptimePercent30d: 99.1,
        createdAt: '2024-03-01T00:00:00.000Z',
        updatedAt: new Date().toISOString(),
        lastSyncAt: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
      },
      {
        id: 'cpo-chargezone',
        name: 'ChargeZone',
        partyId: 'CZ',
        countryCode: 'IN',
        protocol: CpoProtocol.OCPI_2_3,
        integrationStatus: CpoIntegrationStatus.ACTIVE,
        supportPhone: '1800-120-2223',
        supportEmail: 'contact@chargezone.com',
        syncFrequencySeconds: 600,
        totalStationCount: 52,
        totalOnlineChargers: 140,
        totalSessionsLifetime: 6200,
        revenueSharePercent: 91.5,
        uptimePercent30d: 98.2,
        createdAt: '2024-03-10T00:00:00.000Z',
        updatedAt: new Date().toISOString(),
        lastSyncAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
      },
      {
        id: 'cpo-ather',
        name: 'Ather Grid',
        partyId: 'AG',
        countryCode: 'IN',
        protocol: CpoProtocol.OCPI_2_3,
        integrationStatus: CpoIntegrationStatus.ACTIVE,
        supportPhone: '1800-103-0055',
        supportEmail: 'support@atherenergy.com',
        syncFrequencySeconds: 600,
        totalStationCount: 110,
        totalOnlineChargers: 220,
        totalSessionsLifetime: 14500,
        revenueSharePercent: 90.0,
        uptimePercent30d: 99.0,
        createdAt: '2024-01-20T00:00:00.000Z',
        updatedAt: new Date().toISOString(),
        lastSyncAt: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
      },
    ];

    for (const cpo of list) {
      this.cpos.set(cpo.id, cpo);
    }
  }

  async findAll(): Promise<AdminCpoDetail[]> {
    try {
      const dbCpos = await this.cpoRepo.find();
      if (dbCpos.length > 0) {
        return dbCpos.map((c) => ({
          ...c,
          protocol: c.protocol as CpoProtocol,
          integrationStatus: c.integrationStatus as CpoIntegrationStatus,
          createdAt: c.createdAt.toISOString(),
          updatedAt: c.updatedAt.toISOString(),
          lastSyncAt: c.lastSyncAt ? c.lastSyncAt.toISOString() : undefined,
          lastSyncResult: c.lastSyncResult as AdminCpoDetail['lastSyncResult'],
        }));
      }
    } catch {}
    return Array.from(this.cpos.values());
  }

  async findById(id: string): Promise<AdminCpoDetail> {
    try {
      const dbCpo = await this.cpoRepo.findOneBy({ id });
      if (dbCpo) {
        return {
          ...dbCpo,
          protocol: dbCpo.protocol as CpoProtocol,
          integrationStatus: dbCpo.integrationStatus as CpoIntegrationStatus,
          createdAt: dbCpo.createdAt.toISOString(),
          updatedAt: dbCpo.updatedAt.toISOString(),
          lastSyncAt: dbCpo.lastSyncAt ? dbCpo.lastSyncAt.toISOString() : undefined,
          lastSyncResult: dbCpo.lastSyncResult as AdminCpoDetail['lastSyncResult'],
        };
      }
    } catch {}

    const cpo = this.cpos.get(id);
    if (!cpo) {
      throw new NotFoundException(`CPO ${id} not found`);
    }
    return cpo;
  }

  async triggerSync(id: string, adminActor: { id: string; name: string; role: AdminRole }): Promise<AdminCpoDetail> {
    const cpo = await this.findById(id);

    cpo.lastSyncAt = new Date().toISOString();
    cpo.lastSyncResult = {
      status: 'SUCCESS',
      locationsSynced: cpo.totalStationCount,
      tariffsSynced: 4,
      errorCount: 0,
      timestamp: cpo.lastSyncAt,
    };

    try {
      await this.cpoRepo.update(id, {
        lastSyncAt: new Date(cpo.lastSyncAt),
        lastSyncResult: cpo.lastSyncResult as any,
        updatedAt: new Date(),
      });
    } catch {}

    await this.auditService.record({
      actorId: adminActor.id,
      actorName: adminActor.name,
      actorRole: adminActor.role,
      action: AuditActionType.CPO_SYNC_TRIGGER,
      targetEntity: 'CPO',
      targetId: cpo.id,
      reason: `Manual OCPI 2.3.0 synchronization triggered from Admin Portal`,
      ipAddress: '127.0.0.1',
    });

    return cpo;
  }
}
