import { apiFetch } from "./client";
import type { PricingRule } from "@/lib/types/pricingRule";

export interface CreatePricingRulePayload {
  ticketTypeId: string;
  formFieldId: string;
  fieldValue: string;
  price: number;
}

export function listPricingRules(ticketTypeId: string): Promise<PricingRule[]> {
  return apiFetch<PricingRule[]>(`/pricing-rules?ticketTypeId=${ticketTypeId}`);
}

export function createPricingRule(payload: CreatePricingRulePayload): Promise<PricingRule> {
  return apiFetch<PricingRule>("/pricing-rules", { method: "POST", body: payload });
}

export function deletePricingRule(id: string): Promise<void> {
  return apiFetch<void>(`/pricing-rules/${id}`, { method: "DELETE" });
}
