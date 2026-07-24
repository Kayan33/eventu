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
import { ActorType } from '../auth/decorators/actor-type.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentActor } from '../auth/decorators/current-actor.decorator';
import type {
  JwtPayload,
  UserJwtPayload,
} from '../auth/interfaces/jwt-payload.interface';
import { UserRole } from '../../common/enums/user-role.enum';

@ApiTags('event-form-fields')
@Controller('event-form-fields')
export class EventFormFieldsController {
  constructor(private readonly formFieldsService: EventFormFieldsService) {}

  @ActorType('user')
  @Roles(UserRole.ADMIN, UserRole.EDITOR)
  @Post()
  @ApiOperation({ summary: 'Create a form field for an event (staff only)' })
  create(
    @Body() dto: CreateEventFormFieldDto,
    @CurrentActor() actor: UserJwtPayload,
  ) {
    return this.formFieldsService.create(dto, actor.tenantId);
  }

  @Get()
  @ApiOperation({ summary: 'List form fields by event' })
  findByEvent(
    @Query('eventId', ParseUUIDPipe) eventId: string,
    @CurrentActor() actor: JwtPayload,
  ) {
    return this.formFieldsService.findByEvent(
      eventId,
      actor.type === 'user' ? actor.tenantId : undefined,
    );
  }

  @ActorType('user')
  @Roles(UserRole.ADMIN, UserRole.EDITOR)
  @Put(':id')
  @ApiOperation({ summary: 'Update a form field (staff only)' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateEventFormFieldDto,
    @CurrentActor() actor: UserJwtPayload,
  ) {
    return this.formFieldsService.update(id, dto, actor.tenantId);
  }

  @ActorType('user')
  @Roles(UserRole.ADMIN, UserRole.EDITOR)
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a form field (staff only)' })
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentActor() actor: UserJwtPayload,
  ) {
    return this.formFieldsService.remove(id, actor.tenantId);
  }
}
