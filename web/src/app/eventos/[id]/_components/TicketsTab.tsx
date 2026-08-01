import { useState } from "react";
import { ChevronDown, ChevronUp, GripVertical, X } from "lucide-react";
import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Field } from "@/components/ui/Field";
import { Input, inputBaseClasses } from "@/components/ui/Input";
import { FormFieldType } from "@/lib/types/formField";
import type { TicketRow, useEventDetail } from "@/lib/hooks/useEventDetail";

type Detail = ReturnType<typeof useEventDetail>;

export function TicketsTab({ detail }: { detail: Detail }) {
  const { tickets, addTicketRow, reorderTicketRows, event } = detail;
  const isTotal = event?.capacityMode === "total";
  const totalSold = tickets.reduce((sum, t) => sum + t.sold, 0);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  );

  function handleDragEnd(dragEvent: DragEndEvent) {
    const { active, over } = dragEvent;
    if (!over || active.id === over.id) return;
    reorderTicketRows(String(active.id), String(over.id));
  }

  return (
    <div>
      {isTotal ? (
        <div className="mb-4 rounded-md border border-divider bg-surface p-3.5 text-sm text-ink">
          Vagas do evento: <strong>{totalSold}</strong> / {event?.totalCapacity ?? 0}
        </div>
      ) : null}

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext
          items={tickets.map((t) => t.localId)}
          strategy={verticalListSortingStrategy}
        >
          <div className="flex flex-col gap-3">
            {tickets.map((ticket) => (
              <TicketRowCard key={ticket.localId} ticket={ticket} detail={detail} />
            ))}
          </div>
        </SortableContext>
      </DndContext>

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

function TicketRowCard({ ticket, detail }: { ticket: TicketRow; detail: Detail }) {
  const { updateTicketRow, saveTicketRow, removeTicketRow } = detail;
  const isTotal = detail.event?.capacityMode === "total";
  const [expanded, setExpanded] = useState(false);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: ticket.localId,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  function toggleExpanded() {
    if (!ticket.remoteId) return;
    if (!expanded) detail.loadPricingRules(ticket.remoteId);
    setExpanded((v) => !v);
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`rounded-md border border-divider bg-surface p-3.5 ${isDragging ? "opacity-60" : ""}`}
    >
      <div className="flex items-start gap-2.5">
        <button
          type="button"
          {...attributes}
          {...listeners}
          className="mt-2.5 flex h-6 w-6 shrink-0 touch-none cursor-grab items-center justify-center text-ink-soft active:cursor-grabbing"
        >
          <GripVertical size={16} />
        </button>

        <div className="min-w-0 flex-1">
          {ticket.remoteId ? (
            <div className="mb-2 text-[11px] text-ink-soft">{ticket.sold} vendidas</div>
          ) : null}

          <div
            className={`grid items-end gap-2.5 ${
              isTotal ? "grid-cols-[1.4fr_1fr_auto]" : "grid-cols-[1.4fr_1fr_1fr_auto]"
            }`}
          >
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
            {isTotal ? null : (
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
            )}

            <button
              type="button"
              onClick={() => void saveTicketRow(ticket.localId)}
              disabled={!ticket.dirty || ticket.saving || !ticket.name.trim()}
              className="h-10 rounded-md bg-accent-700 px-3.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {ticket.saving ? "…" : "Salvar"}
            </button>
          </div>

          {ticket.remoteId ? (
            <div className="mt-3 border-t border-divider pt-2.5">
              <button
                type="button"
                onClick={toggleExpanded}
                className="flex items-center gap-1 text-[13px] font-medium text-accent-700"
              >
                Regras de preço
                {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>

              {expanded ? (
                <PricingRulesPanel ticketTypeId={ticket.remoteId} detail={detail} />
              ) : null}
            </div>
          ) : null}
        </div>

        <button
          type="button"
          onClick={() => void removeTicketRow(ticket.localId)}
          disabled={ticket.sold > 0}
          title={ticket.sold > 0 ? "Não é possível remover: já tem ingressos vendidos" : "Remover"}
          className="mt-2.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-md text-ink-soft transition-colors hover:bg-neutral-bar hover:text-danger disabled:cursor-not-allowed disabled:opacity-30"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}

function parseOptions(optionsText: string): string[] {
  return optionsText
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function PricingRulesPanel({
  ticketTypeId,
  detail,
}: {
  ticketTypeId: string;
  detail: Detail;
}) {
  const { formFields, pricingRules, pricingRulesLoading, addPricingRule, removePricingRule } =
    detail;
  const savedFields = formFields.filter((f) => f.remoteId);
  const rules = pricingRules[ticketTypeId] ?? [];
  const loading = pricingRulesLoading[ticketTypeId];

  const [formFieldId, setFormFieldId] = useState(savedFields[0]?.remoteId ?? "");
  const [fieldValue, setFieldValue] = useState("");
  const [price, setPrice] = useState("");
  const [saving, setSaving] = useState(false);

  const selectedField = savedFields.find((f) => f.remoteId === formFieldId);
  const options = selectedField?.type === FormFieldType.SELECT
    ? parseOptions(selectedField.optionsText)
    : null;

  async function handleAdd() {
    if (!formFieldId || !fieldValue.trim() || !price || Number(price) < 0) return;
    setSaving(true);
    await addPricingRule(ticketTypeId, formFieldId, fieldValue, Number(price));
    setSaving(false);
    setFieldValue("");
    setPrice("");
  }

  return (
    <div className="mt-2.5 flex flex-col gap-2.5">
      {loading ? <p className="text-[13px] text-ink-soft">Carregando…</p> : null}

      {!loading && rules.length === 0 ? (
        <p className="text-[13px] text-ink-soft">Nenhuma regra cadastrada ainda.</p>
      ) : null}

      {rules.map((rule) => {
        const field = formFields.find((f) => f.remoteId === rule.formFieldId);
        return (
          <div
            key={rule.id}
            className="flex items-center justify-between gap-2.5 rounded-md bg-bg px-3 py-2 text-sm"
          >
            <span className="text-ink">
              {field?.label ?? "Campo removido"}: <strong>{rule.fieldValue}</strong> → R${" "}
              {rule.price}
            </span>
            <button
              type="button"
              onClick={() => void removePricingRule(ticketTypeId, rule.id)}
              className="flex h-7 w-7 items-center justify-center rounded-md text-ink-soft transition-colors hover:bg-neutral-bar hover:text-danger"
            >
              <X size={14} />
            </button>
          </div>
        );
      })}

      {savedFields.length === 0 ? (
        <p className="text-[13px] text-ink-soft">
          Cadastre um campo na aba Formulário para criar regras de preço.
        </p>
      ) : (
        <div className="grid grid-cols-[1.2fr_1fr_0.8fr_auto] items-end gap-2.5">
          <div className="min-w-0">
            <Field label="Campo" htmlFor={`pr-field-${ticketTypeId}`}>
              <select
                id={`pr-field-${ticketTypeId}`}
                value={formFieldId}
                onChange={(e) => {
                  setFormFieldId(e.target.value);
                  setFieldValue("");
                }}
                className={inputBaseClasses(false)}
              >
                {savedFields.map((f) => (
                  <option key={f.remoteId} value={f.remoteId}>
                    {f.label}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <div className="min-w-0">
            <Field label="Valor" htmlFor={`pr-value-${ticketTypeId}`}>
              {options ? (
                <select
                  id={`pr-value-${ticketTypeId}`}
                  value={fieldValue}
                  onChange={(e) => setFieldValue(e.target.value)}
                  className={inputBaseClasses(false)}
                >
                  <option value="">Selecione</option>
                  {options.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              ) : (
                <Input
                  id={`pr-value-${ticketTypeId}`}
                  value={fieldValue}
                  onChange={(e) => setFieldValue(e.target.value)}
                  placeholder="Ex: Medicina"
                />
              )}
            </Field>
          </div>

          <div className="min-w-0">
            <Field label="Preço (R$)" htmlFor={`pr-price-${ticketTypeId}`}>
              <Input
                id={`pr-price-${ticketTypeId}`}
                type="number"
                min={0}
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
            </Field>
          </div>

          <button
            type="button"
            onClick={() => void handleAdd()}
            disabled={saving || !formFieldId || !fieldValue.trim() || !price}
            className="h-10 rounded-md bg-accent-700 px-3.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {saving ? "…" : "Adicionar"}
          </button>
        </div>
      )}
    </div>
  );
}
