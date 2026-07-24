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
import { TicketTypesService } from './ticket-types.service';
import { CreateTicketTypeDto } from './dto/create-ticket-type.dto';
import { UpdateTicketTypeDto } from './dto/update-ticket-type.dto';
import { ActorType } from '../auth/decorators/actor-type.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentActor } from '../auth/decorators/current-actor.decorator';
import type {
  JwtPayload,
  UserJwtPayload,
} from '../auth/interfaces/jwt-payload.interface';
import { UserRole } from '../../common/enums/user-role.enum';

@ApiTags('ticket-types')
@Controller('ticket-types')
export class TicketTypesController {
  constructor(private readonly ticketTypesService: TicketTypesService) {}

  @ActorType('user')
  @Roles(UserRole.ADMIN, UserRole.EDITOR)
  @Post()
  @ApiOperation({ summary: 'Create a ticket type for an event (staff only)' })
  create(
    @Body() dto: CreateTicketTypeDto,
    @CurrentActor() actor: UserJwtPayload,
  ) {
    return this.ticketTypesService.create(dto, actor.tenantId);
  }

  @Get()
  @ApiOperation({ summary: 'List ticket types by event' })
  findByEvent(
    @Query('eventId', ParseUUIDPipe) eventId: string,
    @CurrentActor() actor: JwtPayload,
  ) {
    return this.ticketTypesService.findByEvent(
      eventId,
      actor.type === 'user' ? actor.tenantId : undefined,
    );
  }

  @ActorType('user')
  @Roles(UserRole.ADMIN, UserRole.EDITOR)
  @Put(':id')
  @ApiOperation({ summary: 'Update a ticket type (staff only)' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateTicketTypeDto,
    @CurrentActor() actor: UserJwtPayload,
  ) {
    return this.ticketTypesService.update(id, dto, actor.tenantId);
  }

  @ActorType('user')
  @Roles(UserRole.ADMIN, UserRole.EDITOR)
  @Delete(':id')
  @ApiOperation({
    summary: 'Delete a ticket type (only if no tickets sold, staff only)',
  })
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentActor() actor: UserJwtPayload,
  ) {
    return this.ticketTypesService.remove(id, actor.tenantId);
  }
}
