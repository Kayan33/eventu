import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateEventDto {
  @ApiProperty({ example: 'Semana Acadêmica 2026' })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiPropertyOptional({ example: 'Evento anual de integração acadêmica.' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: '2026-09-10T09:00:00.000Z' })
  @IsDateString()
  startDate!: string;

  @ApiProperty({ example: '2026-09-12T18:00:00.000Z' })
  @IsDateString()
  endDate!: string;

  @ApiPropertyOptional({ example: 'Auditório Central' })
  @IsOptional()
  @IsString()
  location?: string;
}
