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
import {
  PaymentReviewStatus,
  UpdatePaymentStatusDto,
} from './dto/update-payment-status.dto';
import { StorageService } from '../storage/storage.service';

export interface PaymentScope {
  clientId?: string;
  tenantId?: string;
}

const RECEIPT_BUCKET = 'payment-receipts';
const RECEIPT_SIGNED_URL_SECONDS = 300;
const RECEIPT_MIME_EXTENSIONS: Record<string, string> = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/webp': 'webp',
  'application/pdf': 'pdf',
};

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    @InjectRepository(Ticket)
    private readonly ticketRepository: Repository<Ticket>,
    private readonly storageService: StorageService,
  ) {}

  async findByStatus(
    status?: PaymentStatus,
    scope: PaymentScope = {},
  ): Promise<Payment[]> {
    const qb = this.paymentRepository
      .createQueryBuilder('payment')
      .leftJoinAndSelect('payment.ticket', 'ticket')
      .leftJoinAndSelect('ticket.client', 'client')
      .leftJoinAndSelect('ticket.ticketType', 'ticketType')
      .leftJoinAndSelect('ticketType.event', 'event')
      .leftJoinAndSelect('ticket.formResponses', 'formResponses')
      .leftJoinAndSelect('formResponses.formField', 'formField')
      .orderBy('payment.createdAt', 'DESC');

    if (status) {
      qb.andWhere('payment.status = :status', { status });
    }
    if (scope.clientId) {
      qb.andWhere('ticket.clientId = :clientId', { clientId: scope.clientId });
    }
    if (scope.tenantId) {
      qb.andWhere('event.tenantId = :tenantId', { tenantId: scope.tenantId });
    }

    return await qb.getMany();
  }

  async findOne(id: string, scope: PaymentScope = {}): Promise<Payment> {
    const payment = await this.paymentRepository.findOne({
      where: { id },
      relations: { ticket: { client: true, ticketType: { event: true } } },
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
    file: Express.Multer.File,
    clientId: string,
  ): Promise<Payment> {
    const payment = await this.findOne(id, { clientId });
    if (
      payment.status !== PaymentStatus.PENDING &&
      payment.status !== PaymentStatus.REJECTED
    ) {
      throw new BadRequestException(
        'Only pending or rejected payments can receive a receipt',
      );
    }

    const previousPath = payment.pixReceiptUrl;
    // pixReceiptUrl holds a private bucket path here, not a public URL —
    // viewing it requires a signed URL, see getReceiptUrl().
    payment.pixReceiptUrl = await this.storageService.replaceFile(
      RECEIPT_BUCKET,
      file,
      {
        subject: 'Receipt',
        idPrefix: payment.id,
        mimeExtensions: RECEIPT_MIME_EXTENSIONS,
        allowedLabel: 'PNG, JPEG, WEBP or PDF',
        maxSizeBytes: 5 * 1024 * 1024,
        isPublic: false,
      },
    );
    payment.uploadedAt = new Date();
    payment.status = PaymentStatus.UPLOADED;
    payment.rejectionReason = undefined;
    const saved = await this.paymentRepository.save(payment);

    if (previousPath) {
      await this.storageService.deletePrivateFile(RECEIPT_BUCKET, previousPath);
    }

    return saved;
  }

  async getReceiptUrl(id: string, scope: PaymentScope = {}): Promise<string> {
    const payment = await this.findOne(id, scope);
    if (!payment.pixReceiptUrl) {
      throw new NotFoundException('This payment has no receipt yet');
    }
    return await this.storageService.createSignedUrl(
      RECEIPT_BUCKET,
      payment.pixReceiptUrl,
      RECEIPT_SIGNED_URL_SECONDS,
    );
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
