import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class UploadPaymentDto {
  @ApiProperty({ example: 'https://cdn.eventu.com/receipts/payment.png' })
  @IsString()
  @IsNotEmpty()
  pixReceiptUrl!: string;
}
