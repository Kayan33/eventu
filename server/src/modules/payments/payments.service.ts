import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment } from './entities/payment.entity';
import { Ticket } from '../tickets/entities/ticket.entity';
import { PaymentStatus } from '../../common/enums/payment-status.enum';
import { TicketStatus } from '../../common/enums/ticket-status.enum';
import { UploadPaymentDto } from './dto/upload-payment.dto';
import {
  PaymentReviewStatus,
  UpdatePaymentStatusDto,
} from './dto/update-payment-status.dto';

export interface PaymentScope {
  clientId?: string;
  tenantId?: string;
}

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    @InjectRepository(Ticket)
    private readonly ticketRepository: Repository<Ticket>,
  ) {}

  async findByStatus(
    status?: PaymentStatus,
    scope: PaymentScope = {},
  ): Promise<Payment[]> {
    const qb = this.paymentRepository
      .createQueryBuilder('payment')
      .innerJoin('payment.ticket', 'ticket');

    if (status) {
      qb.andWhere('payment.status = :status', { status });
    }
    if (scope.clientId) {
      qb.andWhere('ticket.clientId = :clientId', { clientId: scope.clientId });
    }
    if (scope.tenantId) {
      qb.innerJoin('ticket.ticketType', 'ticketType')
        .innerJoin('ticketType.event', 'event')
        .andWhere('event.tenantId = :tenantId', { tenantId: scope.tenantId });
    }

    return await qb.getMany();
  }

  async findOne(id: string, scope: PaymentScope = {}): Promise<Payment> {
    const payment = await this.paymentRepository.findOne({
      where: { id },
      relations: { ticket: { ticketType: { event: true } } },
    });
    if (!payment) {
      throw new NotFoundException('Payment not found');
    }
    if (scope.clientId && payment.ticket.clientId !== scope.clientId) {
      throw new NotFoundException('Payment not found');
    }
    if (
      scope.tenantId &&
      payment.ticket.ticketType.event.tenantId !== scope.tenantId
    ) {
      throw new NotFoundException('Payment not found');
    }
    return payment;
  }

  async upload(
    id: string,
    dto: UploadPaymentDto,
    clientId: string,
  ): Promise<Payment> {
    const payment = await this.findOne(id, { clientId });
    if (payment.status !== PaymentStatus.PENDING) {
      throw new BadRequestException(
        'Only pending payments can receive a receipt',
      );
    }

    payment.pixReceiptUrl = dto.pixReceiptUrl;
    payment.uploadedAt = new Date();
    payment.status = PaymentStatus.UPLOADED;
    return await this.paymentRepository.save(payment);
  }

  async review(
    id: string,
    dto: UpdatePaymentStatusDto,
    tenantId: string,
  ): Promise<Payment> {
    const payment = await this.findOne(id, { tenantId });
    if (payment.status !== PaymentStatus.UPLOADED) {
      throw new BadRequestException('Only uploaded payments can be reviewed');
    }

    payment.status =
      dto.status === PaymentReviewStatus.APPROVED
        ? PaymentStatus.APPROVED
        : PaymentStatus.REJECTED;
    payment.rejectionReason =
      dto.status === PaymentReviewStatus.REJECTED
        ? dto.rejectionReason
        : undefined;
    payment.reviewedAt = new Date();
    await this.paymentRepository.save(payment);

    if (dto.status === PaymentReviewStatus.APPROVED) {
      await this.ticketRepository.update(payment.ticketId, {
        status: TicketStatus.CONFIRMED,
      });
    }

    return payment;
  }
}
