import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString, IsUUID, Min } from 'class-validator';

export class CreatePricingRuleDto {
  @ApiProperty({ example: 'b3f1c2a4-1234-4a5b-9c8d-1234567890ab' })
  @IsUUID()
  @IsNotEmpty()
  ticketTypeId!: string;

  @ApiProperty({ example: 'c4f1c2a4-1234-4a5b-9c8d-1234567890cd' })
  @IsUUID()
  @IsNotEmpty()
  formFieldId!: string;

  @ApiProperty({ example: 'Medicina' })
  @IsString()
  @IsNotEmpty()
  fieldValue!: string;

  @ApiProperty({ example: 80.0 })
  @IsNumber()
  @Min(0)
  price!: number;
}
