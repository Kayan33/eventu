import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { EventStatus } from '../../../common/enums/event-status.enum';
import { CapacityMode } from '../../../common/enums/capacity-mode.enum';
import { LocationType } from '../../../common/enums/location-type.enum';
import { Tenant } from '../../tenants/entities/tenant.entity';
import { TicketType } from '../../ticket-types/entities/ticket-type.entity';
import { EventFormField } from '../../event-form-fields/entities/event-form-field.entity';
import { Certificate } from '../../certificates/entities/certificate.entity';

@Entity('events')
export class Event {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  tenantId!: string;

  @Column()
  title!: string;

  @Column({ unique: true })
  slug!: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column()
  startDate!: Date;

  @Column()
  endDate!: Date;

  @Column({ nullable: true })
  location?: string;

  @Column({
    type: 'enum',
    enum: LocationType,
    default: LocationType.PRESENCIAL,
  })
  locationType!: LocationType;

  @Column({ nullable: true })
  coverImageUrl?: string;

  @Column({ type: 'enum', enum: EventStatus, default: EventStatus.DRAFT })
  status!: EventStatus;

  @Column({
    type: 'enum',
    enum: CapacityMode,
    default: CapacityMode.PER_TICKET_TYPE,
  })
  capacityMode!: CapacityMode;

  @Column({ type: 'int', nullable: true })
  totalCapacity?: number;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @ManyToOne(() => Tenant, (tenant) => tenant.events)
  @JoinColumn({ name: 'tenant_id' })
  tenant!: Tenant;

  @OneToMany(() => TicketType, (ticketType) => ticketType.event)
  ticketTypes!: TicketType[];

  @OneToMany(() => EventFormField, (formField) => formField.event)
  formFields!: EventFormField[];

  @OneToMany(() => Certificate, (certificate) => certificate.event)
  certificates!: Certificate[];
}
