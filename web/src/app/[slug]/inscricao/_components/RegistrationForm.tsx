"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { createTicket, listTickets, type TicketEntity } from "@/lib/api/tickets";
import { translateApiError } from "@/lib/api/errorMessages";
import { Field } from "@/components/ui/Field";
import { Input, inputBaseClasses } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { FormFieldType } from "@/lib/types/formField";
import { PaymentStep } from "./PaymentStep";
import type { EventEntity } from "@/lib/types/event";
import type { TicketType } from "@/lib/types/ticketType";

interface RegistrationFormProps {
  event: EventEntity;
}

function isSoldOut(ticketType: TicketType, event: EventEntity): boolean {
  if (event.capacityMode === "total") {
    const totalSold = (event.ticketTypes ?? []).reduce((sum, t) => sum + t.sold, 0);
    return totalSold >= (event.totalCapacity ?? 0);
  }
  return ticketType.sold >= (ticketType.quantity ?? 0);
}

function htmlInputType(type: FormFieldType): string {
  if (type === FormFieldType.NUMBER) return "number";
  if (type === FormFieldType.EMAIL) return "email";
  if (type === FormFieldType.PHONE) return "tel";
  return "text";
}

function isResumable(ticket: TicketEntity): boolean {
  return ticket.status !== "cancelled" && ticket.status !== "expired";
}

export function RegistrationForm({ event }: RegistrationFormProps) {
  const ticketTypes = [...(event.ticketTypes ?? [])].sort(
    (a, b) => a.displayOrder - b.displayOrder,
  );
  const formFields = [...(event.formFields ?? [])].sort(
    (a, b) => a.displayOrder - b.displayOrder,
  );
  const allSoldOut = ticketTypes.length > 0 && ticketTypes.every((t) => isSoldOut(t, event));

  const [ticketTypeId, setTicketTypeId] = useState(
    () => ticketTypes.find((t) => !isSoldOut(t, event))?.id ?? (ticketTypes[0]?.id ?? ""),
  );
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [ticket, setTicket] = useState<TicketEntity | null>(null);
  const [checkingExisting, setCheckingExisting] = useState(true);

  useEffect(() => {
    let cancelled = false;
    listTickets({ eventId: event.id })
      .then((tickets) => {
        if (cancelled) return;
        const existing = tickets.find(isResumable);
        if (existing) setTicket(existing);
      })
      .finally(() => {
        if (!cancelled) setCheckingExisting(false);
      });
    return () => {
      cancelled = true;
    };
  }, [event.id]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const formResponses = formFields.map((field) => ({
        formFieldId: field.id,
        value: answers[field.id] ?? "",
      }));
      const created = await createTicket({ ticketTypeId, formResponses });
      setTicket(created);
    } catch (err) {
      setError(translateApiError(err, "Não foi possível confirmar sua inscrição."));
    } finally {
      setSubmitting(false);
    }
  }

  if (ticket) {
    if (!ticket.payment) {
      return (
        <div>
          <p className="text-sm font-medium text-ink">Inscrição confirmada!</p>
          <p className="mt-2 text-sm text-ink-soft">
            Código: <span className="font-medium text-ink">{ticket.code}</span>
          </p>
          <p className="mt-1 text-sm text-ink-soft">
            Esse ingresso é gratuito — nenhum pagamento necessário.
          </p>
          <Link
            href="/minhas-inscricoes"
            className="mt-4 inline-block text-sm font-medium text-accent-700 hover:underline"
          >
            Ver minhas inscrições →
          </Link>
        </div>
      );
    }
    return <PaymentStep ticket={ticket} />;
  }

  if (checkingExisting) {
    return null;
  }

  if (allSoldOut) {
    return <p className="text-sm text-danger">Esse evento está com todos os ingressos esgotados.</p>;
  }

  return (
    <div>
      <h2 className="mb-1.5 text-lg font-semibold text-ink">Formulário de inscrição</h2>
      <p className="mb-5 text-sm text-ink-soft">
        Responda as perguntas abaixo para confirmar sua inscrição.
      </p>

      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        {ticketTypes.length > 1 ? (
          <Field label="Tipo de ingresso" htmlFor="ticketType">
            <select
              id="ticketType"
              required
              value={ticketTypeId}
              onChange={(e) => setTicketTypeId(e.target.value)}
              className={inputBaseClasses(false)}
            >
              {ticketTypes.map((t) => (
                <option key={t.id} value={t.id} disabled={isSoldOut(t, event)}>
                  {t.name}
                  {isSoldOut(t, event) ? " (esgotado)" : ""}
                </option>
              ))}
            </select>
          </Field>
        ) : null}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {formFields.map((field) => (
            <Field key={field.id} label={field.label} htmlFor={`field-${field.id}`}>
              {field.type === FormFieldType.SELECT ? (
                <select
                  id={`field-${field.id}`}
                  required={field.isRequired}
                  value={answers[field.id] ?? ""}
                  onChange={(e) => setAnswers((a) => ({ ...a, [field.id]: e.target.value }))}
                  className={inputBaseClasses(false)}
                >
                  <option value="">Selecione</option>
                  {(field.options ?? []).map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              ) : (
                <Input
                  id={`field-${field.id}`}
                  type={htmlInputType(field.type)}
                  required={field.isRequired}
                  value={answers[field.id] ?? ""}
                  onChange={(e) => setAnswers((a) => ({ ...a, [field.id]: e.target.value }))}
                />
              )}
            </Field>
          ))}
        </div>

        {error ? <p className="text-sm text-danger">{error}</p> : null}

        <Button type="submit" loading={submitting} className="mt-1 w-full">
          Confirmar inscrição
        </Button>
      </form>
    </div>
  );
}
