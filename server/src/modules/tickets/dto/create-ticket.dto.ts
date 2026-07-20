import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsNotEmpty,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';

export class TicketFormResponseInputDto {
  @ApiProperty({ example: 'c4f1c2a4-1234-4a5b-9c8d-1234567890cd' })
  @IsUUID()
  @IsNotEmpty()
  formFieldId!: string;

  @ApiProperty({ example: 'Medicina' })
  @IsString()
  @IsNotEmpty()
  value!: string;
}

export class CreateTicketDto {
  @ApiProperty({ example: 'b3f1c2a4-1234-4a5b-9c8d-1234567890ab' })
  @IsUUID()
  @IsNotEmpty()
  ticketTypeId!: string;

  @ApiProperty({ example: 'd5f1c2a4-1234-4a5b-9c8d-1234567890ef' })
  @IsUUID()
  @IsNotEmpty()
  clientId!: string;

  @ApiProperty({ type: [TicketFormResponseInputDto] })
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => TicketFormResponseInputDto)
  formResponses!: TicketFormResponseInputDto[];
}
