import { Field } from "@/components/ui/Field";
import { Input, inputBaseClasses } from "@/components/ui/Input";
import { SegmentedControl } from "@/components/wizard/SegmentedControl";
import type { useEventWizard } from "@/lib/hooks/useEventWizard";

type Wizard = ReturnType<typeof useEventWizard>;

export function StepEventInfo({ wizard }: { wizard: Wizard }) {
  const { state, update } = wizard;

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="mb-1 text-2xl font-semibold text-ink">Sobre o evento</h2>
        <p className="text-sm text-ink-soft">Os dados essenciais pra sua página existir.</p>
      </div>

      <Field label="Nome do evento" htmlFor="title">
        <Input
          id="title"
          required
          placeholder="Semana de Medicina 2026"
          value={state.title}
          onChange={(e) => update({ title: e.target.value })}
        />
      </Field>

      <div className="grid grid-cols-2 gap-3.5">
        <Field label="Data de início" htmlFor="startDate">
          <Input
            id="startDate"
            type="date"
            required
            value={state.startDate}
            onChange={(e) => update({ startDate: e.target.value })}
          />
        </Field>
        <Field label="Horário de início" htmlFor="startTime">
          <Input
            id="startTime"
            type="time"
            required
            value={state.startTime}
            onChange={(e) => update({ startTime: e.target.value })}
          />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-3.5">
        <Field label="Data de término" htmlFor="endDate">
          <Input
            id="endDate"
            type="date"
            required
            value={state.endDate}
            onChange={(e) => update({ endDate: e.target.value })}
          />
        </Field>
        <Field label="Horário de término" htmlFor="endTime">
          <Input
            id="endTime"
            type="time"
            required
            value={state.endTime}
            onChange={(e) => update({ endTime: e.target.value })}
          />
        </Field>
      </div>

      <Field label="Local" htmlFor="locationType">
        <SegmentedControl
          value={state.locationType}
          onChange={(locationType) => update({ locationType })}
          options={[
            { value: "presencial", label: "Presencial" },
            { value: "online", label: "Online" },
          ]}
        />
      </Field>

      {state.locationType === "presencial" ? (
        <Field label="Endereço" htmlFor="address">
          <Input
            id="address"
            required
            placeholder="UNIP Bauru — Auditório Central"
            value={state.address}
            onChange={(e) => update({ address: e.target.value })}
          />
        </Field>
      ) : (
        <Field label="Link ou plataforma" htmlFor="onlineLink">
          <Input
            id="onlineLink"
            required
            placeholder="Link do Zoom, YouTube ao vivo..."
            value={state.onlineLink}
            onChange={(e) => update({ onlineLink: e.target.value })}
          />
        </Field>
      )}

      <Field label="Descrição" htmlFor="description">
        <textarea
          id="description"
          rows={4}
          placeholder="Conte o que vai rolar no evento, atrações, palestrantes..."
          value={state.description}
          onChange={(e) => update({ description: e.target.value })}
          className={inputBaseClasses(false, "h-auto min-h-24 resize-y py-2.5")}
        />
      </Field>
    </div>
  );
}
