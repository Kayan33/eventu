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

    const event = this.eventRepository.create({
      tenantId,
      title: dto.title,
      slug,
      description: dto.description,
      startDate: new Date(dto.startDate),
      endDate: new Date(dto.endDate),
      location: dto.location,
    });
    return await this.eventRepository.save(event);
  }

  async findAll(tenantId?: string): Promise<Event[]> {
    return await this.eventRepository.find(
      tenantId ? { where: { tenantId } } : {},
    );
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

    const { startDate, endDate, ...rest } = dto;
    Object.assign(event, {
      ...rest,
      ...(startDate && { startDate: new Date(startDate) }),
      ...(endDate && { endDate: new Date(endDate) }),
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
}
