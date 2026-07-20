import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { PricingRulesService } from './pricing-rules.service';
import { CreatePricingRuleDto } from './dto/create-pricing-rule.dto';

@ApiTags('pricing-rules')
@Controller('pricing-rules')
export class PricingRulesController {
  constructor(private readonly pricingRulesService: PricingRulesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a pricing rule' })
  create(@Body() dto: CreatePricingRuleDto) {
    return this.pricingRulesService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List pricing rules by ticket type' })
  findByTicketType(@Query('ticketTypeId', ParseUUIDPipe) ticketTypeId: string) {
    return this.pricingRulesService.findByTicketType(ticketTypeId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a pricing rule' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.pricingRulesService.remove(id);
  }
}
