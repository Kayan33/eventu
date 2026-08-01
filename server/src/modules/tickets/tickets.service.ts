import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Ticket } from './entities/ticket.entity';
import { TicketType } from '../ticket-types/entities/ticket-type.entity';
import { Event } from '../events/entities/event.entity';
import { PricingRule } from '../pricing-rules/entities/pricing-rule.entity';
import { TicketFormResponse } from '../ticket-form-responses/entities/ticket-form-response.entity';
import { Payment } from '../payments/entities/payment.entity';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { TicketStatus } from '../../common/enums/ticket-status.enum';
import { PaymentStatus } from '../../common/enums/payment-status.enum';
import { CapacityMode } from '../../common/enums/capacity-mode.enum';
import { generateCode } from '../../common/utils/random-code.util';

const PAYMENT_EXPIRATION_MINUTES = 30;

export interface TicketScope {
  clientId?: string;
  tenantId?: string;
}

@Injectable()
export class TicketsService {
  constructor(
    @InjectRepository(Ticket)
    private readonly ticketRepository: Repository<Ticket>,
    @InjectDataSource() private readonly dataSource: DataSource,
  ) {}

  async create(dto: CreateTicketDto): Promise<Ticket> {
    return await this.dataSource.transaction(async (manager) => {
      const ticketType = await manager.findOne(TicketType, {
        where: { id: dto.ticketTypeId },
        lock: { mode: 'pessimistic_write' },
      });
      if (!ticketType) {
        throw new NotFoundException('Ticket type not found');
      }

      const event = await manager.findOne(Event, {
        where: { id: ticketType.eventId },
      });
      if (!event) {
        throw new NotFoundException('Event not found');
      }

      if (event.capacityMode === CapacityMode.TOTAL) {
        // Lock the event row too, so concurrent purchases across different
        // ticket types of the same event are serialized against the shared cap.
        await manager
          .createQueryBuilder(Event, 'event')
          .setLock('pessimistic_write')
          .where('event.id = :id', { id: event.id })
          .getOne();

        const raw = await manager
          .createQueryBuilder(TicketType, 'ticketType')
          .select('COALESCE(SUM(ticketType.sold), 0)', 'sum')
          .where('ticketType.eventId = :eventId', { eventId: event.id })
          .getRawOne<{ sum: string }>();

        if (Number(raw?.sum ?? 0) >= (event.totalCapacity ?? 0)) {
          throw new BadRequestException('This event is sold out');
        }
      } else if (ticketType.sold >= (ticketType.quantity ?? 0)) {
        throw new BadRequestException('This ticket type is sold out');
      }

      let finalPrice = ticketType.basePrice;
      for (const response of dto.formResponses) {
        const matchingRule = await manager.findOne(PricingRule, {
          where: {
            ticketTypeId: dto.ticketTypeId,
            formFieldId: response.formFieldId,
            fieldValue: response.value,
          },
        });
        if (matchingRule) {
          finalPrice = matchingRule.price;
          break;
        }
      }

      const ticket = manager.create(Ticket, {
        ticketTypeId: dto.ticketTypeId,
        clientId: dto.clientId,
        code: generateCode('EVT'),
        finalPrice,
        status: TicketStatus.RESERVED,
      });
      await manager.save(ticket);

      const formResponses = dto.formResponses.map((response) =>
        manager.create(TicketFormResponse, {
          ticketId: ticket.id,
          formFieldId: response.formFieldId,
          value: response.value,
        }),
      );
      await manager.save(formResponses);

      ticketType.sold += 1;
      await manager.save(ticketType);

      if (Number(finalPrice) > 0) {
        const expiresAt = new Date();
        expiresAt.setMinutes(
          expiresAt.getMinutes() + PAYMENT_EXPIRATION_MINUTES,
        );

        const payment = manager.create(Payment, {
          ticketId: ticket.id,
          amount: finalPrice,
          status: PaymentStatus.PENDING,
          expiresAt,
        });
        await manager.save(payment);
      }

      return ticket;
    });
  }

  async findAll(scope: TicketScope = {}): Promise<Ticket[]> {
    if (scope.clientId) {
      return await this.ticketRepository.find({
        where: { clientId: scope.clientId },
      });
    }
    if (scope.tenantId) {
      return await this.ticketRepository
        .createQueryBuilder('ticket')
        .innerJoin('ticket.ticketType', 'ticketType')
        .innerJoin('ticketType.event', 'event')
        .where('event.tenantId = :tenantId', { tenantId: scope.tenantId })
        .getMany();
    }
    return await this.ticketRepository.find();
  }

  async findOne(id: string, scope: TicketScope = {}): Promise<Ticket> {
    const ticket = await this.ticketRepository.findOne({
      where: { id },
      relations: {
        formResponses: true,
        payment: true,
        ticketType: { event: true },
      },
    });
    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }
    if (scope.clientId && ticket.clientId !== scope.clientId) {
      throw new NotFoundException('Ticket not found');
    }
    if (scope.tenantId && ticket.ticketType.event.tenantId !== scope.tenantId) {
      throw new NotFoundException('Ticket not found');
    }
    return ticket;
  }

  async checkIn(id: string, tenantId: string): Promise<Ticket> {
    const ticket = await this.findOne(id, { tenantId });
    if (ticket.status !== TicketStatus.CONFIRMED) {
      throw new BadRequestException('Only confirmed tickets can be checked in');
    }
    ticket.checkedInAt = new Date();
    ticket.status = TicketStatus.USED;
    return await this.ticketRepository.save(ticket);
  }
}
