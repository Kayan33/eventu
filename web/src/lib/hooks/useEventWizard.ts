import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { createEvent, publishEvent, updateEvent, type EventPayload } from "@/lib/api/events";
import {
  createTicketType,
  deleteTicketType,
  updateTicketType,
} from "@/lib/api/ticketTypes";
import { updateTenantPix } from "@/lib/api/tenants";
import { translateApiError } from "@/lib/api/errorMessages";
import type { PixKeyType } from "@/lib/types/tenant";

type Step = 1 | 2 | 3;
type LocationType = "presencial" | "online";

interface TicketRow {
  localId: string;
  remoteId?: string;
  name: string;
  price: string;
  quantity: string;
}

interface WizardState {
  step: Step;
  submitting: boolean;
  error: string | null;
  done: boolean;
  published: boolean;
  copied: boolean;

  title: string;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  locationType: LocationType;
  address: string;
  onlineLink: string;
  description: string;

  isFree: boolean;
  tickets: TicketRow[];

  pixKeyType: PixKeyType;
  pixKey: string;
  pixBeneficiary: string;

  eventId: string | null;
  eventSlug: string | null;
}

const STEP_LABELS: Record<Step, string> = {
  1: "Sobre o evento",
  2: "Ingressos",
  3: "Receber via Pix",
};

function initialState(): WizardState {
  return {
    step: 1,
    submitting: false,
    error: null,
    done: false,
    published: false,
    copied: false,

    title: "",
    startDate: "",
    startTime: "09:00",
    endDate: "",
    endTime: "18:00",
    locationType: "presencial",
    address: "",
    onlineLink: "",
    description: "",

    isFree: false,
    tickets: [{ localId: crypto.randomUUID(), name: "Inteira", price: "", quantity: "" }],

    pixKeyType: "cpf",
    pixKey: "",
    pixBeneficiary: "",

    eventId: null,
    eventSlug: null,
  };
}

export function useEventWizard() {
  const { actor } = useAuth();
  const tenantId = actor?.type === "user" ? actor.tenantId : null;
  const [state, setState] = useState<WizardState>(initialState);

  const totalSteps = state.isFree ? 2 : 3;
  const publicLink = state.eventSlug ? `eventu.com/${state.eventSlug}` : "";

  function update(patch: Partial<WizardState>) {
    setState((s) => ({ ...s, ...patch }));
  }

  function addTicket() {
    setState((s) => ({
      ...s,
      tickets: [...s.tickets, { localId: crypto.randomUUID(), name: "", price: "", quantity: "" }],
    }));
  }

  function updateTicket(localId: string, patch: Partial<TicketRow>) {
    setState((s) => ({
      ...s,
      tickets: s.tickets.map((t) => (t.localId === localId ? { ...t, ...patch } : t)),
    }));
  }

  async function removeTicket(localId: string) {
    const ticket = state.tickets.find((t) => t.localId === localId);
    setState((s) => ({ ...s, tickets: s.tickets.filter((t) => t.localId !== localId) }));
    if (ticket?.remoteId) {
      await deleteTicketType(ticket.remoteId);
    }
  }

  function isStepValid(): boolean {
    if (state.step === 1) {
      const hasLocation =
        state.locationType === "presencial" ? state.address.trim() : state.onlineLink.trim();
      return Boolean(
        state.title.trim() && state.startDate && state.startTime && state.endDate && state.endTime && hasLocation,
      );
    }
    if (state.step === 2) {
      return (
        state.tickets.length > 0 &&
        state.tickets.every(
          (t) =>
            t.name.trim().length > 0 &&
            Number(t.quantity) > 0 &&
            (state.isFree || Number(t.price) >= 0),
        )
      );
    }
    return Boolean(state.pixKey.trim() && state.pixBeneficiary.trim());
  }

  async function ensureEvent(): Promise<string> {
    const payload: EventPayload = {
      title: state.title,
      description: state.description || undefined,
      startDate: new Date(`${state.startDate}T${state.startTime}`).toISOString(),
      endDate: new Date(`${state.endDate}T${state.endTime}`).toISOString(),
      location: state.locationType === "presencial" ? state.address : state.onlineLink,
    };

    if (state.eventId) {
      const event = await updateEvent(state.eventId, payload);
      return event.id;
    }
    const event = await createEvent(payload);
    setState((s) => ({ ...s, eventId: event.id, eventSlug: event.slug }));
    return event.id;
  }

  async function syncTicketTypes(eventId: string): Promise<void> {
    const synced: TicketRow[] = [];
    for (const ticket of state.tickets) {
      const payload = {
        name: ticket.name,
        basePrice: state.isFree ? 0 : Number(ticket.price),
        quantity: Number(ticket.quantity),
      };
      if (ticket.remoteId) {
        await updateTicketType(ticket.remoteId, payload);
        synced.push(ticket);
      } else {
        const created = await createTicketType({ eventId, ...payload });
        synced.push({ ...ticket, remoteId: created.id });
      }
    }
    setState((s) => ({ ...s, tickets: synced }));
  }

  async function onContinue() {
    if (!isStepValid() || !tenantId) return;

    setState((s) => ({ ...s, submitting: true, error: null }));
    try {
      if (state.step === 1) {
        await ensureEvent();
        setState((s) => ({ ...s, step: 2, submitting: false }));
        return;
      }

      if (state.step === 2) {
        const eventId = state.eventId;
        if (!eventId) throw new Error("Event not created yet");
        await syncTicketTypes(eventId);
        if (state.isFree) {
          setState((s) => ({ ...s, done: true, submitting: false }));
        } else {
          setState((s) => ({ ...s, step: 3, submitting: false }));
        }
        return;
      }

      if (!state.eventId) throw new Error("Event not created yet");
      await updateTenantPix(tenantId, {
        pixKey: state.pixKey,
        pixKeyType: state.pixKeyType,
        pixBeneficiary: state.pixBeneficiary,
      });
      setState((s) => ({ ...s, done: true, submitting: false }));
    } catch (err) {
      setState((s) => ({
        ...s,
        submitting: false,
        error: translateApiError(err, "Não foi possível continuar. Tente novamente."),
      }));
    }
  }

  async function publishNow() {
    if (!state.eventId) return;
    setState((s) => ({ ...s, submitting: true, error: null }));
    try {
      await publishEvent(state.eventId);
      setState((s) => ({ ...s, published: true, submitting: false }));
    } catch (err) {
      setState((s) => ({
        ...s,
        submitting: false,
        error: translateApiError(err, "Não foi possível publicar o evento. Tente novamente."),
      }));
    }
  }

  function onBack() {
    setState((s) => ({ ...s, step: Math.max(1, s.step - 1) as Step, error: null }));
  }

  function onCopyLink() {
    void navigator.clipboard?.writeText(`https://${publicLink}`);
    setState((s) => ({ ...s, copied: true }));
    setTimeout(() => setState((s) => ({ ...s, copied: false })), 2000);
  }

  function onShareWhatsapp() {
    const text = `Vem pro ${state.title}! https://${publicLink}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  }

  return {
    state,
    update,
    addTicket,
    updateTicket,
    removeTicket,
    onContinue,
    onBack,
    onCopyLink,
    onShareWhatsapp,
    publishNow,
    isStepValid: isStepValid(),
    totalSteps,
    stepLabel: STEP_LABELS[state.step],
    canGoBack: state.step > 1,
    continueLabel: state.step === totalSteps ? "Concluir" : "Continuar",
    publicLink,
  };
}
