import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventFormField } from './entities/event-form-field.entity';
import { Event } from '../events/entities/event.entity';
import { EventFormFieldsService } from './event-form-fields.service';
import { EventFormFieldsController } from './event-form-fields.controller';

@Module({
  imports: [TypeOrmModule.forFeature([EventFormField, Event])],
  controllers: [EventFormFieldsController],
  providers: [EventFormFieldsService],
  exports: [EventFormFieldsService],
})
export class EventFormFieldsModule {}
