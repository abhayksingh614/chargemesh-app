import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { MeterValueEntity } from './meter-value.entity';

@Entity('charging_sessions')
export class ChargingSessionEntity {
  @PrimaryColumn('varchar', { length: 64 })
  id: string;

  @Index()
  @Column('varchar', { length: 64 })
  userId: string;

  @Index()
  @Column('varchar', { length: 64 })
  stationId: string;

  @Column('varchar', { length: 128 })
  stationName: string;

  @Column('varchar', { length: 64 })
  connectorId: string;

  @Column('varchar', { length: 32 })
  connectorType: string;

  @Index()
  @Column('varchar', { length: 64 })
  chargePointId: string;

  @Column('int', { nullable: true })
  transactionId?: number;

  @Column('varchar', { length: 32, default: 'REQUESTED' })
  status: string;

  @Column('jsonb', { nullable: true })
  target?: {
    type: string;
    value: number;
  };

  @Column({ type: 'timestamp' })
  startTime: Date;

  @Column({ type: 'timestamp', nullable: true })
  endTime?: Date;

  @Column('float', { default: 0 })
  energyKwh: number;

  @Column('float', { default: 0 })
  totalCostInr: number;

  @Column('float', { default: 18.5 })
  pricePerKwh: number;

  @Column('float', { default: 0 })
  startSoC: number;

  @Column('float', { default: 0 })
  currentSoC: number;

  @Column('float', { default: 0 })
  powerKw: number;

  @OneToMany(() => MeterValueEntity, (meterValue) => meterValue.session, {
    cascade: true,
  })
  meterValues: MeterValueEntity[];

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
