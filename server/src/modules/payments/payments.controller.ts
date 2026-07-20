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

@ApiTags('payments')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Get()
  @ApiOperation({ summary: 'List payments, optionally filtered by status' })
  findByStatus(@Query('status') status?: PaymentStatus) {
    return this.paymentsService.findByStatus(status);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a payment by id' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.paymentsService.findOne(id);
  }

  @Patch(':id/upload')
  @ApiOperation({ summary: 'Upload the PIX receipt for a payment' })
  upload(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UploadPaymentDto,
  ) {
    return this.paymentsService.upload(id, dto);
  }

  @Patch(':id/review')
  @ApiOperation({ summary: 'Approve or reject a payment' })
  review(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdatePaymentStatusDto,
  ) {
    return this.paymentsService.review(id, dto);
  }
}
