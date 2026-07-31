import { apiFetch } from "./client";
import type { TicketType } from "@/lib/types/ticketType";

export interface CreateTicketTypePayload {
  eventId: string;
  name: string;
  basePrice: number;
  quantity: number;
  displayOrder?: number;
}

export interface UpdateTicketTypePayload {
  name?: string;
  basePrice?: number;
  quantity?: number;
  displayOrder?: number;
}

export function listTicketTypes(eventId: string): Promise<TicketType[]> {
  return apiFetch<TicketType[]>(`/ticket-types?eventId=${eventId}`);
}

export function createTicketType(payload: CreateTicketTypePayload): Promise<TicketType> {
  return apiFetch<TicketType>("/ticket-types", { method: "POST", body: payload });
}

export function updateTicketType(
  id: string,
  payload: UpdateTicketTypePayload,
): Promise<TicketType> {
  return apiFetch<TicketType>(`/ticket-types/${id}`, { method: "PUT", body: payload });
}

export function deleteTicketType(id: string): Promise<void> {
  return apiFetch<void>(`/ticket-types/${id}`, { method: "DELETE" });
}
