import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { TicketTypesService } from './ticket-types.service';
import { CreateTicketTypeDto } from './dto/create-ticket-type.dto';
import { UpdateTicketTypeDto } from './dto/update-ticket-type.dto';

@ApiTags('ticket-types')
@Controller('ticket-types')
export class TicketTypesController {
  constructor(private readonly ticketTypesService: TicketTypesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a ticket type for an event' })
  create(@Body() dto: CreateTicketTypeDto) {
    return this.ticketTypesService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List ticket types by event' })
  findByEvent(@Query('eventId', ParseUUIDPipe) eventId: string) {
    return this.ticketTypesService.findByEvent(eventId);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a ticket type' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateTicketTypeDto,
  ) {
    return this.ticketTypesService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a ticket type (only if no tickets sold)' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.ticketTypesService.remove(id);
  }
}
