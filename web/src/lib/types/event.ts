import type { TicketType } from "@/lib/types/ticketType";

export type EventStatus = "draft" | "published" | "ongoing" | "finished" | "cancelled";

export interface EventEntity {
  id: string;
  tenantId: string;
  title: string;
  slug: string;
  description?: string;
  startDate: string;
  endDate: string;
  location?: string;
  status: EventStatus;
  createdAt: string;
  updatedAt: string;
  ticketTypes?: TicketType[];
}
