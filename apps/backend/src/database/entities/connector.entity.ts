import {
  Entity,
  PrimaryColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { ChargingStationEntity } from './charging-station.entity';

@Entity('connectors')
export class ConnectorEntity {
  @PrimaryColumn('varchar', { length: 64 })
  id: string;

  @Index()
  @Column('varchar', { length: 64 })
  stationId: string;

  @Column('int')
  connectorNumber: number;

  @Column('varchar', { length: 32 })
  type: string;

  @Column('float')
  powerKw: number;

  @Column('varchar', { length: 32, default: 'AVAILABLE' })
  status: string;

  @Column('float', { default: 18.5 })
  pricePerKwh: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  lastUpdated: Date;

  @ManyToOne(() => ChargingStationEntity, (station) => station.connectors, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'stationId' })
  station: ChargingStationEntity;
}
