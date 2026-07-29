import { Field } from "@/components/ui/Field";
import { Input, inputBaseClasses } from "@/components/ui/Input";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { Button } from "@/components/ui/Button";
import type { useEventDetail } from "@/lib/hooks/useEventDetail";

type Detail = ReturnType<typeof useEventDetail>;

export function OverviewTab({ detail }: { detail: Detail }) {
  const { overview, updateOverview, overviewSaving, overviewSaved, saveOverview } = detail;

  return (
    <div className="rounded-md border border-divider bg-surface p-6">
      <Field label="Nome do evento" htmlFor="ovTitle">
        <Input
          id="ovTitle"
          value={overview.title}
          onChange={(e) => updateOverview({ title: e.target.value })}
        />
      </Field>

      <div className="mt-4 grid grid-cols-2 gap-3.5">
        <Field label="Data de início" htmlFor="ovStartDate">
          <Input
            id="ovStartDate"
            type="date"
            value={overview.startDate}
            onChange={(e) => updateOverview({ startDate: e.target.value })}
          />
        </Field>
        <Field label="Horário de início" htmlFor="ovStartTime">
          <Input
            id="ovStartTime"
            type="time"
            value={overview.startTime}
            onChange={(e) => updateOverview({ startTime: e.target.value })}
          />
        </Field>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3.5">
        <Field label="Data de término" htmlFor="ovEndDate">
          <Input
            id="ovEndDate"
            type="date"
            value={overview.endDate}
            onChange={(e) => updateOverview({ endDate: e.target.value })}
          />
        </Field>
        <Field label="Horário de término" htmlFor="ovEndTime">
          <Input
            id="ovEndTime"
            type="time"
            value={overview.endTime}
            onChange={(e) => updateOverview({ endTime: e.target.value })}
          />
        </Field>
      </div>

      <Field label="Local" htmlFor="ovLocationType">
        <div className="mt-4">
          <SegmentedControl
            value={overview.locationType}
            onChange={(locationType) => updateOverview({ locationType })}
            options={[
              { value: "presencial", label: "Presencial" },
              { value: "online", label: "Online" },
            ]}
          />
        </div>
      </Field>

      <div className="mt-4">
        {overview.locationType === "presencial" ? (
          <Field label="Endereço" htmlFor="ovAddress">
            <Input
              id="ovAddress"
              value={overview.address}
              onChange={(e) => updateOverview({ address: e.target.value })}
            />
          </Field>
        ) : (
          <Field label="Link ou plataforma" htmlFor="ovOnlineLink">
            <Input
              id="ovOnlineLink"
              value={overview.onlineLink}
              onChange={(e) => updateOverview({ onlineLink: e.target.value })}
            />
          </Field>
        )}
      </div>

      <div className="mt-4">
        <Field label="Descrição" htmlFor="ovDescription">
          <textarea
            id="ovDescription"
            rows={4}
            value={overview.description}
            onChange={(e) => updateOverview({ description: e.target.value })}
            className={inputBaseClasses(false, "h-auto min-h-24 resize-y py-2.5")}
          />
        </Field>
      </div>

      <Button
        type="button"
        onClick={() => void saveOverview()}
        loading={overviewSaving}
        className="mt-6 px-6"
      >
        {overviewSaved ? "Salvo!" : "Salvar alterações"}
      </Button>
    </div>
  );
}
