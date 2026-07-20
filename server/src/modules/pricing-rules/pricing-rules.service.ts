import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PricingRule } from './entities/pricing-rule.entity';
import { CreatePricingRuleDto } from './dto/create-pricing-rule.dto';

@Injectable()
export class PricingRulesService {
  constructor(
    @InjectRepository(PricingRule)
    private readonly pricingRuleRepository: Repository<PricingRule>,
  ) {}

  async create(dto: CreatePricingRuleDto): Promise<PricingRule> {
    const pricingRule = this.pricingRuleRepository.create({
      ticketTypeId: dto.ticketTypeId,
      formFieldId: dto.formFieldId,
      fieldValue: dto.fieldValue,
      price: dto.price.toFixed(2),
    });
    return await this.pricingRuleRepository.save(pricingRule);
  }

  async findByTicketType(ticketTypeId: string): Promise<PricingRule[]> {
    return await this.pricingRuleRepository.find({ where: { ticketTypeId } });
  }

  async findOne(id: string): Promise<PricingRule> {
    const pricingRule = await this.pricingRuleRepository.findOne({
      where: { id },
    });
    if (!pricingRule) {
      throw new NotFoundException('Pricing rule not found');
    }
    return pricingRule;
  }

  async remove(id: string): Promise<void> {
    const pricingRule = await this.findOne(id);
    await this.pricingRuleRepository.remove(pricingRule);
  }
}
