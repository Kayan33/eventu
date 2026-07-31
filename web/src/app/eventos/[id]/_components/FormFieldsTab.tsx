"use client";

import { GripVertical, X } from "lucide-react";
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
import type { FormFieldRow, useEventDetail } from "@/lib/hooks/useEventDetail";

type Detail = ReturnType<typeof useEventDetail>;

const TYPE_LABELS: Record<FormFieldType, string> = {
  [FormFieldType.TEXT]: "Texto",
  [FormFieldType.SELECT]: "Múltipla escolha",
  [FormFieldType.NUMBER]: "Número",
  [FormFieldType.EMAIL]: "Email",
  [FormFieldType.PHONE]: "Telefone",
};

export function FormFieldsTab({ detail }: { detail: Detail }) {
  const {
    formFields,
    addFormFieldRow,
    updateFormFieldRow,
    saveFormFieldRow,
    removeFormFieldRow,
    reorderFormFieldRows,
  } = detail;

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    reorderFormFieldRows(String(active.id), String(over.id));
  }

  return (
    <div>
      <p className="mb-3 text-[13px] text-ink-soft">
        Perguntas que aparecem no formulário de inscrição do evento.
      </p>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext
          items={formFields.map((f) => f.localId)}
          strategy={verticalListSortingStrategy}
        >
          <div className="flex flex-col gap-3">
            {formFields.map((field) => (
              <FormFieldRowCard
                key={field.localId}
                field={field}
                onChange={(patch) => updateFormFieldRow(field.localId, patch)}
                onSave={() => void saveFormFieldRow(field.localId)}
                onRemove={() => void removeFormFieldRow(field.localId)}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      <button
        type="button"
        onClick={addFormFieldRow}
        className="mt-3 w-fit rounded-md border border-divider bg-surface px-3.5 py-2 text-sm font-medium text-ink transition-colors hover:border-accent-700 hover:text-accent-700"
      >
        + Adicionar pergunta
      </button>
    </div>
  );
}

function FormFieldRowCard({
  field,
  onChange,
  onSave,
  onRemove,
}: {
  field: FormFieldRow;
  onChange: (patch: Partial<FormFieldRow>) => void;
  onSave: () => void;
  onRemove: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: field.localId,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

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
          <div className="grid grid-cols-[1.4fr_1fr_auto] items-end gap-2.5">
            <div className="min-w-0">
              <Field label="Pergunta" htmlFor={`f-label-${field.localId}`}>
                <Input
                  id={`f-label-${field.localId}`}
                  value={field.label}
                  onChange={(e) => onChange({ label: e.target.value })}
                />
              </Field>
            </div>
            <div className="min-w-0">
              <Field label="Tipo" htmlFor={`f-type-${field.localId}`}>
                <select
                  id={`f-type-${field.localId}`}
                  value={field.type}
                  onChange={(e) => onChange({ type: e.target.value as FormFieldType })}
                  className={inputBaseClasses(false)}
                >
                  {Object.values(FormFieldType).map((t) => (
                    <option key={t} value={t}>
                      {TYPE_LABELS[t]}
                    </option>
                  ))}
                </select>
              </Field>
            </div>

            <button
              type="button"
              onClick={onSave}
              disabled={!field.dirty || field.saving || !field.label.trim()}
              className="h-10 rounded-md bg-accent-700 px-3.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {field.saving ? "…" : "Salvar"}
            </button>
          </div>

          {field.type === FormFieldType.SELECT ? (
            <div className="mt-2.5">
              <Field
                label="Opções"
                htmlFor={`f-options-${field.localId}`}
                hint="Separe as opções por vírgula"
              >
                <Input
                  id={`f-options-${field.localId}`}
                  value={field.optionsText}
                  onChange={(e) => onChange({ optionsText: e.target.value })}
                  placeholder="Engenharia, Medicina, Direito"
                />
              </Field>
            </div>
          ) : null}

          <label className="mt-2.5 flex w-fit items-center gap-2 text-sm text-ink">
            <input
              type="checkbox"
              checked={field.isRequired}
              onChange={(e) => onChange({ isRequired: e.target.checked })}
              className="h-4 w-4 rounded border-divider text-accent-700 focus:ring-accent-700"
            />
            Obrigatório
          </label>
        </div>

        <button
          type="button"
          onClick={onRemove}
          className="mt-2.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-md text-ink-soft transition-colors hover:bg-neutral-bar hover:text-danger"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
