import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { TicketStatus } from '../../../common/enums/ticket-status.enum';
import { TicketType } from '../../ticket-types/entities/ticket-type.entity';
import { Client } from '../../clients/entities/client.entity';
import { Payment } from '../../payments/entities/payment.entity';
import { TicketFormResponse } from '../../ticket-form-responses/entities/ticket-form-response.entity';

@Entity('tickets')
export class Ticket {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  ticketTypeId!: string;

  @Column()
  clientId!: string;

  @Column({ unique: true })
  code!: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  finalPrice!: string;

  @Column({ type: 'enum', enum: TicketStatus, default: TicketStatus.RESERVED })
  status!: TicketStatus;

  @Column({ type: 'timestamp', nullable: true })
  checkedInAt?: Date;

  @Column({ type: 'timestamp', nullable: true })
  expiresAt?: Date;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @ManyToOne(() => TicketType, (ticketType) => ticketType.tickets)
  @JoinColumn({ name: 'ticket_type_id' })
  ticketType!: TicketType;

  @ManyToOne(() => Client, (client) => client.tickets)
  @JoinColumn({ name: 'client_id' })
  client!: Client;

  @OneToOne(() => Payment, (payment) => payment.ticket)
  payment?: Payment;

  @OneToMany(() => TicketFormResponse, (response) => response.ticket)
  formResponses!: TicketFormResponse[];
}
