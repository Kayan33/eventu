import { X } from "lucide-react";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { Toggle } from "@/components/wizard/Toggle";
import type { useEventWizard } from "@/lib/hooks/useEventWizard";

type Wizard = ReturnType<typeof useEventWizard>;

export function StepTickets({ wizard }: { wizard: Wizard }) {
  const { state, update, addTicket, updateTicket, removeTicket } = wizard;

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="mb-1 text-2xl font-semibold text-ink">Ingressos</h2>
        <p className="text-sm text-ink-soft">
          Defina os tipos de ingresso e quantas vagas cada um tem.
        </p>
      </div>

      <Toggle
        checked={state.isFree}
        onChange={(isFree) => update({ isFree })}
        label="Este evento é gratuito"
        description="Ative para pular a etapa de recebimento via Pix"
      />

      <div className="flex flex-col gap-3">
        {state.tickets.map((ticket) => (
          <div
            key={ticket.localId}
            className="grid grid-cols-[1.4fr_1fr_1fr_auto] items-end gap-2.5 rounded-md border border-divider bg-surface p-3.5"
          >
            <div className="min-w-0">
              <Field label="Nome" htmlFor={`ticket-name-${ticket.localId}`}>
                <Input
                  id={`ticket-name-${ticket.localId}`}
                  placeholder="Inteira"
                  value={ticket.name}
                  onChange={(e) => updateTicket(ticket.localId, { name: e.target.value })}
                />
              </Field>
            </div>

            <div className="min-w-0">
              {state.isFree ? (
                <Field label="Preço" htmlFor={`ticket-price-${ticket.localId}`}>
                  <Input id={`ticket-price-${ticket.localId}`} value="Gratuito" disabled className="opacity-60" />
                </Field>
              ) : (
                <Field label="Preço (R$)" htmlFor={`ticket-price-${ticket.localId}`}>
                  <Input
                    id={`ticket-price-${ticket.localId}`}
                    type="number"
                    min={0}
                    placeholder="50"
                    value={ticket.price}
                    onChange={(e) => updateTicket(ticket.localId, { price: e.target.value })}
                  />
                </Field>
              )}
            </div>

            <div className="min-w-0">
              <Field label="Vagas" htmlFor={`ticket-qty-${ticket.localId}`}>
                <Input
                  id={`ticket-qty-${ticket.localId}`}
                  type="number"
                  min={1}
                  placeholder="100"
                  value={ticket.quantity}
                  onChange={(e) => updateTicket(ticket.localId, { quantity: e.target.value })}
                />
              </Field>
            </div>

            <button
              type="button"
              onClick={() => void removeTicket(ticket.localId)}
              disabled={state.tickets.length === 1}
              title="Remover"
              className="flex h-10 w-10 items-center justify-center rounded-md text-ink-soft transition-colors hover:bg-neutral-bar hover:text-danger disabled:cursor-not-allowed disabled:opacity-40"
            >
              <X size={16} />
            </button>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={addTicket}
        className="w-fit rounded-md border border-divider bg-surface px-3.5 py-2 text-sm font-medium text-ink transition-colors hover:border-accent-700 hover:text-accent-700"
      >
        + Adicionar tipo
      </button>
    </div>
  );
}
