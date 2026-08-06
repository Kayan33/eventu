import { Module } from '@nestjs/common';
import { dataSourceOptions } from './database/typeorm.config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { LoggerModule } from 'nestjs-pino';
import { TenantsModule } from './modules/tenants/tenants.module';
import { UsersModule } from './modules/users/users.module';
import { ClientsModule } from './modules/clients/clients.module';
import { EventsModule } from './modules/events/events.module';
import { EventFormFieldsModule } from './modules/event-form-fields/event-form-fields.module';
import { TicketTypesModule } from './modules/ticket-types/ticket-types.module';
import { PricingRulesModule } from './modules/pricing-rules/pricing-rules.module';
import { TicketFormResponsesModule } from './modules/ticket-form-responses/ticket-form-responses.module';
import { TicketsModule } from './modules/tickets/tickets.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { CertificatesModule } from './modules/certificates/certificates.module';
import { AuthModule } from './modules/auth/auth.module';
import { CronModule } from './cron/cron.module';

@Module({
  imports: [
    LoggerModule.forRoot({
      pinoHttp: {
        level: process.env.LOG_LEVEL ?? 'info',
        transport:
          process.env.NODE_ENV === 'production'
            ? undefined
            : { target: 'pino-pretty', options: { singleLine: true } },
        redact: ['req.headers.authorization', 'req.body.password'],
        autoLogging: true,
      },
    }),
    TypeOrmModule.forRoot({
      ...dataSourceOptions,
      autoLoadEntities: true,
    }),
    ScheduleModule.forRoot(),
    TenantsModule,
    UsersModule,
    ClientsModule,
    EventsModule,
    EventFormFieldsModule,
    TicketTypesModule,
    PricingRulesModule,
    TicketFormResponsesModule,
    TicketsModule,
    PaymentsModule,
    CertificatesModule,
    AuthModule,
    CronModule,
  ],
})
export class AppModule {}
