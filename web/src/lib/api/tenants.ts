import { apiFetch, apiUpload } from "./client";
import type {
  TenantEntity,
  UpdateTenantPayload,
  UpdateTenantPixPayload,
} from "@/lib/types/tenant";

export function getTenant(id: string): Promise<TenantEntity> {
  return apiFetch<TenantEntity>(`/tenants/${id}`);
}

export function updateTenant(id: string, payload: UpdateTenantPayload): Promise<TenantEntity> {
  return apiFetch<TenantEntity>(`/tenants/${id}`, { method: "PUT", body: payload });
}

export function updateTenantPix(
  id: string,
  payload: UpdateTenantPixPayload,
): Promise<TenantEntity> {
  return apiFetch<TenantEntity>(`/tenants/${id}`, { method: "PUT", body: payload });
}

export function uploadTenantPixQrCode(id: string, file: File): Promise<TenantEntity> {
  const formData = new FormData();
  formData.append("file", file);
  return apiUpload<TenantEntity>(`/tenants/${id}/pix-qrcode`, formData);
}
