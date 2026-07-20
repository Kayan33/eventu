import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TicketFormResponse } from './entities/ticket-form-response.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TicketFormResponse])],
  exports: [TypeOrmModule],
})
export class TicketFormResponsesModule {}
