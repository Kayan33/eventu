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
import { Event } from '../../events/entities/event.entity';
import { Ticket } from '../../tickets/entities/ticket.entity';
import { PricingRule } from '../../pricing-rules/entities/pricing-rule.entity';

@Entity('ticket_types')
export class TicketType {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  eventId!: string;

  @Column()
  name!: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  basePrice!: string;

  @Column({ type: 'int' })
  quantity!: number;

  @Column({ type: 'int', default: 0 })
  sold!: number;

  @Column({ default: 0 })
  displayOrder!: number;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @ManyToOne(() => Event, (event) => event.ticketTypes)
  @JoinColumn({ name: 'event_id' })
  event!: Event;

  @OneToMany(() => Ticket, (ticket) => ticket.ticketType)
  tickets!: Ticket[];

  @OneToMany(() => PricingRule, (pricingRule) => pricingRule.ticketType)
  pricingRules!: PricingRule[];
}
