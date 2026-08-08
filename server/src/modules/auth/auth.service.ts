import {
  ConflictException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { UsersService } from '../users/users.service';
import { ClientsService } from '../clients/clients.service';
import { Tenant } from '../tenants/entities/tenant.entity';
import { User } from '../users/entities/user.entity';
import { UserRole } from '../../common/enums/user-role.enum';
import { slugify } from '../../common/utils/slugify.util';
import { hashPassword, verifyPassword } from '../../common/utils/password.util';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import {
  UserJwtPayload,
  ClientJwtPayload,
} from './interfaces/jwt-payload.interface';

export interface AuthResult<T> {
  accessToken: string;
  actor: T;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly clientsService: ClientsService,
    private readonly jwtService: JwtService,
    @InjectDataSource() private readonly dataSource: DataSource,
  ) {}

  async register(dto: RegisterDto): Promise<AuthResult<UserJwtPayload>> {
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

      const passwordHash = await hashPassword(dto.password);

      const user = manager.create(User, {
        tenantId: tenant.id,
        name: dto.name,
        email: dto.email,
        passwordHash,
        role: UserRole.ADMIN,
      });
      await manager.save(user);

      const actor: UserJwtPayload = {
        sub: user.id,
        tenantId: tenant.id,
        role: user.role,
        type: 'user',
      };
      return { accessToken: await this.jwtService.signAsync(actor), actor };
    });
  }

  async loginUser(dto: LoginDto): Promise<AuthResult<UserJwtPayload>> {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user || !(await verifyPassword(user.passwordHash, dto.password))) {
      this.logger.warn(`Failed staff login attempt for "${dto.email}"`);
      throw new UnauthorizedException('Invalid credentials');
    }

    const actor: UserJwtPayload = {
      sub: user.id,
      tenantId: user.tenantId,
      role: user.role,
      type: 'user',
    };
    return { accessToken: await this.jwtService.signAsync(actor), actor };
  }

  async loginClient(dto: LoginDto): Promise<AuthResult<ClientJwtPayload>> {
    const client = await this.clientsService.findByEmail(dto.email);
    if (!client || !(await verifyPassword(client.passwordHash, dto.password))) {
      this.logger.warn(`Failed client login attempt for "${dto.email}"`);
      throw new UnauthorizedException('Invalid credentials');
    }

    const actor: ClientJwtPayload = { sub: client.id, type: 'client' };
    return { accessToken: await this.jwtService.signAsync(actor), actor };
  }
}
