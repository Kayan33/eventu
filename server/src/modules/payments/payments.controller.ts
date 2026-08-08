import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { PaymentStatus } from '../../common/enums/payment-status.enum';
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
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Upload the PIX receipt for your own payment' })
  upload(
    @Param('id', ParseUUIDPipe) id: string,
    @UploadedFile() file: Express.Multer.File,
    @CurrentActor() actor: ClientJwtPayload,
  ) {
    return this.paymentsService.upload(id, file, actor.sub);
  }

  @Get(':id/receipt-url')
  @ApiOperation({
    summary: 'Get a short-lived signed URL to view the payment receipt',
  })
  async getReceiptUrl(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentActor() actor: JwtPayload,
  ) {
    const url = await this.paymentsService.getReceiptUrl(
      id,
      actor.type === 'client'
        ? { clientId: actor.sub }
        : { tenantId: actor.tenantId },
    );
    return { url };
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
    return this.paymentsService.review(id, dto, actor.tenantId, actor.sub);
  }
}
