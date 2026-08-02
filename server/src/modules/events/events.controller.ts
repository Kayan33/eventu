import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Put,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { ActorType } from '../auth/decorators/actor-type.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentActor } from '../auth/decorators/current-actor.decorator';
import type {
  JwtPayload,
  UserJwtPayload,
} from '../auth/interfaces/jwt-payload.interface';
import { UserRole } from '../../common/enums/user-role.enum';

@ApiTags('events')
@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @ActorType('user')
  @Roles(UserRole.ADMIN, UserRole.EDITOR)
  @Post()
  @ApiOperation({
    summary: 'Create an event (staff only, scoped to own tenant)',
  })
  create(@Body() dto: CreateEventDto, @CurrentActor() actor: UserJwtPayload) {
    return this.eventsService.create(dto, actor.tenantId);
  }

  @Get()
  @ApiOperation({
    summary: 'List events (staff sees only their tenant, clients see all)',
  })
  findAll(@CurrentActor() actor: JwtPayload) {
    return this.eventsService.findAll(
      actor.type === 'user' ? actor.tenantId : undefined,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an event by id' })
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentActor() actor: JwtPayload,
  ) {
    return this.eventsService.findOne(
      id,
      actor.type === 'user' ? actor.tenantId : undefined,
    );
  }

  @ActorType('user')
  @Roles(UserRole.ADMIN, UserRole.EDITOR)
  @Put(':id')
  @ApiOperation({ summary: 'Update an event (staff only, own tenant)' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateEventDto,
    @CurrentActor() actor: UserJwtPayload,
  ) {
    return this.eventsService.update(id, dto, actor.tenantId);
  }

  @ActorType('user')
  @Roles(UserRole.ADMIN, UserRole.EDITOR)
  @Delete(':id')
  @ApiOperation({
    summary: 'Delete an event (only if draft, staff only, own tenant)',
  })
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentActor() actor: UserJwtPayload,
  ) {
    return this.eventsService.remove(id, actor.tenantId);
  }

  @ActorType('user')
  @Roles(UserRole.ADMIN, UserRole.EDITOR)
  @Post(':id/cover')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({
    summary: 'Upload the event cover image (staff only, own tenant)',
  })
  uploadCover(
    @Param('id', ParseUUIDPipe) id: string,
    @UploadedFile() file: Express.Multer.File,
    @CurrentActor() actor: UserJwtPayload,
  ) {
    return this.eventsService.uploadCover(id, file, actor.tenantId);
  }

  @ActorType('user')
  @Roles(UserRole.ADMIN, UserRole.EDITOR)
  @Patch(':id/publish')
  @ApiOperation({
    summary: 'Publish a draft event (staff only, own tenant)',
  })
  publish(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentActor() actor: UserJwtPayload,
  ) {
    return this.eventsService.publish(id, actor.tenantId);
  }
}
