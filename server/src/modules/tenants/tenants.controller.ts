import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { TenantsService } from './tenants.service';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';
import { ActorType } from '../auth/decorators/actor-type.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentActor } from '../auth/decorators/current-actor.decorator';
import type { UserJwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { UserRole } from '../../common/enums/user-role.enum';

@ApiTags('tenants')
@Controller('tenants')
export class TenantsController {
  constructor(private readonly tenantsService: TenantsService) {}

  @ActorType('user')
  @Post()
  @ApiOperation({ summary: 'Create a tenant (staff only)' })
  create(@Body() dto: CreateTenantDto) {
    return this.tenantsService.create(dto);
  }

  @ActorType('user')
  @Get()
  @ApiOperation({ summary: 'List tenants (staff only, sees own tenant)' })
  findAll(@CurrentActor() actor: UserJwtPayload) {
    return this.tenantsService.findAll(actor.tenantId);
  }

  @ActorType('user')
  @Get(':id')
  @ApiOperation({ summary: 'Get a tenant by id (staff only, own tenant)' })
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentActor() actor: UserJwtPayload,
  ) {
    return this.tenantsService.findOne(id, actor.tenantId);
  }

  @ActorType('user')
  @Roles(UserRole.ADMIN)
  @Put(':id')
  @ApiOperation({ summary: 'Update a tenant (admin only, own tenant)' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateTenantDto,
    @CurrentActor() actor: UserJwtPayload,
  ) {
    return this.tenantsService.update(id, dto, actor.tenantId);
  }

  @ActorType('user')
  @Roles(UserRole.ADMIN)
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a tenant (admin only, own tenant)' })
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentActor() actor: UserJwtPayload,
  ) {
    return this.tenantsService.remove(id, actor.tenantId);
  }

  @ActorType('user')
  @Roles(UserRole.ADMIN)
  @Post(':id/pix-qrcode')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({
    summary: 'Upload the tenant PIX QR code image (admin only, own tenant)',
  })
  uploadPixQrCode(
    @Param('id', ParseUUIDPipe) id: string,
    @UploadedFile() file: Express.Multer.File,
    @CurrentActor() actor: UserJwtPayload,
  ) {
    return this.tenantsService.uploadPixQrCode(id, file, actor.tenantId);
  }
}
