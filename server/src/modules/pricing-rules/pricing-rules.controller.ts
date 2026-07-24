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
import { ActorType } from '../auth/decorators/actor-type.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentActor } from '../auth/decorators/current-actor.decorator';
import type {
  JwtPayload,
  UserJwtPayload,
} from '../auth/interfaces/jwt-payload.interface';
import { UserRole } from '../../common/enums/user-role.enum';

@ApiTags('pricing-rules')
@Controller('pricing-rules')
export class PricingRulesController {
  constructor(private readonly pricingRulesService: PricingRulesService) {}

  @ActorType('user')
  @Roles(UserRole.ADMIN, UserRole.EDITOR)
  @Post()
  @ApiOperation({ summary: 'Create a pricing rule (staff only)' })
  create(
    @Body() dto: CreatePricingRuleDto,
    @CurrentActor() actor: UserJwtPayload,
  ) {
    return this.pricingRulesService.create(dto, actor.tenantId);
  }

  @Get()
  @ApiOperation({ summary: 'List pricing rules by ticket type' })
  findByTicketType(
    @Query('ticketTypeId', ParseUUIDPipe) ticketTypeId: string,
    @CurrentActor() actor: JwtPayload,
  ) {
    return this.pricingRulesService.findByTicketType(
      ticketTypeId,
      actor.type === 'user' ? actor.tenantId : undefined,
    );
  }

  @ActorType('user')
  @Roles(UserRole.ADMIN, UserRole.EDITOR)
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a pricing rule (staff only)' })
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentActor() actor: UserJwtPayload,
  ) {
    return this.pricingRulesService.remove(id, actor.tenantId);
  }
}
