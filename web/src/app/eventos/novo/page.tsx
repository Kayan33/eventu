"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { createEvent } from "@/lib/api/events";
import { translateApiError } from "@/lib/api/errorMessages";
import { WizardShell } from "@/components/wizard/WizardShell";
import { Field } from "@/components/ui/Field";
import { Input, inputBaseClasses } from "@/components/ui/Input";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { Button } from "@/components/ui/Button";

type LocationType = "presencial" | "online";

interface FormState {
  title: string;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  locationType: LocationType;
  address: string;
  onlineLink: string;
  description: string;
}

const INITIAL_STATE: FormState = {
  title: "",
  startDate: "",
  startTime: "09:00",
  endDate: "",
  endTime: "18:00",
  locationType: "presencial",
  address: "",
  onlineLink: "",
  description: "",
};

export default function NewEventPage() {
  const router = useRouter();
  const { actor, loading } = useAuth();
  const [form, setForm] = useState<FormState>(INITIAL_STATE);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isAdmin = actor?.type === "user" && actor.role === "admin";

  useEffect(() => {
    if (!loading && !isAdmin) {
      router.replace("/");
    }
  }, [loading, isAdmin, router]);

  if (loading || !isAdmin) {
    return null;
  }

  function update(patch: Partial<FormState>) {
    setForm((f) => ({ ...f, ...patch }));
  }

  const hasLocation =
    form.locationType === "presencial" ? form.address.trim() : form.onlineLink.trim();
  const isValid = Boolean(
    form.title.trim() && form.startDate && form.startTime && form.endDate && form.endTime && hasLocation,
  );

  async function onSubmit() {
    if (!isValid) return;
    setSubmitting(true);
    setError(null);
    try {
      const event = await createEvent({
        title: form.title,
        description: form.description || undefined,
        startDate: new Date(`${form.startDate}T${form.startTime}`).toISOString(),
        endDate: new Date(`${form.endDate}T${form.endTime}`).toISOString(),
        location: form.locationType === "presencial" ? form.address : form.onlineLink,
        locationType: form.locationType,
      });
      router.push(`/eventos/${event.id}`);
    } catch (err) {
      setError(translateApiError(err, "Não foi possível criar o evento."));
      setSubmitting(false);
    }
  }

  return (
    <WizardShell>
      <div className="flex flex-col gap-4">
        <div>
          <h2 className="mb-1 text-2xl font-semibold text-ink">Novo evento</h2>
          <p className="text-sm text-ink-soft">
            Os dados essenciais pra sua página existir — ingressos e formulário você configura na
            sequência.
          </p>
        </div>

        <Field label="Nome do evento" htmlFor="title">
          <Input
            id="title"
            required
            placeholder="Semana de Medicina 2026"
            value={form.title}
            onChange={(e) => update({ title: e.target.value })}
          />
        </Field>

        <div className="grid grid-cols-2 gap-3.5">
          <Field label="Data de início" htmlFor="startDate">
            <Input
              id="startDate"
              type="date"
              required
              value={form.startDate}
              onChange={(e) => update({ startDate: e.target.value })}
            />
          </Field>
          <Field label="Horário de início" htmlFor="startTime">
            <Input
              id="startTime"
              type="time"
              required
              value={form.startTime}
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
              value={form.endDate}
              onChange={(e) => update({ endDate: e.target.value })}
            />
          </Field>
          <Field label="Horário de término" htmlFor="endTime">
            <Input
              id="endTime"
              type="time"
              required
              value={form.endTime}
              onChange={(e) => update({ endTime: e.target.value })}
            />
          </Field>
        </div>

        <Field label="Local" htmlFor="locationType">
          <SegmentedControl
            value={form.locationType}
            onChange={(locationType) => update({ locationType })}
            options={[
              { value: "presencial", label: "Presencial" },
              { value: "online", label: "Online" },
            ]}
          />
        </Field>

        {form.locationType === "presencial" ? (
          <Field label="Endereço" htmlFor="address">
            <Input
              id="address"
              required
              placeholder="UNIP Bauru — Auditório Central"
              value={form.address}
              onChange={(e) => update({ address: e.target.value })}
            />
          </Field>
        ) : (
          <Field label="Link ou plataforma" htmlFor="onlineLink">
            <Input
              id="onlineLink"
              required
              placeholder="Link do Zoom, YouTube ao vivo..."
              value={form.onlineLink}
              onChange={(e) => update({ onlineLink: e.target.value })}
            />
          </Field>
        )}

        <Field label="Descrição" htmlFor="description">
          <textarea
            id="description"
            rows={4}
            placeholder="Conte o que vai rolar no evento, atrações, palestrantes..."
            value={form.description}
            onChange={(e) => update({ description: e.target.value })}
            className={inputBaseClasses(false, "h-auto min-h-24 resize-y py-2.5")}
          />
        </Field>

        {error ? <p className="text-sm text-danger">{error}</p> : null}

        <div className="mt-5 flex justify-between border-t border-divider pt-6">
          <button
            type="button"
            onClick={() => router.push("/")}
            className="text-sm font-medium text-ink-soft hover:text-ink"
          >
            Cancelar
          </button>
          <Button
            type="button"
            onClick={() => void onSubmit()}
            disabled={!isValid}
            loading={submitting}
            className="px-6"
          >
            Criar evento
          </Button>
        </div>
      </div>
    </WizardShell>
  );
}
