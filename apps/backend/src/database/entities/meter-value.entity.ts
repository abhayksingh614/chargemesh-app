import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { ChargingSessionEntity } from './charging-session.entity';

@Entity('meter_values')
export class MeterValueEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column('varchar', { length: 64 })
  sessionId: string;

  @Index()
  @Column('varchar', { length: 64 })
  chargePointId: string;

  @Column('int')
  connectorNumber: number;

  @Column({ type: 'timestamp' })
  timestamp: Date;

  @Column('float')
  powerKw: number;

  @Column('float')
  energyKwh: number;

  @Column('float', { nullable: true })
  socPercent?: number;

  @Column('float', { nullable: true })
  voltage?: number;

  @Column('float', { nullable: true })
  current?: number;

  @ManyToOne(() => ChargingSessionEntity, (session) => session.meterValues, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'sessionId' })
  session: ChargingSessionEntity;
}
