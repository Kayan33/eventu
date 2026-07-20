import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Event } from '../../events/entities/event.entity';
import { Client } from '../../clients/entities/client.entity';

@Entity('certificates')
export class Certificate {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  eventId!: string;

  @Column()
  clientId!: string;

  @Column({ unique: true })
  code!: string;

  @Column({ nullable: true })
  pdfUrl?: string;

  @CreateDateColumn()
  issuedAt!: Date;

  @ManyToOne(() => Event, (event) => event.certificates)
  @JoinColumn({ name: 'event_id' })
  event!: Event;

  @ManyToOne(() => Client, (client) => client.certificates)
  @JoinColumn({ name: 'client_id' })
  client!: Client;
}
