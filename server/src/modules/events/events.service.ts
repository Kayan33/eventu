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
import { TenantsService } from '../tenants/tenants.service';

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
    private readonly tenantsService: TenantsService,
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
      locationType: dto.locationType,
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

  async findBySlug(slug: string): Promise<Event> {
    const event = await this.eventRepository.findOne({
      where: { slug },
      relations: { ticketTypes: true, formFields: true },
    });
    if (!event || event.status === EventStatus.DRAFT) {
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
    const previousCoverUrl = event.coverImageUrl;

    event.coverImageUrl = await this.storageService.replaceFile(
      COVER_IMAGE_BUCKET,
      file,
      {
        subject: 'Cover image',
        idPrefix: event.id,
        mimeExtensions: COVER_IMAGE_MIME_EXTENSIONS,
        allowedLabel: 'PNG, JPEG, WEBP or GIF',
        maxSizeBytes: 5 * 1024 * 1024,
        isPublic: true,
      },
    );
    const saved = await this.eventRepository.save(event);

    if (previousCoverUrl) {
      await this.storageService.deletePublicFileByUrl(
        COVER_IMAGE_BUCKET,
        previousCoverUrl,
      );
    }

    return saved;
  }

  async remove(id: string, tenantId: string): Promise<void> {
    const event = await this.findOne(id, tenantId);
    if (event.status !== EventStatus.DRAFT) {
      throw new BadRequestException('Only draft events can be deleted');
    }
    if (event.coverImageUrl) {
      await this.storageService.deletePublicFileByUrl(
        COVER_IMAGE_BUCKET,
        event.coverImageUrl,
      );
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
    const isPaid = event.ticketTypes.some((t) => Number(t.basePrice) > 0);
    if (isPaid) {
      const tenant = await this.tenantsService.findOne(tenantId);
      if (!tenant.pixKey || !tenant.pixBeneficiary) {
        throw new BadRequestException(
          'A paid event needs an active Pix key to be published',
        );
      }
    }
    event.status = EventStatus.PUBLISHED;
    return await this.eventRepository.save(event);
  }
}
