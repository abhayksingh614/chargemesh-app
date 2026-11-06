import { Injectable, Logger } from '@nestjs/common';
import { AuditLogEntry, AuditActionType, AdminRole } from '@chargemesh/shared-types';

@Injectable()
export class AdminAuditService {
  private readonly logger = new Logger(AdminAuditService.name);
  private readonly auditLogs: AuditLogEntry[] = [
    {
      id: 'aud-001',
      actorId: 'adm-001',
      actorName: 'Abhay Singh (Lead)',
      actorRole: AdminRole.SUPER_ADMIN,
      action: AuditActionType.STATION_UPDATE,
      targetEntity: 'STATION',
      targetId: 'tp-del-01',
      previousValue: { tariffPerKwh: 17.5 },
      newValue: { tariffPerKwh: 18.5 },
      reason: 'Scheduled peak tariff alignment for Cyber Hub zone',
      ipAddress: '192.168.1.102',
      timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
    },
    {
      id: 'aud-002',
      actorId: 'adm-002',
      actorName: 'Priya Sharma',
      actorRole: AdminRole.FINANCE_ADMIN,
      action: AuditActionType.WALLET_ADJUSTMENT,
      targetEntity: 'WALLET',
      targetId: 'usr-abhay-01',
      previousValue: { balancePaise: 194000 },
      newValue: { balancePaise: 204000 },
      reason: 'Hold release refund #CS-8921 verified with payment gateway',
      ipAddress: '192.168.1.108',
      timestamp: new Date(Date.now() - 3600000 * 24).toISOString(),
    },
  ];

  async record(entry: Omit<AuditLogEntry, 'id' | 'timestamp'>): Promise<AuditLogEntry> {
    const newEntry: AuditLogEntry = {
      ...entry,
      id: `aud-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
    };
    this.auditLogs.unshift(newEntry);
    this.logger.log(`[AUDIT] ${newEntry.actorName} (${newEntry.actorRole}) -> ${newEntry.action} on ${newEntry.targetEntity}:${newEntry.targetId}`);
    return newEntry;
  }

  async findAll(query?: { targetEntity?: string; actorId?: string }): Promise<AuditLogEntry[]> {
    let result = [...this.auditLogs];
    if (query?.targetEntity) {
      result = result.filter((l) => l.targetEntity === query.targetEntity);
    }
    if (query?.actorId) {
      result = result.filter((l) => l.actorId === query.actorId);
    }
    return result;
  }
}
