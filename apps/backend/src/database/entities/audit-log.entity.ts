import {
  Entity,
  PrimaryColumn,
  Column,
  Index,
} from 'typeorm';

@Entity('audit_logs')
export class AuditLogEntity {
  @PrimaryColumn('varchar', { length: 64 })
  id: string;

  @Index()
  @Column('varchar', { length: 64 })
  actorId: string;

  @Column('varchar', { length: 128 })
  actorName: string;

  @Column('varchar', { length: 64 })
  actorRole: string;

  @Index()
  @Column('varchar', { length: 64 })
  action: string;

  @Index()
  @Column('varchar', { length: 64 })
  targetEntity: string;

  @Index()
  @Column('varchar', { length: 64 })
  targetId: string;

  @Column('jsonb', { nullable: true })
  previousValue?: Record<string, any>;

  @Column('jsonb', { nullable: true })
  newValue?: Record<string, any>;

  @Column('text', { nullable: true })
  reason?: string;

  @Column('varchar', { length: 64, nullable: true })
  ipAddress?: string;

  @Column({ type: 'timestamp' })
  timestamp: Date;
}
