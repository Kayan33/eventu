import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { FormFieldType } from '../../../common/enums/form-field-type.enum';

export class CreateEventFormFieldDto {
  @ApiProperty({ example: 'b3f1c2a4-1234-4a5b-9c8d-1234567890ab' })
  @IsUUID()
  @IsNotEmpty()
  eventId!: string;

  @ApiProperty({ example: 'Curso' })
  @IsString()
  @IsNotEmpty()
  label!: string;

  @ApiProperty({ enum: FormFieldType, example: FormFieldType.SELECT })
  @IsEnum(FormFieldType)
  type!: FormFieldType;

  @ApiPropertyOptional({ example: ['Engenharia', 'Medicina', 'Direito'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  options?: string[];

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isRequired?: boolean;

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @IsInt()
  displayOrder?: number;
}
