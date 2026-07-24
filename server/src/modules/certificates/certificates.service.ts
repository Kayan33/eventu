import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Certificate } from './entities/certificate.entity';
import { Ticket } from '../tickets/entities/ticket.entity';
import { Event } from '../events/entities/event.entity';
import { CreateCertificateDto } from './dto/create-certificate.dto';
import { generateCode } from '../../common/utils/random-code.util';

@Injectable()
export class CertificatesService {
  constructor(
    @InjectRepository(Certificate)
    private readonly certificateRepository: Repository<Certificate>,
    @InjectRepository(Ticket)
    private readonly ticketRepository: Repository<Ticket>,
    @InjectRepository(Event)
    private readonly eventRepository: Repository<Event>,
  ) {}

  async create(
    dto: CreateCertificateDto,
    clientId: string,
  ): Promise<Certificate> {
    const checkedInTicket = await this.ticketRepository
      .createQueryBuilder('ticket')
      .innerJoin('ticket.ticketType', 'ticketType')
      .where('ticket.clientId = :clientId', { clientId })
      .andWhere('ticketType.eventId = :eventId', { eventId: dto.eventId })
      .andWhere('ticket.checkedInAt IS NOT NULL')
      .getOne();

    if (!checkedInTicket) {
      throw new BadRequestException('Client has not checked in to this event');
    }

    const certificate = this.certificateRepository.create({
      eventId: dto.eventId,
      clientId,
      code: generateCode('CERT'),
    });
    return await this.certificateRepository.save(certificate);
  }

  async findByEvent(
    eventId: string,
    tenantId?: string,
  ): Promise<Certificate[]> {
    if (tenantId) {
      const event = await this.eventRepository.findOne({
        where: { id: eventId },
      });
      if (!event || event.tenantId !== tenantId) {
        throw new NotFoundException('Event not found');
      }
    }
    return await this.certificateRepository.find({ where: { eventId } });
  }

  async validateByCode(code: string): Promise<Certificate> {
    const certificate = await this.certificateRepository.findOne({
      where: { code },
    });
    if (!certificate) {
      throw new NotFoundException('Certificate not found');
    }
    return certificate;
  }
}
