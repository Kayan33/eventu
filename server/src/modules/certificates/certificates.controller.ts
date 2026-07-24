import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CertificatesService } from './certificates.service';
import { CreateCertificateDto } from './dto/create-certificate.dto';
import { Public } from '../auth/decorators/public.decorator';
import { ActorType } from '../auth/decorators/actor-type.decorator';
import { CurrentActor } from '../auth/decorators/current-actor.decorator';
import type {
  ClientJwtPayload,
  UserJwtPayload,
} from '../auth/interfaces/jwt-payload.interface';

@ApiTags('certificates')
@Controller('certificates')
export class CertificatesController {
  constructor(private readonly certificatesService: CertificatesService) {}

  @ActorType('client')
  @Post()
  @ApiOperation({ summary: 'Issue your own certificate (client only)' })
  create(
    @Body() dto: CreateCertificateDto,
    @CurrentActor() actor: ClientJwtPayload,
  ) {
    return this.certificatesService.create(dto, actor.sub);
  }

  @ActorType('user')
  @Get()
  @ApiOperation({ summary: 'List certificates by event (staff only)' })
  findByEvent(
    @Query('eventId', ParseUUIDPipe) eventId: string,
    @CurrentActor() actor: UserJwtPayload,
  ) {
    return this.certificatesService.findByEvent(eventId, actor.tenantId);
  }

  @Public()
  @Get('validate/:code')
  @ApiOperation({ summary: 'Validate a certificate by its code (public)' })
  validateByCode(@Param('code') code: string) {
    return this.certificatesService.validateByCode(code);
  }
}
