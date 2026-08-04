"use client";

import { useCallback, useEffect, useState } from "react";
import { ChevronDown, ChevronUp, X } from "lucide-react";
import { useRequireUser } from "@/lib/hooks/useRequireUser";
import { PanelLayout } from "@/components/panel/PanelLayout";
import { Tabs } from "@/components/panel/Tabs";
import { getReceiptUrl, listPayments, reviewPayment } from "@/lib/api/payments";
import { translateApiError } from "@/lib/api/errorMessages";
import { PaymentStatus, type Payment } from "@/lib/types/payment";

function isPdfReceipt(path?: string): boolean {
  return (path?.split(".").pop() ?? "").toLowerCase() === "pdf";
}

const STATUS_OPTIONS: { value: PaymentStatus; label: string }[] = [
  { value: PaymentStatus.UPLOADED, label: "Aguardando revisão" },
  { value: PaymentStatus.PENDING, label: "Pendentes" },
  { value: PaymentStatus.APPROVED, label: "Aprovados" },
  { value: PaymentStatus.REJECTED, label: "Rejeitados" },
];

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  dateStyle: "short",
  timeStyle: "short",
});

function formatDateTime(iso?: string): string {
  return iso ? dateFormatter.format(new Date(iso)) : "—";
}

export default function PagamentosPage() {
  const { actor, ready } = useRequireUser();
  const canReview = actor?.role === "admin" || actor?.role === "editor";

  const [status, setStatus] = useState<PaymentStatus>(PaymentStatus.UPLOADED);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reviewingId, setReviewingId] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [loadingReceiptId, setLoadingReceiptId] = useState<string | null>(null);
  const [receipt, setReceipt] = useState<{ url: string; isPdf: boolean } | null>(null);
  const [receiptImageFailed, setReceiptImageFailed] = useState(false);
  const [expandedFormId, setExpandedFormId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setPayments(await listPayments(status));
    } catch (err) {
      setError(translateApiError(err, "Não foi possível carregar os pagamentos."));
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (ready) void load();
  }, [ready, load]);

  async function handleApprove(id: string) {
    setReviewingId(id);
    setError(null);
    try {
      await reviewPayment(id, { status: "approved" });
      setPayments((rows) => rows.filter((p) => p.id !== id));
    } catch (err) {
      setError(translateApiError(err, "Não foi possível aprovar o pagamento."));
    } finally {
      setReviewingId(null);
    }
  }

  async function handleViewReceipt(payment: Payment) {
    setLoadingReceiptId(payment.id);
    setError(null);
    try {
      const { url } = await getReceiptUrl(payment.id);
      setReceiptImageFailed(false);
      setReceipt({ url, isPdf: isPdfReceipt(payment.pixReceiptUrl) });
    } catch (err) {
      setError(translateApiError(err, "Não foi possível abrir o comprovante."));
    } finally {
      setLoadingReceiptId(null);
    }
  }

  async function handleReject(id: string) {
    if (!rejectionReason.trim()) return;
    setReviewingId(id);
    setError(null);
    try {
      await reviewPayment(id, { status: "rejected", rejectionReason });
      setPayments((rows) => rows.filter((p) => p.id !== id));
      setRejectingId(null);
      setRejectionReason("");
    } catch (err) {
      setError(translateApiError(err, "Não foi possível rejeitar o pagamento."));
    } finally {
      setReviewingId(null);
    }
  }

  if (!ready) return null;

  return (
    <PanelLayout>
      <div className="mx-auto max-w-[900px] p-8">
        <h1 className="mb-6 text-2xl font-semibold text-ink">Pagamentos</h1>

        <Tabs value={status} onChange={setStatus} items={STATUS_OPTIONS} />

        {error ? <p className="mb-4 text-sm text-danger">{error}</p> : null}

        {loading ? (
          <p className="text-sm text-ink-soft">Carregando…</p>
        ) : payments.length === 0 ? (
          <p className="text-sm text-ink-soft">Nenhum pagamento nesse status.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {payments.map((payment) => (
              <div
                key={payment.id}
                className="rounded-md border border-divider bg-surface p-4"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-ink">
                      {payment.ticket?.client?.name ?? "Cliente removido"}
                    </div>
                    <div className="text-[13px] text-ink-soft">
                      {payment.ticket?.client?.email}
                    </div>
                    <div className="mt-1.5 text-[13px] text-ink-soft">
                      {payment.ticket?.ticketType?.event?.title} ·{" "}
                      {payment.ticket?.ticketType?.name}
                    </div>
                  </div>

                  <div className="sm:text-right">
                    <div className="text-lg font-semibold text-ink">
                      R$ {payment.amount}
                    </div>
                    <div className="text-[11px] text-ink-soft">
                      {payment.status === PaymentStatus.PENDING
                        ? `Vence em ${formatDateTime(payment.expiresAt)}`
                        : payment.status === PaymentStatus.UPLOADED
                          ? `Enviado em ${formatDateTime(payment.uploadedAt)}`
                          : `Revisado em ${formatDateTime(payment.reviewedAt)}`}
                    </div>
                  </div>
                </div>

                <div className="mt-2.5 flex flex-wrap items-center gap-4">
                  {payment.pixReceiptUrl ? (
                    <button
                      type="button"
                      onClick={() => void handleViewReceipt(payment)}
                      disabled={loadingReceiptId === payment.id}
                      className="inline-block text-[13px] font-medium text-accent-700 hover:underline disabled:cursor-wait disabled:opacity-60"
                    >
                      {loadingReceiptId === payment.id ? "Abrindo…" : "Ver comprovante →"}
                    </button>
                  ) : null}

                  {payment.ticket?.formResponses?.length ? (
                    <button
                      type="button"
                      onClick={() =>
                        setExpandedFormId((id) => (id === payment.id ? null : payment.id))
                      }
                      className="inline-flex items-center gap-1 text-[13px] font-medium text-accent-700 hover:underline"
                    >
                      Ver respostas do formulário
                      {expandedFormId === payment.id ? (
                        <ChevronUp size={14} />
                      ) : (
                        <ChevronDown size={14} />
                      )}
                    </button>
                  ) : null}
                </div>

                {expandedFormId === payment.id && payment.ticket?.formResponses?.length ? (
                  <dl className="mt-2.5 flex flex-col gap-1.5 rounded-md border border-divider bg-bg p-3">
                    {payment.ticket.formResponses.map((response) => (
                      <div key={response.id}>
                        <dt className="text-[11px] text-ink-soft">
                          {response.formField?.label ?? "Pergunta removida"}
                        </dt>
                        <dd className="text-[13px] text-ink">{response.value || "—"}</dd>
                      </div>
                    ))}
                  </dl>
                ) : null}

                {payment.status === PaymentStatus.REJECTED && payment.rejectionReason ? (
                  <p className="mt-2.5 text-[13px] text-danger">
                    Motivo: {payment.rejectionReason}
                  </p>
                ) : null}

                {canReview && payment.status === PaymentStatus.UPLOADED ? (
                  <div className="mt-3 border-t border-divider pt-3">
                    {rejectingId === payment.id ? (
                      <div className="flex flex-wrap items-center gap-2">
                        <input
                          value={rejectionReason}
                          onChange={(e) => setRejectionReason(e.target.value)}
                          placeholder="Motivo da rejeição"
                          className="h-9 min-w-[200px] flex-1 rounded-md border border-divider bg-surface px-3 text-sm text-ink outline-none focus:border-accent-700 focus:ring-1 focus:ring-accent-700"
                        />
                        <button
                          type="button"
                          onClick={() => void handleReject(payment.id)}
                          disabled={reviewingId === payment.id || !rejectionReason.trim()}
                          className="h-9 rounded-md bg-danger px-3.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          Confirmar rejeição
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setRejectingId(null);
                            setRejectionReason("");
                          }}
                          className="h-9 rounded-md border border-divider px-3.5 text-sm font-medium text-ink hover:border-accent-700 hover:text-accent-700"
                        >
                          Cancelar
                        </button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => void handleApprove(payment.id)}
                          disabled={reviewingId === payment.id}
                          className="h-9 rounded-md bg-success px-3.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          Aprovar
                        </button>
                        <button
                          type="button"
                          onClick={() => setRejectingId(payment.id)}
                          disabled={reviewingId === payment.id}
                          className="h-9 rounded-md border border-divider px-3.5 text-sm font-medium text-ink hover:border-danger hover:text-danger"
                        >
                          Rejeitar
                        </button>
                      </div>
                    )}
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </div>

      {receipt ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-6"
          onClick={() => setReceipt(null)}
        >
          <div
            className="relative max-h-[90vh] max-w-3xl overflow-auto rounded-md bg-surface p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setReceipt(null)}
              aria-label="Fechar"
              className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-md border border-divider bg-surface text-ink-soft hover:border-accent-700 hover:text-accent-700"
            >
              <X size={16} />
            </button>

            {receipt.isPdf ? (
              <iframe
                src={receipt.url}
                title="Comprovante do PIX"
                className="h-[80vh] w-[70vw] max-w-full rounded-md"
              />
            ) : receiptImageFailed ? (
              <p className="flex h-40 w-80 max-w-full items-center justify-center text-center text-sm text-ink-soft">
                Não foi possível carregar o comprovante.
              </p>
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={receipt.url}
                alt="Comprovante do PIX"
                onError={() => setReceiptImageFailed(true)}
                className="max-h-[80vh] max-w-full rounded-md"
              />
            )}

            <a
              href={receipt.url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 block text-center text-[13px] font-medium text-accent-700 hover:underline"
            >
              Abrir em nova aba
            </a>
          </div>
        </div>
      ) : null}
    </PanelLayout>
  );
}
