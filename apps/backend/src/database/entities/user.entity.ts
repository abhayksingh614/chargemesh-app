import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export interface VehicleMetadata {
  make: string;
  model: string;
  connectorType: string;
  batteryCapacity?: number;
}

@Entity('users')
export class UserEntity {
  @PrimaryColumn('varchar', { length: 64 })
  id: string;

  @Index({ unique: true })
  @Column('varchar', { length: 20 })
  phoneNumber: string;

  @Column('varchar', { length: 128 })
  name: string;

  @Column('varchar', { length: 128, nullable: true })
  email?: string;

  @Column('jsonb', { nullable: true })
  vehicle?: VehicleMetadata;

  @Column('bigint', { default: 0 })
  walletBalancePaise: number;

  @Column('bigint', { default: 0 })
  walletHeldPaise: number;

  @Column('float', { default: 0 })
  totalKwhCharged: number;

  @Column('float', { default: 0 })
  co2SavedKg: number;

  @Column('int', { default: 0 })
  totalSessions: number;

  @Column('varchar', { length: 32, default: 'ACTIVE' })
  status: string;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
