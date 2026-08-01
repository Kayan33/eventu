import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Ticket } from './entities/ticket.entity';
import { TicketType } from '../ticket-types/entities/ticket-type.entity';
import { Event } from '../events/entities/event.entity';
import { PricingRule } from '../pricing-rules/entities/pricing-rule.entity';
import { TicketFormResponse } from '../ticket-form-responses/entities/ticket-form-response.entity';
import { Payment } from '../payments/entities/payment.entity';
import { TicketsService } from './tickets.service';
import { TicketsController } from './tickets.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Ticket,
      TicketType,
      Event,
      PricingRule,
      TicketFormResponse,
      Payment,
    ]),
  ],
  controllers: [TicketsController],
  providers: [TicketsService],
  exports: [TicketsService],
})
export class TicketsModule {}
