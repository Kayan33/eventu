import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PricingRule } from './entities/pricing-rule.entity';
import { TicketType } from '../ticket-types/entities/ticket-type.entity';
import { CreatePricingRuleDto } from './dto/create-pricing-rule.dto';

@Injectable()
export class PricingRulesService {
  constructor(
    @InjectRepository(PricingRule)
    private readonly pricingRuleRepository: Repository<PricingRule>,
    @InjectRepository(TicketType)
    private readonly ticketTypeRepository: Repository<TicketType>,
  ) {}

  private async assertTicketTypeBelongsToTenant(
    ticketTypeId: string,
    tenantId?: string,
  ): Promise<void> {
    if (!tenantId) {
      return;
    }
    const ticketType = await this.ticketTypeRepository.findOne({
      where: { id: ticketTypeId },
      relations: { event: true },
    });
    if (!ticketType || ticketType.event.tenantId !== tenantId) {
      throw new NotFoundException('Ticket type not found');
    }
  }

  async create(
    dto: CreatePricingRuleDto,
    tenantId?: string,
  ): Promise<PricingRule> {
    await this.assertTicketTypeBelongsToTenant(dto.ticketTypeId, tenantId);

    const pricingRule = this.pricingRuleRepository.create({
      ticketTypeId: dto.ticketTypeId,
      formFieldId: dto.formFieldId,
      fieldValue: dto.fieldValue,
      price: dto.price.toFixed(2),
    });
    return await this.pricingRuleRepository.save(pricingRule);
  }

  async findByTicketType(
    ticketTypeId: string,
    tenantId?: string,
  ): Promise<PricingRule[]> {
    await this.assertTicketTypeBelongsToTenant(ticketTypeId, tenantId);
    return await this.pricingRuleRepository.find({ where: { ticketTypeId } });
  }

  async findOne(id: string, tenantId?: string): Promise<PricingRule> {
    const pricingRule = await this.pricingRuleRepository.findOne({
      where: { id },
      relations: { ticketType: { event: true } },
    });
    if (!pricingRule) {
      throw new NotFoundException('Pricing rule not found');
    }
    if (tenantId && pricingRule.ticketType.event.tenantId !== tenantId) {
      throw new NotFoundException('Pricing rule not found');
    }
    return pricingRule;
  }

  async remove(id: string, tenantId?: string): Promise<void> {
    const pricingRule = await this.findOne(id, tenantId);
    await this.pricingRuleRepository.remove(pricingRule);
  }
}
