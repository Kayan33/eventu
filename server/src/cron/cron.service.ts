import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PaymentsService } from '../modules/payments/payments.service';

@Injectable()
export class CronService {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Cron('0 */15 * * * *')
  async handlePaymentExpiration(): Promise<void> {
    await this.paymentsService.expireStalePayments();
  }
}
