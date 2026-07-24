import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TicketType } from './entities/ticket-type.entity';
import { Event } from '../events/entities/event.entity';
import { CreateTicketTypeDto } from './dto/create-ticket-type.dto';
import { UpdateTicketTypeDto } from './dto/update-ticket-type.dto';

@Injectable()
export class TicketTypesService {
  constructor(
    @InjectRepository(TicketType)
    private readonly ticketTypeRepository: Repository<TicketType>,
    @InjectRepository(Event)
    private readonly eventRepository: Repository<Event>,
  ) {}

  private async assertEventBelongsToTenant(
    eventId: string,
    tenantId?: string,
  ): Promise<void> {
    if (!tenantId) {
      return;
    }
    const event = await this.eventRepository.findOne({
      where: { id: eventId },
    });
    if (!event || event.tenantId !== tenantId) {
      throw new NotFoundException('Event not found');
    }
  }

  async create(
    dto: CreateTicketTypeDto,
    tenantId?: string,
  ): Promise<TicketType> {
    await this.assertEventBelongsToTenant(dto.eventId, tenantId);

    const ticketType = this.ticketTypeRepository.create({
      eventId: dto.eventId,
      name: dto.name,
      basePrice: dto.basePrice.toFixed(2),
      quantity: dto.quantity,
    });
    return await this.ticketTypeRepository.save(ticketType);
  }

  async findByEvent(eventId: string, tenantId?: string): Promise<TicketType[]> {
    await this.assertEventBelongsToTenant(eventId, tenantId);
    return await this.ticketTypeRepository.find({ where: { eventId } });
  }

  async findOne(id: string, tenantId?: string): Promise<TicketType> {
    const ticketType = await this.ticketTypeRepository.findOne({
      where: { id },
      relations: { event: true },
    });
    if (!ticketType) {
      throw new NotFoundException('Ticket type not found');
    }
    if (tenantId && ticketType.event.tenantId !== tenantId) {
      throw new NotFoundException('Ticket type not found');
    }
    return ticketType;
  }

  async update(
    id: string,
    dto: UpdateTicketTypeDto,
    tenantId?: string,
  ): Promise<TicketType> {
    const ticketType = await this.findOne(id, tenantId);
    const { basePrice, ...rest } = dto;
    Object.assign(ticketType, {
      ...rest,
      ...(basePrice !== undefined && { basePrice: basePrice.toFixed(2) }),
    });
    return await this.ticketTypeRepository.save(ticketType);
  }

  async remove(id: string, tenantId?: string): Promise<void> {
    const ticketType = await this.findOne(id, tenantId);
    if (ticketType.sold > 0) {
      throw new BadRequestException(
        'Cannot delete a ticket type with sold tickets',
      );
    }
    await this.ticketTypeRepository.remove(ticketType);
  }
}
