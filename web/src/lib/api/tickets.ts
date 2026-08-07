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
  checkedInAt?: string;
  client?: {
    id: string;
    name: string;
    email: string;
  };
  formResponses?: {
    id: string;
    value: string;
    formField?: {
      id: string;
      label: string;
    };
  }[];
  payment?: {
    id: string;
    amount: string;
    status: string;
    pixReceiptUrl?: string;
    rejectionReason?: string;
    expiresAt: string;
  };
  ticketType?: {
    id: string;
    name: string;
    event?: {
      id: string;
      title: string;
      slug: string;
      startDate: string;
      endDate: string;
      location?: string;
      locationType?: string;
      coverImageUrl?: string;
      tenant?: {
        id: string;
        name: string;
        pixKey?: string;
        pixKeyType?: string;
        pixBeneficiary?: string;
        pixQrCodeUrl?: string;
      };
    };
  };
}

export function createTicket(payload: CreateTicketPayload): Promise<TicketEntity> {
  return apiFetch<TicketEntity>("/tickets", { method: "POST", body: payload });
}

export function listTickets(filters?: { eventId?: string }): Promise<TicketEntity[]> {
  const query = filters?.eventId ? `?eventId=${filters.eventId}` : "";
  return apiFetch<TicketEntity[]>(`/tickets${query}`);
}

export function checkInTicket(id: string): Promise<TicketEntity> {
  return apiFetch<TicketEntity>(`/tickets/${id}/check-in`, { method: "PATCH" });
}
