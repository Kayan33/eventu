import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ActorType } from '../auth/decorators/actor-type.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentActor } from '../auth/decorators/current-actor.decorator';
import type { UserJwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { UserRole } from '../../common/enums/user-role.enum';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ActorType('user')
  @Roles(UserRole.ADMIN)
  @Post()
  @ApiOperation({ summary: 'Create a helper user in your tenant (admin only)' })
  create(@Body() dto: CreateUserDto, @CurrentActor() actor: UserJwtPayload) {
    return this.usersService.create(dto, actor.tenantId);
  }

  @ActorType('user')
  @Get()
  @ApiOperation({ summary: 'List users in your tenant' })
  findAll(@CurrentActor() actor: UserJwtPayload) {
    return this.usersService.findAll(actor.tenantId);
  }

  @ActorType('user')
  @Get(':id')
  @ApiOperation({ summary: 'Get a user by id (own tenant)' })
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentActor() actor: UserJwtPayload,
  ) {
    return this.usersService.findOne(id, actor.tenantId);
  }

  @ActorType('user')
  @Roles(UserRole.ADMIN)
  @Put(':id')
  @ApiOperation({ summary: 'Update a user (admin only, own tenant)' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateUserDto,
    @CurrentActor() actor: UserJwtPayload,
  ) {
    return this.usersService.update(id, dto, actor.tenantId, actor.sub);
  }

  @ActorType('user')
  @Roles(UserRole.ADMIN)
  @Delete(':id')
  @ApiOperation({ summary: 'Soft delete a user (admin only, own tenant)' })
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentActor() actor: UserJwtPayload,
  ) {
    return this.usersService.remove(id, actor.tenantId, actor.sub);
  }
}
