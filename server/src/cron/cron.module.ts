import { Module } from '@nestjs/common';
import { PaymentsModule } from '../modules/payments/payments.module';
import { CronService } from './cron.service';

@Module({
  imports: [PaymentsModule],
  providers: [CronService],
})
export class CronModule {}
