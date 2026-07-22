import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import * as argon2 from 'argon2';
import { UsersService } from '../users/users.service';
import { ClientsService } from '../clients/clients.service';
import { Tenant } from '../tenants/entities/tenant.entity';
import { User } from '../users/entities/user.entity';
import { UserRole } from '../../common/enums/user-role.enum';
import { slugify } from '../../common/utils/slugify.util';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import {
  UserJwtPayload,
  ClientJwtPayload,
} from './interfaces/jwt-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly clientsService: ClientsService,
    private readonly jwtService: JwtService,
    @InjectDataSource() private readonly dataSource: DataSource,
  ) {}

  async register(dto: RegisterDto): Promise<{ accessToken: string }> {
    return await this.dataSource.transaction(async (manager) => {
      const slug = slugify(dto.tenantName);

      const tenantExists = await manager.findOne(Tenant, { where: { slug } });
      if (tenantExists) {
        throw new ConflictException(
          'An organization with this name already exists',
        );
      }

      const emailExists = await manager.findOne(User, {
        where: { email: dto.email },
      });
      if (emailExists) {
        throw new ConflictException('User already exists');
      }

      const tenant = manager.create(Tenant, {
        name: dto.tenantName,
        slug,
      });
      await manager.save(tenant);

      const passwordHash = (await argon2.hash(dto.password, {
        type: argon2.argon2id,
      })) as string;

      const user = manager.create(User, {
        tenantId: tenant.id,
        name: dto.name,
        email: dto.email,
        passwordHash,
        role: UserRole.ADMIN,
      });
      await manager.save(user);

      const payload: UserJwtPayload = {
        sub: user.id,
        tenantId: tenant.id,
        role: user.role,
        type: 'user',
      };
      return { accessToken: await this.jwtService.signAsync(payload) };
    });
  }

  async loginUser(dto: LoginDto): Promise<{ accessToken: string }> {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user || !(await argon2.verify(user.passwordHash, dto.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload: UserJwtPayload = {
      sub: user.id,
      tenantId: user.tenantId,
      role: user.role,
      type: 'user',
    };
    return { accessToken: await this.jwtService.signAsync(payload) };
  }

  async loginClient(dto: LoginDto): Promise<{ accessToken: string }> {
    const client = await this.clientsService.findByEmail(dto.email);
    if (!client || !(await argon2.verify(client.passwordHash, dto.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload: ClientJwtPayload = { sub: client.id, type: 'client' };
    return { accessToken: await this.jwtService.signAsync(payload) };
  }
}
