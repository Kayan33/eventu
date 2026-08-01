export interface TicketType {
  id: string;
  eventId: string;
  name: string;
  basePrice: string;
  quantity?: number;
  sold: number;
  displayOrder: number;
}
