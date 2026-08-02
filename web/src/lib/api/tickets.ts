import { apiFetch } from "./client";

export interface TicketFormResponseInput {
  formFieldId: string;
  value: string;
}

export interface CreateTicketPayload {
  ticketTypeId: string;
  formResponses: TicketFormResponseInput[];
}

export interface TicketEntity {
  id: string;
  ticketTypeId: string;
  clientId: string;
  code: string;
  finalPrice: string;
  status: string;
}

export function createTicket(payload: CreateTicketPayload): Promise<TicketEntity> {
  return apiFetch<TicketEntity>("/tickets", { method: "POST", body: payload });
}
