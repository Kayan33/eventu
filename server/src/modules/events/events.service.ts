import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Event } from './entities/event.entity';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { EventStatus } from '../../common/enums/event-status.enum';
import { CapacityMode } from '../../common/enums/capacity-mode.enum';
import { slugify } from '../../common/utils/slugify.util';

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(Event)
    private readonly eventRepository: Repository<Event>,
  ) {}

  async create(dto: CreateEventDto, tenantId: string): Promise<Event> {
    const slug = slugify(dto.title);

    const exists = await this.eventRepository.findOne({ where: { slug } });
    if (exists) {
      throw new ConflictException('Event with this title already exists');
    }

    const capacityMode = dto.capacityMode ?? CapacityMode.PER_TICKET_TYPE;
    if (capacityMode === CapacityMode.TOTAL && !dto.totalCapacity) {
      throw new BadRequestException(
        'totalCapacity is required when capacityMode is total',
      );
    }

    const event = this.eventRepository.create({
      tenantId,
      title: dto.title,
      slug,
      description: dto.description,
      startDate: new Date(dto.startDate),
      endDate: new Date(dto.endDate),
      location: dto.location,
      capacityMode,
      totalCapacity:
        capacityMode === CapacityMode.TOTAL ? dto.totalCapacity : undefined,
    });
    return await this.eventRepository.save(event);
  }

  async findAll(tenantId?: string): Promise<Event[]> {
    return await this.eventRepository.find({
      ...(tenantId && { where: { tenantId } }),
      relations: { ticketTypes: true },
    });
  }

  async findOne(id: string, tenantId?: string): Promise<Event> {
    const event = await this.eventRepository.findOne({
      where: { id },
      relations: { ticketTypes: true, formFields: true },
    });
    if (!event || (tenantId && event.tenantId !== tenantId)) {
      throw new NotFoundException('Event not found');
    }
    return event;
  }

  async update(
    id: string,
    dto: UpdateEventDto,
    tenantId: string,
  ): Promise<Event> {
    const event = await this.findOne(id, tenantId);

    const { startDate, endDate, capacityMode, totalCapacity, ...rest } = dto;
    const nextCapacityMode = capacityMode ?? event.capacityMode;
    const nextTotalCapacity = totalCapacity ?? event.totalCapacity;
    if (nextCapacityMode === CapacityMode.TOTAL && !nextTotalCapacity) {
      throw new BadRequestException(
        'totalCapacity is required when capacityMode is total',
      );
    }

    Object.assign(event, {
      ...rest,
      ...(startDate && { startDate: new Date(startDate) }),
      ...(endDate && { endDate: new Date(endDate) }),
      capacityMode: nextCapacityMode,
      totalCapacity:
        nextCapacityMode === CapacityMode.TOTAL ? nextTotalCapacity : undefined,
    });
    return await this.eventRepository.save(event);
  }

  async remove(id: string, tenantId: string): Promise<void> {
    const event = await this.findOne(id, tenantId);
    if (event.status !== EventStatus.DRAFT) {
      throw new BadRequestException('Only draft events can be deleted');
    }
    await this.eventRepository.remove(event);
  }

  async publish(id: string, tenantId: string): Promise<Event> {
    const event = await this.findOne(id, tenantId);
    if (event.status !== EventStatus.DRAFT) {
      throw new BadRequestException('Only draft events can be published');
    }
    if (event.ticketTypes.length === 0) {
      throw new BadRequestException(
        'Event needs at least one ticket type to be published',
      );
    }
    event.status = EventStatus.PUBLISHED;
    return await this.eventRepository.save(event);
  }
}
