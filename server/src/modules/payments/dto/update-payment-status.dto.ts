import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export enum PaymentReviewStatus {
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

export class UpdatePaymentStatusDto {
  @ApiProperty({
    enum: PaymentReviewStatus,
    example: PaymentReviewStatus.APPROVED,
  })
  @IsEnum(PaymentReviewStatus)
  status!: PaymentReviewStatus;

  @ApiPropertyOptional({ example: 'Comprovante ilegível' })
  @IsOptional()
  @IsString()
  rejectionReason?: string;
}
