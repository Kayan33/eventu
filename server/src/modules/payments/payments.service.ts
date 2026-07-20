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

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    @InjectRepository(Ticket)
    private readonly ticketRepository: Repository<Ticket>,
  ) {}

  async findByStatus(status?: PaymentStatus): Promise<Payment[]> {
    return await this.paymentRepository.find({
      where: status ? { status } : {},
    });
  }

  async findOne(id: string): Promise<Payment> {
    const payment = await this.paymentRepository.findOne({ where: { id } });
    if (!payment) {
      throw new NotFoundException('Payment not found');
    }
    return payment;
  }

  async upload(id: string, dto: UploadPaymentDto): Promise<Payment> {
    const payment = await this.findOne(id);
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

  async review(id: string, dto: UpdatePaymentStatusDto): Promise<Payment> {
    const payment = await this.findOne(id);
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
