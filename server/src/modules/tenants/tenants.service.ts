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

@Injectable()
export class TenantsService {
  constructor(
    @InjectRepository(Tenant)
    private readonly tenantRepository: Repository<Tenant>,
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
}
