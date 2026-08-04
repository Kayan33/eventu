import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { PixKeyType } from '../../../common/enums/pix-key-type.enum';

export class CreateTenantDto {
  @ApiProperty({ example: 'Faculdade Exemplo' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiPropertyOptional({ example: '12345678900' })
  @IsOptional()
  @IsString()
  pixKey?: string;

  @ApiPropertyOptional({ enum: PixKeyType, example: PixKeyType.CPF })
  @IsOptional()
  @IsEnum(PixKeyType)
  pixKeyType?: PixKeyType;

  @ApiPropertyOptional({
    example: 'https://cdn.eventkt.com.br/qrcodes/tenant.png',
  })
  @IsOptional()
  @IsString()
  pixQrCodeUrl?: string;

  @ApiPropertyOptional({ example: 'Faculdade Exemplo LTDA' })
  @IsOptional()
  @IsString()
  pixBeneficiary?: string;
}
