import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';

export class CreateTicketTypeDto {
  @ApiProperty({ example: 'b3f1c2a4-1234-4a5b-9c8d-1234567890ab' })
  @IsUUID()
  @IsNotEmpty()
  eventId!: string;

  @ApiProperty({ example: 'Inteira' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ example: 50.0 })
  @IsNumber()
  @Min(0)
  basePrice!: number;

  @ApiProperty({ example: 100 })
  @IsInt()
  @Min(1)
  quantity!: number;

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @IsInt()
  displayOrder?: number;
}
