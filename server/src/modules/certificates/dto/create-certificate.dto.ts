import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';

export class CreateCertificateDto {
  @ApiProperty({ example: 'b3f1c2a4-1234-4a5b-9c8d-1234567890ab' })
  @IsUUID()
  @IsNotEmpty()
  eventId!: string;
}
