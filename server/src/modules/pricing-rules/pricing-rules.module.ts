import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PricingRule } from './entities/pricing-rule.entity';
import { TicketType } from '../ticket-types/entities/ticket-type.entity';
import { PricingRulesService } from './pricing-rules.service';
import { PricingRulesController } from './pricing-rules.controller';

@Module({
  imports: [TypeOrmModule.forFeature([PricingRule, TicketType])],
  controllers: [PricingRulesController],
  providers: [PricingRulesService],
  exports: [PricingRulesService],
})
export class PricingRulesModule {}
