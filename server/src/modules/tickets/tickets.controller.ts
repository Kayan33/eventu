import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { TicketsService } from './tickets.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { ActorType } from '../auth/decorators/actor-type.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentActor } from '../auth/decorators/current-actor.decorator';
import type {
  ClientJwtPayload,
  JwtPayload,
  UserJwtPayload,
} from '../auth/interfaces/jwt-payload.interface';
import { UserRole } from '../../common/enums/user-role.enum';

@ApiTags('tickets')
@Controller('tickets')
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @ActorType('client')
  @Post()
  @ApiOperation({
    summary: 'Create a ticket (with form responses and payment) - client only',
  })
  create(
    @Body() dto: CreateTicketDto,
    @CurrentActor() actor: ClientJwtPayload,
  ) {
    return this.ticketsService.create(dto, actor.sub);
  }

  @Get()
  @ApiOperation({
    summary: 'List tickets (client sees own, staff sees own tenant)',
  })
  findAll(@CurrentActor() actor: JwtPayload) {
    return this.ticketsService.findAll(
      actor.type === 'client'
        ? { clientId: actor.sub }
        : { tenantId: actor.tenantId },
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a ticket by id' })
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentActor() actor: JwtPayload,
  ) {
    return this.ticketsService.findOne(
      id,
      actor.type === 'client'
        ? { clientId: actor.sub }
        : { tenantId: actor.tenantId },
    );
  }

  @ActorType('user')
  @Roles(UserRole.ADMIN, UserRole.EDITOR)
  @Patch(':id/check-in')
  @ApiOperation({ summary: 'Check in a ticket (staff only, own tenant)' })
  checkIn(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentActor() actor: UserJwtPayload,
  ) {
    return this.ticketsService.checkIn(id, actor.tenantId);
  }
}
