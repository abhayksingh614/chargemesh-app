import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

@Entity('finance_ledger')
export class FinanceLedgerEntity {
  @PrimaryColumn('varchar', { length: 64 })
  id: string;

  @Index({ unique: true })
  @Column('varchar', { length: 64 })
  referenceId: string;

  @Index()
  @Column('varchar', { length: 64 })
  userId: string;

  @Column('varchar', { length: 128 })
  userName: string;

  @Column('varchar', { length: 64 })
  type: string;

  @Column('varchar', { length: 128 })
  title: string;

  @Column('numeric', {
    precision: 12,
    scale: 2,
    transformer: {
      to: (val: number) => val,
      from: (val: string | number) => (val != null ? Number(val) : val),
    },
  })
  amountRupees: number;

  @Column('boolean')
  isCredit: boolean;

  @Column('varchar', { length: 32, default: 'SUCCESS' })
  status: string;

  @Column('varchar', { length: 32 })
  dateStr: string;

  @Column('varchar', { length: 32 })
  timeStr: string;

  @Column('bigint')
  rawTimestamp: number;

  @Column('varchar', { length: 64 })
  paymentMethodName: string;

  @Column('numeric', {
    precision: 12,
    scale: 2,
    transformer: {
      to: (val: number) => val,
      from: (val: string | number) => (val != null ? Number(val) : val),
    },
  })
  balanceBeforeRupees: number;

  @Column('numeric', {
    precision: 12,
    scale: 2,
    transformer: {
      to: (val: number) => val,
      from: (val: string | number) => (val != null ? Number(val) : val),
    },
  })
  balanceAfterRupees: number;

  @Column('text', { nullable: true })
  remarks?: string;

  @Column('boolean', { default: true })
  reconciled: boolean;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;
}
