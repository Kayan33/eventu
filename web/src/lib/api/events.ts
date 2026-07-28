import { apiFetch } from "./client";
import type { EventEntity } from "@/lib/types/event";
import type { JwtPayload } from "@/lib/types/auth";

export interface EventPayload {
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  location?: string;
}

export function listEvents(): Promise<EventEntity[]> {
  return apiFetch<EventEntity[]>("/events");
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

// A brand-new organization always lands here empty-handed — this is what
// decides whether login/cadastro drop the admin into the first-event wizard
// or straight into the dashboard.
export async function resolvePostAuthDestination(actor: JwtPayload): Promise<string> {
  if (actor.type !== "user" || actor.role !== "admin") {
    return "/";
  }
  const events = await listEvents();
  return events.length === 0 ? "/eventos/novo" : "/";
}
