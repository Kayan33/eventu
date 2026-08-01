import { apiFetch } from "./client";
import type { Payment, PaymentStatus } from "@/lib/types/payment";

export function listPayments(status?: PaymentStatus): Promise<Payment[]> {
  const query = status ? `?status=${status}` : "";
  return apiFetch<Payment[]>(`/payments${query}`);
}

export interface ReviewPaymentPayload {
  status: "approved" | "rejected";
  rejectionReason?: string;
}

export function reviewPayment(id: string, payload: ReviewPaymentPayload): Promise<Payment> {
  return apiFetch<Payment>(`/payments/${id}/review`, { method: "PATCH", body: payload });
}
