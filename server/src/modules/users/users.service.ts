import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { hashPassword } from '../../common/utils/password.util';
import { UserRole } from '../../common/enums/user-role.enum';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}

  async create(dto: CreateUserDto, tenantId: string): Promise<User> {
    const exists = await this.userRepository.findOne({
      where: { email: dto.email },
    });
    if (exists) {
      throw new ConflictException('User already exists');
    }

    const passwordHash = await hashPassword(dto.password);

    const user = this.userRepository.create({
      tenantId,
      name: dto.name,
      email: dto.email,
      role: dto.role,
      passwordHash,
    });
    return await this.userRepository.save(user);
  }

  async findAll(tenantId?: string): Promise<User[]> {
    return await this.userRepository.find(
      tenantId ? { where: { tenantId } } : {},
    );
  }

  async findByEmail(email: string): Promise<User | null> {
    return await this.userRepository.findOne({ where: { email } });
  }

  async findOne(id: string, tenantId?: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user || (tenantId && user.tenantId !== tenantId)) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async update(
    id: string,
    dto: UpdateUserDto,
    tenantId?: string,
    actorId?: string,
  ): Promise<User> {
    const user = await this.findOne(id, tenantId);
    const previousRole = user.role;

    if (dto.email && dto.email !== user.email) {
      const exists = await this.userRepository.findOne({
        where: { email: dto.email },
      });
      if (exists) {
        throw new ConflictException('Email já cadastrado');
      }
    }

    if (dto.role && dto.role !== UserRole.ADMIN) {
      await this.assertNotLastAdmin(user);
    }

    const { password, ...rest } = dto;
    const passwordHash = password ? await hashPassword(password) : undefined;

    Object.assign(user, { ...rest, ...(passwordHash && { passwordHash }) });
    const saved = await this.userRepository.save(user);

    if (dto.role && dto.role !== previousRole) {
      this.logger.warn(
        `User ${user.id} role changed from ${previousRole} to ${dto.role} by user ${actorId ?? 'unknown'}`,
      );
    }

    return saved;
  }

  async remove(id: string, tenantId?: string, actorId?: string): Promise<void> {
    const user = await this.findOne(id, tenantId);
    await this.assertNotLastAdmin(user);
    await this.userRepository.softDelete(id);
    this.logger.warn(
      `User ${user.id} (${user.email}) removed by user ${actorId ?? 'unknown'}`,
    );
  }

  /** Throws if `user` is an admin and removing/demoting them would leave the tenant with none. */
  private async assertNotLastAdmin(user: User): Promise<void> {
    if (user.role !== UserRole.ADMIN) {
      return;
    }
    const otherAdmins = await this.userRepository.count({
      where: {
        tenantId: user.tenantId,
        role: UserRole.ADMIN,
        id: Not(user.id),
      },
    });
    if (otherAdmins === 0) {
      throw new BadRequestException('Tenant must have at least one admin');
    }
  }
}
