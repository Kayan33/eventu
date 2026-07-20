import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { PixKeyType } from '../../../common/enums/pix-key-type.enum';
import { User } from '../../users/entities/user.entity';
import { Event } from '../../events/entities/event.entity';

@Entity('tenants')
export class Tenant {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name!: string;

  @Column({ unique: true })
  slug!: string;

  @Column({ nullable: true })
  pixKey?: string;

  @Column({ type: 'enum', enum: PixKeyType, nullable: true })
  pixKeyType?: PixKeyType;

  @Column({ nullable: true })
  pixQrCodeUrl?: string;

  @Column({ nullable: true })
  pixBeneficiary?: string;

  @Column({ default: true })
  isActive!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @OneToMany(() => User, (user) => user.tenant)
  users!: User[];

  @OneToMany(() => Event, (event) => event.tenant)
  events!: Event[];
}
