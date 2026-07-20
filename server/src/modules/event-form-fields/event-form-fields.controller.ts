import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { EventFormFieldsService } from './event-form-fields.service';
import { CreateEventFormFieldDto } from './dto/create-event-form-field.dto';
import { UpdateEventFormFieldDto } from './dto/update-event-form-field.dto';

@ApiTags('event-form-fields')
@Controller('event-form-fields')
export class EventFormFieldsController {
  constructor(private readonly formFieldsService: EventFormFieldsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a form field for an event' })
  create(@Body() dto: CreateEventFormFieldDto) {
    return this.formFieldsService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List form fields by event' })
  findByEvent(@Query('eventId', ParseUUIDPipe) eventId: string) {
    return this.formFieldsService.findByEvent(eventId);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a form field' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateEventFormFieldDto,
  ) {
    return this.formFieldsService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a form field' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.formFieldsService.remove(id);
  }
}
