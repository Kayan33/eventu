import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { PaymentStatus } from '../../common/enums/payment-status.enum';
import { UploadPaymentDto } from './dto/upload-payment.dto';
import { UpdatePaymentStatusDto } from './dto/update-payment-status.dto';
import { ActorType } from '../auth/decorators/actor-type.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentActor } from '../auth/decorators/current-actor.decorator';
import type {
  ClientJwtPayload,
  JwtPayload,
  UserJwtPayload,
} from '../auth/interfaces/jwt-payload.interface';
import { UserRole } from '../../common/enums/user-role.enum';

@ApiTags('payments')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Get()
  @ApiOperation({
    summary: 'List payments (client sees own, staff sees own tenant)',
  })
  findByStatus(
    @Query('status') status: PaymentStatus | undefined,
    @CurrentActor() actor: JwtPayload,
  ) {
    return this.paymentsService.findByStatus(
      status,
      actor.type === 'client'
        ? { clientId: actor.sub }
        : { tenantId: actor.tenantId },
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a payment by id' })
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentActor() actor: JwtPayload,
  ) {
    return this.paymentsService.findOne(
      id,
      actor.type === 'client'
        ? { clientId: actor.sub }
        : { tenantId: actor.tenantId },
    );
  }

  @ActorType('client')
  @Patch(':id/upload')
  @ApiOperation({ summary: 'Upload the PIX receipt for your own payment' })
  upload(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UploadPaymentDto,
    @CurrentActor() actor: ClientJwtPayload,
  ) {
    return this.paymentsService.upload(id, dto, actor.sub);
  }

  @ActorType('user')
  @Roles(UserRole.ADMIN, UserRole.EDITOR)
  @Patch(':id/review')
  @ApiOperation({
    summary: 'Approve or reject a payment (staff only, own tenant)',
  })
  review(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdatePaymentStatusDto,
    @CurrentActor() actor: UserJwtPayload,
  ) {
    return this.paymentsService.review(id, dto, actor.tenantId);
  }
}
