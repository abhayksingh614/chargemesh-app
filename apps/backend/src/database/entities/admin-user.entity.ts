import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('admin_users')
export class AdminUserEntity {
  @PrimaryColumn('varchar', { length: 64 })
  id: string;

  @Index({ unique: true })
  @Column('varchar', { length: 128 })
  email: string;

  @Column('varchar', { length: 128 })
  name: string;

  @Column('varchar', { length: 255 })
  passwordHash: string;

  @Column('varchar', { length: 32 })
  role: string;

  @Column('varchar', { length: 32, default: 'ACTIVE' })
  status: string;

  @Column('varchar', { length: 128, nullable: true })
  department?: string;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
