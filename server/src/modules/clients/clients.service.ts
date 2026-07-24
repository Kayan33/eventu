import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as argon2 from 'argon2';
import { Client } from './entities/client.entity';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';

@Injectable()
export class ClientsService {
  constructor(
    @InjectRepository(Client)
    private readonly clientRepository: Repository<Client>,
  ) {}

  async create(dto: CreateClientDto): Promise<Client> {
    const emailExists = await this.clientRepository.findOne({
      where: { email: dto.email },
    });
    if (emailExists) {
      throw new ConflictException('Client with this email already exists');
    }

    const cpfExists = await this.clientRepository.findOne({
      where: { cpf: dto.cpf },
    });
    if (cpfExists) {
      throw new ConflictException('Client with this CPF already exists');
    }

    const passwordHash = (await argon2.hash(dto.password, {
      type: argon2.argon2id,
    })) as string;

    const client = this.clientRepository.create({
      name: dto.name,
      email: dto.email,
      cpf: dto.cpf,
      passwordHash,
    });
    return await this.clientRepository.save(client);
  }

  async findAllForTenant(tenantId: string): Promise<Client[]> {
    return await this.clientRepository
      .createQueryBuilder('client')
      .innerJoin('client.tickets', 'ticket')
      .innerJoin('ticket.ticketType', 'ticketType')
      .innerJoin('ticketType.event', 'event')
      .where('event.tenantId = :tenantId', { tenantId })
      .distinct(true)
      .getMany();
  }

  async findByEmail(email: string): Promise<Client | null> {
    return await this.clientRepository.findOne({ where: { email } });
  }

  async findOne(id: string): Promise<Client> {
    const client = await this.clientRepository.findOne({ where: { id } });
    if (!client) {
      throw new NotFoundException('Client not found');
    }
    return client;
  }

  async findOneForTenant(id: string, tenantId: string): Promise<Client> {
    const client = await this.clientRepository
      .createQueryBuilder('client')
      .innerJoin('client.tickets', 'ticket')
      .innerJoin('ticket.ticketType', 'ticketType')
      .innerJoin('ticketType.event', 'event')
      .where('client.id = :id', { id })
      .andWhere('event.tenantId = :tenantId', { tenantId })
      .getOne();
    if (!client) {
      throw new NotFoundException('Client not found');
    }
    return client;
  }

  async update(id: string, dto: UpdateClientDto): Promise<Client> {
    const client = await this.findOne(id);

    if (dto.email && dto.email !== client.email) {
      const exists = await this.clientRepository.findOne({
        where: { email: dto.email },
      });
      if (exists) {
        throw new ConflictException('Client with this email already exists');
      }
    }

    if (dto.cpf && dto.cpf !== client.cpf) {
      const exists = await this.clientRepository.findOne({
        where: { cpf: dto.cpf },
      });
      if (exists) {
        throw new ConflictException('Client with this CPF already exists');
      }
    }

    const { password, ...rest } = dto;
    const passwordHash = password
      ? ((await argon2.hash(password, { type: argon2.argon2id })) as string)
      : undefined;

    Object.assign(client, { ...rest, ...(passwordHash && { passwordHash }) });
    return await this.clientRepository.save(client);
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.clientRepository.softDelete(id);
  }
}
