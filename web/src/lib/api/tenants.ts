import { apiFetch } from "./client";
import type { TenantEntity, UpdateTenantPixPayload } from "@/lib/types/tenant";

export function updateTenantPix(
  id: string,
  payload: UpdateTenantPixPayload,
): Promise<TenantEntity> {
  return apiFetch<TenantEntity>(`/tenants/${id}`, { method: "PUT", body: payload });
}
