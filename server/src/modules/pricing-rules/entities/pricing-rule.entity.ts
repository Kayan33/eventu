import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { TicketType } from '../../ticket-types/entities/ticket-type.entity';
import { EventFormField } from '../../event-form-fields/entities/event-form-field.entity';

@Entity('pricing_rules')
export class PricingRule {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  ticketTypeId!: string;

  @Column()
  formFieldId!: string;

  @Column()
  fieldValue!: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @ManyToOne(() => TicketType, (ticketType) => ticketType.pricingRules, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'ticket_type_id' })
  ticketType!: TicketType;

  @ManyToOne(() => EventFormField, (formField) => formField.pricingRules, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'form_field_id' })
  formField!: EventFormField;
}
