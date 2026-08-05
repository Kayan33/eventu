"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Calendar, Ticket as TicketIcon } from "lucide-react";
import { useRequireClient } from "@/lib/hooks/useRequireClient";
import { ClientPanelLayout } from "@/components/client-panel/ClientPanelLayout";
import { ClientLoginForm } from "@/components/client-panel/ClientLoginForm";
import { listTickets, type TicketEntity } from "@/lib/api/tickets";
import { translateApiError } from "@/lib/api/errorMessages";
import { formatDateRange, formatTimeRemaining } from "@/lib/utils/formatDate";

const STATUS_LABELS: Record<string, { label: string; className: string; action: string }> = {
  pending: { label: "Aguardando pagamento", className: "bg-bg text-ink-soft", action: "Pagar agora" },
  uploaded: { label: "Em análise", className: "bg-accent-700/10 text-accent-700", action: "Ver detalhes" },
  approved: { label: "Aprovado", className: "bg-success/10 text-success", action: "Ver detalhes" },
  rejected: { label: "Rejeitado", className: "bg-danger/10 text-danger", action: "Reenviar comprovante" },
  expired: { label: "Expirado", className: "bg-danger/10 text-danger", action: "Inscrever-se novamente" },
};

function statusInfo(ticket: TicketEntity): { label: string; className: string; action: string } {
  if (ticket.payment) {
    return (
      STATUS_LABELS[ticket.payment.status] ?? {
        label: ticket.payment.status,
        className: "bg-bg text-ink-soft",
        action: "Ver detalhes",
      }
    );
  }
  return { label: "Confirmado", className: "bg-success/10 text-success", action: "Ver detalhes" };
}

function timeRemaining(ticket: TicketEntity): string | null {
  const payment = ticket.payment;
  if (!payment || (payment.status !== "pending" && payment.status !== "rejected")) {
    return null;
  }
  return formatTimeRemaining(payment.expiresAt);
}

export default function MinhasInscricoesPage() {
  const { actor, ready } = useRequireClient();
  const [tickets, setTickets] = useState<TicketEntity[]>([]);
  const [ticketsLoading, setTicketsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!ready || !actor) return;
    listTickets()
      .then(setTickets)
      .catch((err: unknown) => setError(translateApiError(err, "Não foi possível carregar suas inscrições.")))
      .finally(() => setTicketsLoading(false));
  }, [ready, actor]);

  if (!ready) return null;

  if (!actor) {
    return <ClientLoginForm />;
  }

  return (
    <ClientPanelLayout>
      <div className="mx-auto max-w-[880px] px-4 py-8 sm:px-8 sm:py-10">
        <h1 className="mb-1 text-2xl font-semibold text-ink">Minhas inscrições</h1>
        <p className="mb-8 text-sm text-ink-soft">Acompanhe o status dos eventos em que você se inscreveu.</p>

        {error ? <p className="mb-4 text-sm text-danger">{error}</p> : null}

        {ticketsLoading ? (
          <p className="text-sm text-ink-soft">Carregando…</p>
        ) : tickets.length === 0 ? (
          <div className="flex flex-col items-center gap-2 rounded-md border border-dashed border-divider py-16 text-center">
            <TicketIcon size={28} className="text-ink-soft" />
            <p className="text-sm font-medium text-ink">Nenhuma inscrição ainda</p>
            <p className="text-sm text-ink-soft">Os eventos que você se inscrever vão aparecer aqui.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {tickets.map((ticket) => {
              const event = ticket.ticketType?.event;
              const status = statusInfo(ticket);
              const content = (
                <>
                  {event?.coverImageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={event.coverImageUrl} alt="" className="h-auto w-full" />
                  ) : (
                    <div className="h-24 w-full bg-accent-700" />
                  )}

                  <div className="flex flex-col justify-between gap-4 p-5">
                    <div>
                      <div className="flex items-start justify-between gap-3">
                        <h2 className="text-base font-semibold text-ink">
                          {event?.title ?? "Evento removido"}
                        </h2>
                        <span
                          className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-medium ${status.className}`}
                        >
                          {status.label}
                        </span>
                      </div>

                      {event ? (
                        <div className="mt-1.5 flex items-center gap-1.5 text-[13px] text-ink-soft">
                          <Calendar size={14} aria-hidden="true" />
                          {formatDateRange(event.startDate, event.endDate)}
                        </div>
                      ) : null}

                      <div className="mt-1 text-[13px] text-ink-soft">
                        {ticket.ticketType?.name} · Código {ticket.code}
                      </div>

                      {timeRemaining(ticket) ? (
                        <div className="mt-1 text-[13px] font-medium text-danger">
                          {timeRemaining(ticket)}
                        </div>
                      ) : null}
                    </div>

                    <div className="flex items-center justify-between border-t border-divider pt-3.5">
                      <span className="text-lg font-semibold text-ink">R$ {ticket.finalPrice}</span>
                      {event ? (
                        <span className="text-[13px] font-medium text-accent-700">
                          {status.action} →
                        </span>
                      ) : null}
                    </div>
                  </div>
                </>
              );

              if (!event) {
                return (
                  <div key={ticket.id} className="overflow-hidden rounded-lg border border-divider bg-surface">
                    {content}
                  </div>
                );
              }

              return (
                <Link
                  key={ticket.id}
                  href={`/${event.slug}/inscricao`}
                  className="overflow-hidden rounded-lg border border-divider bg-surface transition-colors hover:border-accent-700"
                >
                  {content}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </ClientPanelLayout>
  );
}
