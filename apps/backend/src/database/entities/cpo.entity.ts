import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('cpos')
export class CpoEntity {
  @PrimaryColumn('varchar', { length: 64 })
  id: string;

  @Index()
  @Column('varchar', { length: 16 })
  partyId: string;

  @Column('varchar', { length: 8, default: 'IN' })
  countryCode: string;

  @Column('varchar', { length: 128 })
  name: string;

  @Column('varchar', { length: 32, default: 'OCPI_2_3' })
  protocol: string;

  @Column('varchar', { length: 32, default: 'ACTIVE' })
  integrationStatus: string;

  @Column('varchar', { length: 64, nullable: true })
  supportPhone?: string;

  @Column('varchar', { length: 128, nullable: true })
  supportEmail?: string;

  @Column('varchar', { length: 255, nullable: true })
  website?: string;

  @Column('float', { default: 90.0 })
  revenueSharePercent: number;

  @Column('float', { default: 99.0 })
  uptimePercent30d: number;

  @Column('int', { default: 300 })
  syncFrequencySeconds: number;

  @Column('int', { default: 0 })
  totalStationCount: number;

  @Column('int', { default: 0 })
  totalOnlineChargers: number;

  @Column('int', { default: 0 })
  totalSessionsLifetime: number;

  @Column({ type: 'timestamp', nullable: true })
  lastSyncAt?: Date;

  @Column('jsonb', { nullable: true })
  lastSyncResult?: Record<string, any>;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
