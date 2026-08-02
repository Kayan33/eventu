import { apiFetch, apiUpload } from "./client";
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

export function uploadReceipt(paymentId: string, file: File): Promise<Payment> {
  const formData = new FormData();
  formData.append("file", file);
  return apiUpload<Payment>(`/payments/${paymentId}/upload`, formData, "PATCH");
}

export function getReceiptUrl(paymentId: string): Promise<{ url: string }> {
  return apiFetch<{ url: string }>(`/payments/${paymentId}/receipt-url`);
}
