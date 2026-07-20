import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventFormField } from './entities/event-form-field.entity';
import { CreateEventFormFieldDto } from './dto/create-event-form-field.dto';
import { UpdateEventFormFieldDto } from './dto/update-event-form-field.dto';

@Injectable()
export class EventFormFieldsService {
  constructor(
    @InjectRepository(EventFormField)
    private readonly formFieldRepository: Repository<EventFormField>,
  ) {}

  async create(dto: CreateEventFormFieldDto): Promise<EventFormField> {
    const formField = this.formFieldRepository.create(dto);
    return await this.formFieldRepository.save(formField);
  }

  async findByEvent(eventId: string): Promise<EventFormField[]> {
    return await this.formFieldRepository.find({
      where: { eventId },
      order: { displayOrder: 'ASC' },
    });
  }

  async findOne(id: string): Promise<EventFormField> {
    const formField = await this.formFieldRepository.findOne({
      where: { id },
    });
    if (!formField) {
      throw new NotFoundException('Event form field not found');
    }
    return formField;
  }

  async update(
    id: string,
    dto: UpdateEventFormFieldDto,
  ): Promise<EventFormField> {
    const formField = await this.findOne(id);
    Object.assign(formField, dto);
    return await this.formFieldRepository.save(formField);
  }

  async remove(id: string): Promise<void> {
    const formField = await this.findOne(id);
    await this.formFieldRepository.remove(formField);
  }
}
