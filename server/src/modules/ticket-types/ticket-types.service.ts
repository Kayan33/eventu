import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TicketType } from './entities/ticket-type.entity';
import { CreateTicketTypeDto } from './dto/create-ticket-type.dto';
import { UpdateTicketTypeDto } from './dto/update-ticket-type.dto';

@Injectable()
export class TicketTypesService {
  constructor(
    @InjectRepository(TicketType)
    private readonly ticketTypeRepository: Repository<TicketType>,
  ) {}

  async create(dto: CreateTicketTypeDto): Promise<TicketType> {
    const ticketType = this.ticketTypeRepository.create({
      eventId: dto.eventId,
      name: dto.name,
      basePrice: dto.basePrice.toFixed(2),
      quantity: dto.quantity,
    });
    return await this.ticketTypeRepository.save(ticketType);
  }

  async findByEvent(eventId: string): Promise<TicketType[]> {
    return await this.ticketTypeRepository.find({ where: { eventId } });
  }

  async findOne(id: string): Promise<TicketType> {
    const ticketType = await this.ticketTypeRepository.findOne({
      where: { id },
    });
    if (!ticketType) {
      throw new NotFoundException('Ticket type not found');
    }
    return ticketType;
  }

  async update(id: string, dto: UpdateTicketTypeDto): Promise<TicketType> {
    const ticketType = await this.findOne(id);
    const { basePrice, ...rest } = dto;
    Object.assign(ticketType, {
      ...rest,
      ...(basePrice !== undefined && { basePrice: basePrice.toFixed(2) }),
    });
    return await this.ticketTypeRepository.save(ticketType);
  }

  async remove(id: string): Promise<void> {
    const ticketType = await this.findOne(id);
    if (ticketType.sold > 0) {
      throw new BadRequestException(
        'Cannot delete a ticket type with sold tickets',
      );
    }
    await this.ticketTypeRepository.remove(ticketType);
  }
}
