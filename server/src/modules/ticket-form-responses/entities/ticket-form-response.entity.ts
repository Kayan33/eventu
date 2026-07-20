import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Ticket } from '../../tickets/entities/ticket.entity';
import { EventFormField } from '../../event-form-fields/entities/event-form-field.entity';

@Entity('ticket_form_responses')
export class TicketFormResponse {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  ticketId!: string;

  @Column()
  formFieldId!: string;

  @Column()
  value!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @ManyToOne(() => Ticket, (ticket) => ticket.formResponses, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'ticket_id' })
  ticket!: Ticket;

  @ManyToOne(() => EventFormField, (formField) => formField.responses)
  @JoinColumn({ name: 'form_field_id' })
  formField!: EventFormField;
}
