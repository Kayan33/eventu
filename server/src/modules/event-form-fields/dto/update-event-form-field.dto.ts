import { PartialType } from '@nestjs/swagger';
import { CreateEventFormFieldDto } from './create-event-form-field.dto';

export class UpdateEventFormFieldDto extends PartialType(
  CreateEventFormFieldDto,
) {}
