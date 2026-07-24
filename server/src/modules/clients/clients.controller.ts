import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ClientsService } from './clients.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { Public } from '../auth/decorators/public.decorator';
import { ActorType } from '../auth/decorators/actor-type.decorator';
import { CurrentActor } from '../auth/decorators/current-actor.decorator';
import type {
  ClientJwtPayload,
  JwtPayload,
  UserJwtPayload,
} from '../auth/interfaces/jwt-payload.interface';

@ApiTags('clients')
@Controller('clients')
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @Public()
  @Post()
  @ApiOperation({ summary: 'Create a new client (public sign-up)' })
  create(@Body() dto: CreateClientDto) {
    return this.clientsService.create(dto);
  }

  @ActorType('user')
  @Get()
  @ApiOperation({
    summary: 'List clients who bought a ticket for your tenant (staff only)',
  })
  findAll(@CurrentActor() actor: UserJwtPayload) {
    return this.clientsService.findAllForTenant(actor.tenantId);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get a client by id (own profile, or staff scoped to own tenant)',
  })
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentActor() actor: JwtPayload,
  ) {
    if (actor.type === 'client') {
      if (actor.sub !== id) {
        throw new ForbiddenException('You can only view your own profile');
      }
      return this.clientsService.findOne(id);
    }
    return this.clientsService.findOneForTenant(id, actor.tenantId);
  }

  @ActorType('client')
  @Put(':id')
  @ApiOperation({ summary: 'Update your own client profile' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateClientDto,
    @CurrentActor() actor: ClientJwtPayload,
  ) {
    if (actor.sub !== id) {
      throw new ForbiddenException('You can only update your own profile');
    }
    return this.clientsService.update(id, dto);
  }

  @ActorType('client')
  @Delete(':id')
  @ApiOperation({ summary: 'Soft delete your own client account' })
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentActor() actor: ClientJwtPayload,
  ) {
    if (actor.sub !== id) {
      throw new ForbiddenException('You can only delete your own account');
    }
    return this.clientsService.remove(id);
  }
}
