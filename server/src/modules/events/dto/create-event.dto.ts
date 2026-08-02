import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { CapacityMode } from '../../../common/enums/capacity-mode.enum';
import { LocationType } from '../../../common/enums/location-type.enum';

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

  @ApiPropertyOptional({
    enum: LocationType,
    default: LocationType.PRESENCIAL,
    example: LocationType.PRESENCIAL,
  })
  @IsOptional()
  @IsEnum(LocationType)
  locationType?: LocationType;

  @ApiPropertyOptional({
    enum: CapacityMode,
    default: CapacityMode.PER_TICKET_TYPE,
    example: CapacityMode.PER_TICKET_TYPE,
  })
  @IsOptional()
  @IsEnum(CapacityMode)
  capacityMode?: CapacityMode;

  @ApiPropertyOptional({
    example: 200,
    description: 'Required when capacityMode is total',
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  totalCapacity?: number;
}
