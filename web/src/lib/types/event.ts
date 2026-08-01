import type { TicketType } from "@/lib/types/ticketType";

export type EventStatus = "draft" | "published" | "ongoing" | "finished" | "cancelled";
export type CapacityMode = "per_ticket_type" | "total";

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
  capacityMode: CapacityMode;
  totalCapacity?: number;
  createdAt: string;
  updatedAt: string;
  ticketTypes?: TicketType[];
}
