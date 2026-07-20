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
import { FormFieldType } from '../../../common/enums/form-field-type.enum';
import { Event } from '../../events/entities/event.entity';
import { PricingRule } from '../../pricing-rules/entities/pricing-rule.entity';
import { TicketFormResponse } from '../../ticket-form-responses/entities/ticket-form-response.entity';

@Entity('event_form_fields')
export class EventFormField {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  eventId!: string;

  @Column()
  label!: string;

  @Column({ type: 'enum', enum: FormFieldType })
  type!: FormFieldType;

  @Column({ type: 'jsonb', nullable: true })
  options?: string[];

  @Column({ default: false })
  isRequired!: boolean;

  @Column({ default: 0 })
  displayOrder!: number;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @ManyToOne(() => Event, (event) => event.formFields, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'event_id' })
  event!: Event;

  @OneToMany(() => PricingRule, (pricingRule) => pricingRule.formField)
  pricingRules!: PricingRule[];

  @OneToMany(() => TicketFormResponse, (response) => response.formField)
  responses!: TicketFormResponse[];
}
