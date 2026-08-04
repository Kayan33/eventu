import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tenant } from './entities/tenant.entity';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';
import { slugify } from '../../common/utils/slugify.util';
import { StorageService } from '../storage/storage.service';

const PIX_QRCODE_BUCKET = 'pix-qrcodes';
const PIX_QRCODE_MIME_EXTENSIONS: Record<string, string> = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/webp': 'webp',
};

@Injectable()
export class TenantsService {
  constructor(
    @InjectRepository(Tenant)
    private readonly tenantRepository: Repository<Tenant>,
    private readonly storageService: StorageService,
  ) {}

  async create(dto: CreateTenantDto): Promise<Tenant> {
    const slug = slugify(dto.name);

    const exists = await this.tenantRepository.findOne({ where: { slug } });
    if (exists) {
      throw new ConflictException('Tenant with this name already exists');
    }

    const tenant = this.tenantRepository.create({ ...dto, slug });
    return await this.tenantRepository.save(tenant);
  }

  async findAll(tenantId?: string): Promise<Tenant[]> {
    return await this.tenantRepository.find(
      tenantId ? { where: { id: tenantId } } : {},
    );
  }

  async findOne(id: string, tenantId?: string): Promise<Tenant> {
    const tenant = await this.tenantRepository.findOne({ where: { id } });
    if (!tenant || (tenantId && tenant.id !== tenantId)) {
      throw new NotFoundException('Tenant not found');
    }
    return tenant;
  }

  async update(
    id: string,
    dto: UpdateTenantDto,
    tenantId?: string,
  ): Promise<Tenant> {
    const tenant = await this.findOne(id, tenantId);
    Object.assign(tenant, dto);
    return await this.tenantRepository.save(tenant);
  }

  async remove(id: string, tenantId?: string): Promise<void> {
    const tenant = await this.findOne(id, tenantId);
    await this.tenantRepository.remove(tenant);
  }

  async uploadPixQrCode(
    id: string,
    file: Express.Multer.File,
    tenantId?: string,
  ): Promise<Tenant> {
    const tenant = await this.findOne(id, tenantId);
    const previousQrCodeUrl = tenant.pixQrCodeUrl;

    tenant.pixQrCodeUrl = await this.storageService.replaceFile(
      PIX_QRCODE_BUCKET,
      file,
      {
        subject: 'QR code image',
        idPrefix: tenant.id,
        mimeExtensions: PIX_QRCODE_MIME_EXTENSIONS,
        allowedLabel: 'PNG, JPEG or WEBP',
        maxSizeBytes: 5 * 1024 * 1024,
        isPublic: true,
      },
    );
    const saved = await this.tenantRepository.save(tenant);

    if (previousQrCodeUrl) {
      await this.storageService.deletePublicFileByUrl(
        PIX_QRCODE_BUCKET,
        previousQrCodeUrl,
      );
    }

    return saved;
  }
}
