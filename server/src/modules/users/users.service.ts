import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as argon2 from 'argon2';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
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

    const passwordHash = (await argon2.hash(dto.password, {
      type: argon2.argon2id,
    })) as string;

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
  ): Promise<User> {
    const user = await this.findOne(id, tenantId);

    if (dto.email && dto.email !== user.email) {
      const exists = await this.userRepository.findOne({
        where: { email: dto.email },
      });
      if (exists) {
        throw new ConflictException('Email já cadastrado');
      }
    }

    const { password, ...rest } = dto;
    const passwordHash = password
      ? ((await argon2.hash(password, { type: argon2.argon2id })) as string)
      : undefined;

    Object.assign(user, { ...rest, ...(passwordHash && { passwordHash }) });
    return await this.userRepository.save(user);
  }

  async remove(id: string, tenantId?: string): Promise<void> {
    await this.findOne(id, tenantId);
    await this.userRepository.softDelete(id);
  }
}
