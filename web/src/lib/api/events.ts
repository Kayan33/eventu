import { apiFetch, apiUpload } from "./client";
import type { CapacityMode, EventEntity, LocationType } from "@/lib/types/event";
import type { JwtPayload } from "@/lib/types/auth";

export interface EventPayload {
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  location?: string;
  locationType?: LocationType;
  capacityMode?: CapacityMode;
  totalCapacity?: number;
}

export function listEvents(): Promise<EventEntity[]> {
  return apiFetch<EventEntity[]>("/events");
}

export function getEvent(id: string): Promise<EventEntity> {
  return apiFetch<EventEntity>(`/events/${id}`);
}

export function getEventBySlug(slug: string): Promise<EventEntity> {
  return apiFetch<EventEntity>(`/events/by-slug/${slug}`);
}

export function createEvent(payload: EventPayload): Promise<EventEntity> {
  return apiFetch<EventEntity>("/events", { method: "POST", body: payload });
}

export function updateEvent(id: string, payload: EventPayload): Promise<EventEntity> {
  return apiFetch<EventEntity>(`/events/${id}`, { method: "PUT", body: payload });
}

export function publishEvent(id: string): Promise<EventEntity> {
  return apiFetch<EventEntity>(`/events/${id}/publish`, { method: "PATCH" });
}

export function uploadEventCover(id: string, file: File): Promise<EventEntity> {
  const formData = new FormData();
  formData.append("file", file);
  return apiUpload<EventEntity>(`/events/${id}/cover`, formData);
}


export async function resolvePostAuthDestination(actor: JwtPayload): Promise<string> {
  if (actor.type !== "user" || actor.role !== "admin") {
    return "/";
  }
  const events = await listEvents();
  return events.length === 0 ? "/eventos/novo" : "/";
}
