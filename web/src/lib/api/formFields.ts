import { apiFetch } from "./client";
import type { EventFormField, FormFieldType } from "@/lib/types/formField";

export interface CreateFormFieldPayload {
  eventId: string;
  label: string;
  type: FormFieldType;
  options?: string[];
  isRequired?: boolean;
  displayOrder?: number;
}

export interface UpdateFormFieldPayload {
  label?: string;
  type?: FormFieldType;
  options?: string[];
  isRequired?: boolean;
  displayOrder?: number;
}

export function listFormFields(eventId: string): Promise<EventFormField[]> {
  return apiFetch<EventFormField[]>(`/event-form-fields?eventId=${eventId}`);
}

export function createFormField(payload: CreateFormFieldPayload): Promise<EventFormField> {
  return apiFetch<EventFormField>("/event-form-fields", { method: "POST", body: payload });
}

export function updateFormField(
  id: string,
  payload: UpdateFormFieldPayload,
): Promise<EventFormField> {
  return apiFetch<EventFormField>(`/event-form-fields/${id}`, { method: "PUT", body: payload });
}

export function deleteFormField(id: string): Promise<void> {
  return apiFetch<void>(`/event-form-fields/${id}`, { method: "DELETE" });
}
