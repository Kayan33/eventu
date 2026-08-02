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
import { StorageService } from '../storage/storage.service';

const COVER_IMAGE_BUCKET = 'event-covers';
const COVER_IMAGE_MIME_EXTENSIONS: Record<string, string> = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/webp': 'webp',
  'image/gif': 'gif',
};

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(Event)
    private readonly eventRepository: Repository<Event>,
    private readonly storageService: StorageService,
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

  async uploadCover(
    id: string,
    file: Express.Multer.File,
    tenantId: string,
  ): Promise<Event> {
    const event = await this.findOne(id, tenantId);

    const extension = COVER_IMAGE_MIME_EXTENSIONS[file.mimetype];
    if (!extension) {
      throw new BadRequestException(
        'Cover image must be PNG, JPEG, WEBP or GIF',
      );
    }
    if (file.size > 5 * 1024 * 1024) {
      throw new BadRequestException('Cover image must be at most 5MB');
    }

    const path = `${event.id}-${Date.now()}.${extension}`;
    event.coverImageUrl = await this.storageService.uploadPublicFile(
      COVER_IMAGE_BUCKET,
      path,
      file.buffer,
      file.mimetype,
    );
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
