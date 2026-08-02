import type { TicketType } from "@/lib/types/ticketType";
import type { EventFormField } from "@/lib/types/formField";

export type EventStatus = "draft" | "published" | "ongoing" | "finished" | "cancelled";
export type CapacityMode = "per_ticket_type" | "total";
export type LocationType = "presencial" | "online";

export interface EventEntity {
  id: string;
  tenantId: string;
  title: string;
  slug: string;
  description?: string;
  startDate: string;
  endDate: string;
  location?: string;
  locationType: LocationType;
  coverImageUrl?: string;
  status: EventStatus;
  capacityMode: CapacityMode;
  totalCapacity?: number;
  createdAt: string;
  updatedAt: string;
  ticketTypes?: TicketType[];
  formFields?: EventFormField[];
}
