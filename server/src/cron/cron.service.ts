import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PaymentsService } from '../modules/payments/payments.service';

/**
 * Every scheduled job in the app is registered here, as a thin trigger that
 * delegates the actual work to the relevant domain service. Keeps "what runs
 * on a schedule" answerable by reading this one file, instead of hunting for
 * @Cron() decorators scattered across modules.
 */
@Injectable()
export class CronService {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Cron('0 */15 * * * *')
  async handlePaymentExpiration(): Promise<void> {
    await this.paymentsService.expireStalePayments();
  }
}
