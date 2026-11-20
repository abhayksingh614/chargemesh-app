import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { ConnectorEntity } from './connector.entity';

@Entity('charging_stations')
export class ChargingStationEntity {
  @PrimaryColumn('varchar', { length: 64 })
  id: string;

  @Index({ unique: true })
  @Column('varchar', { length: 64 })
  chargePointId: string;

  @Column('varchar', { length: 128, nullable: true })
  chargePointPassword?: string;

  @Column('varchar', { length: 128 })
  name: string;

  @Column('varchar', { length: 128 })
  operator: string;

  @Column('varchar', { length: 64, nullable: true })
  cpoId?: string;

  @Column('text')
  address: string;

  @Index()
  @Column('varchar', { length: 64 })
  city: string;

  @Column('float')
  latitude: number;

  @Column('float')
  longitude: number;

  @Column('float', { default: 4.5 })
  rating: number;

  @Column('int', { default: 0 })
  totalReviews: number;

  @Column('simple-array', { default: '' })
  amenities: string[];

  @Column('varchar', { length: 32, default: 'ACTIVE' })
  status: string;

  @OneToMany(() => ConnectorEntity, (connector) => connector.station, {
    cascade: true,
    eager: true,
  })
  connectors: ConnectorEntity[];

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
