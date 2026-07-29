import { X } from "lucide-react";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import type { useEventDetail } from "@/lib/hooks/useEventDetail";

type Detail = ReturnType<typeof useEventDetail>;

export function TicketsTab({ detail }: { detail: Detail }) {
  const { tickets, addTicketRow, updateTicketRow, saveTicketRow, removeTicketRow } = detail;

  return (
    <div>
      <div className="flex flex-col gap-3">
        {tickets.map((ticket) => (
          <div
            key={ticket.localId}
            className="rounded-md border border-divider bg-surface p-3.5"
          >
            {ticket.remoteId ? (
              <div className="mb-2 text-[11px] text-ink-soft">{ticket.sold} vendidas</div>
            ) : null}

            <div className="grid grid-cols-[1.4fr_1fr_1fr_auto_auto] items-end gap-2.5">
              <div className="min-w-0">
                <Field label="Nome" htmlFor={`t-name-${ticket.localId}`}>
                  <Input
                    id={`t-name-${ticket.localId}`}
                    value={ticket.name}
                    onChange={(e) => updateTicketRow(ticket.localId, { name: e.target.value })}
                  />
                </Field>
              </div>
              <div className="min-w-0">
                <Field label="Preço (R$)" htmlFor={`t-price-${ticket.localId}`}>
                  <Input
                    id={`t-price-${ticket.localId}`}
                    type="number"
                    min={0}
                    value={ticket.price}
                    onChange={(e) => updateTicketRow(ticket.localId, { price: e.target.value })}
                  />
                </Field>
              </div>
              <div className="min-w-0">
                <Field label="Vagas" htmlFor={`t-qty-${ticket.localId}`}>
                  <Input
                    id={`t-qty-${ticket.localId}`}
                    type="number"
                    min={1}
                    value={ticket.quantity}
                    onChange={(e) => updateTicketRow(ticket.localId, { quantity: e.target.value })}
                  />
                </Field>
              </div>

              <button
                type="button"
                onClick={() => void saveTicketRow(ticket.localId)}
                disabled={!ticket.dirty || ticket.saving || !ticket.name.trim()}
                className="h-10 rounded-md bg-accent-700 px-3.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {ticket.saving ? "…" : "Salvar"}
              </button>

              <button
                type="button"
                onClick={() => void removeTicketRow(ticket.localId)}
                disabled={ticket.sold > 0}
                title={ticket.sold > 0 ? "Não é possível remover: já tem ingressos vendidos" : "Remover"}
                className="flex h-10 w-10 items-center justify-center rounded-md text-ink-soft transition-colors hover:bg-neutral-bar hover:text-danger disabled:cursor-not-allowed disabled:opacity-30"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={addTicketRow}
        className="mt-3 w-fit rounded-md border border-divider bg-surface px-3.5 py-2 text-sm font-medium text-ink transition-colors hover:border-accent-700 hover:text-accent-700"
      >
        + Adicionar tipo
      </button>
    </div>
  );
}
