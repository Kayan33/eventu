import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventFormField } from './entities/event-form-field.entity';
import { Event } from '../events/entities/event.entity';
import { CreateEventFormFieldDto } from './dto/create-event-form-field.dto';
import { UpdateEventFormFieldDto } from './dto/update-event-form-field.dto';

@Injectable()
export class EventFormFieldsService {
  constructor(
    @InjectRepository(EventFormField)
    private readonly formFieldRepository: Repository<EventFormField>,
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
    dto: CreateEventFormFieldDto,
    tenantId?: string,
  ): Promise<EventFormField> {
    await this.assertEventBelongsToTenant(dto.eventId, tenantId);
    const formField = this.formFieldRepository.create(dto);
    return await this.formFieldRepository.save(formField);
  }

  async findByEvent(
    eventId: string,
    tenantId?: string,
  ): Promise<EventFormField[]> {
    await this.assertEventBelongsToTenant(eventId, tenantId);
    return await this.formFieldRepository.find({
      where: { eventId },
      order: { displayOrder: 'ASC' },
    });
  }

  async findOne(id: string, tenantId?: string): Promise<EventFormField> {
    const formField = await this.formFieldRepository.findOne({
      where: { id },
      relations: { event: true },
    });
    if (!formField) {
      throw new NotFoundException('Event form field not found');
    }
    if (tenantId && formField.event.tenantId !== tenantId) {
      throw new NotFoundException('Event form field not found');
    }
    return formField;
  }

  async update(
    id: string,
    dto: UpdateEventFormFieldDto,
    tenantId?: string,
  ): Promise<EventFormField> {
    const formField = await this.findOne(id, tenantId);
    Object.assign(formField, dto);
    return await this.formFieldRepository.save(formField);
  }

  async remove(id: string, tenantId?: string): Promise<void> {
    const formField = await this.findOne(id, tenantId);
    await this.formFieldRepository.remove(formField);
  }
}
