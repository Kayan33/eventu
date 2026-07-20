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

@ApiTags('certificates')
@Controller('certificates')
export class CertificatesController {
  constructor(private readonly certificatesService: CertificatesService) {}

  @Post()
  @ApiOperation({ summary: 'Issue a certificate' })
  create(@Body() dto: CreateCertificateDto) {
    return this.certificatesService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List certificates by event' })
  findByEvent(@Query('eventId', ParseUUIDPipe) eventId: string) {
    return this.certificatesService.findByEvent(eventId);
  }

  @Get('validate/:code')
  @ApiOperation({ summary: 'Validate a certificate by its code (public)' })
  validateByCode(@Param('code') code: string) {
    return this.certificatesService.validateByCode(code);
  }
}
