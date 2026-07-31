import { useCallback, useEffect, useState } from "react";
import { getEvent, publishEvent, updateEvent, type EventPayload } from "@/lib/api/events";
import {
  createTicketType,
  deleteTicketType,
  listTicketTypes,
  updateTicketType,
} from "@/lib/api/ticketTypes";
import {
  createFormField,
  deleteFormField,
  listFormFields,
  updateFormField,
} from "@/lib/api/formFields";
import { translateApiError } from "@/lib/api/errorMessages";
import type { EventEntity } from "@/lib/types/event";
import type { TicketType } from "@/lib/types/ticketType";
import { FormFieldType, type EventFormField } from "@/lib/types/formField";

type LocationType = "presencial" | "online";

interface TicketRow {
  localId: string;
  remoteId?: string;
  name: string;
  price: string;
  quantity: string;
  sold: number;
  saving: boolean;
  dirty: boolean;
}

export interface FormFieldRow {
  localId: string;
  remoteId?: string;
  label: string;
  type: FormFieldType;
  optionsText: string;
  isRequired: boolean;
  displayOrder: number;
  saving: boolean;
  dirty: boolean;
}

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

// The wizard writes `new Date(\`${date}T${time}\`)`, which parses the
// string in local time — so reading it back must use local getters too,
// not toISOString(), or the displayed time drifts by the UTC offset.
function toLocalDateInputValue(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function toLocalTimeInputValue(date: Date): string {
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function ticketRowFromServer(t: TicketType): TicketRow {
  return {
    localId: t.id,
    remoteId: t.id,
    name: t.name,
    price: t.basePrice,
    quantity: String(t.quantity),
    sold: t.sold,
    saving: false,
    dirty: false,
  };
}

function parseOptions(text: string): string[] {
  return text
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function optionsToText(options?: string[]): string {
  return (options ?? []).join(", ");
}

function formFieldRowFromServer(f: EventFormField): FormFieldRow {
  return {
    localId: f.id,
    remoteId: f.id,
    label: f.label,
    type: f.type,
    optionsText: optionsToText(f.options),
    isRequired: f.isRequired,
    displayOrder: f.displayOrder,
    saving: false,
    dirty: false,
  };
}

export function useEventDetail(eventId: string) {
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [event, setEvent] = useState<EventEntity | null>(null);
  const [tickets, setTickets] = useState<TicketRow[]>([]);
  const [formFields, setFormFields] = useState<FormFieldRow[]>([]);

  const [overview, setOverview] = useState({
    title: "",
    startDate: "",
    startTime: "09:00",
    endDate: "",
    endTime: "18:00",
    locationType: "presencial" as LocationType,
    address: "",
    onlineLink: "",
    description: "",
  });
  const [overviewSaving, setOverviewSaving] = useState(false);
  const [overviewSaved, setOverviewSaved] = useState(false);
  const [publishing, setPublishing] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setNotFound(false);
    try {
      const [ev, ticketTypes, fields] = await Promise.all([
        getEvent(eventId),
        listTicketTypes(eventId),
        listFormFields(eventId),
      ]);
      setEvent(ev);
      setTickets(ticketTypes.map(ticketRowFromServer));
      setFormFields(fields.map(formFieldRowFromServer));

      const start = new Date(ev.startDate);
      const end = new Date(ev.endDate);
      setOverview({
        title: ev.title,
        startDate: toLocalDateInputValue(start),
        startTime: toLocalTimeInputValue(start),
        endDate: toLocalDateInputValue(end),
        endTime: toLocalTimeInputValue(end),
        locationType: "presencial",
        address: ev.location ?? "",
        onlineLink: "",
        description: ev.description ?? "",
      });
    } catch {
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);

  function updateOverview(patch: Partial<typeof overview>) {
    setOverview((o) => ({ ...o, ...patch }));
  }

  async function saveOverview() {
    setOverviewSaving(true);
    setError(null);
    try {
      const payload: EventPayload = {
        title: overview.title,
        description: overview.description || undefined,
        startDate: new Date(`${overview.startDate}T${overview.startTime}`).toISOString(),
        endDate: new Date(`${overview.endDate}T${overview.endTime}`).toISOString(),
        location: overview.locationType === "presencial" ? overview.address : overview.onlineLink,
      };
      const updated = await updateEvent(eventId, payload);
      setEvent(updated);
      setOverviewSaved(true);
      setTimeout(() => setOverviewSaved(false), 1500);
    } catch (err) {
      setError(translateApiError(err, "Não foi possível salvar as alterações."));
    } finally {
      setOverviewSaving(false);
    }
  }

  async function publish() {
    setPublishing(true);
    setError(null);
    try {
      const updated = await publishEvent(eventId);
      setEvent(updated);
    } catch (err) {
      setError(translateApiError(err, "Não foi possível publicar o evento."));
    } finally {
      setPublishing(false);
    }
  }

  function addTicketRow() {
    setTickets((rows) => [
      ...rows,
      { localId: crypto.randomUUID(), name: "", price: "", quantity: "", sold: 0, saving: false, dirty: true },
    ]);
  }

  function updateTicketRow(localId: string, patch: Partial<TicketRow>) {
    setTickets((rows) =>
      rows.map((r) => (r.localId === localId ? { ...r, ...patch, dirty: true } : r)),
    );
  }

  async function saveTicketRow(localId: string) {
    const row = tickets.find((r) => r.localId === localId);
    if (!row || !row.name.trim() || Number(row.quantity) <= 0) return;

    setTickets((rows) => rows.map((r) => (r.localId === localId ? { ...r, saving: true } : r)));
    setError(null);
    try {
      const payload = {
        name: row.name,
        basePrice: Number(row.price) || 0,
        quantity: Number(row.quantity),
      };
      const saved = row.remoteId
        ? await updateTicketType(row.remoteId, payload)
        : await createTicketType({ eventId, ...payload });
      setTickets((rows) => rows.map((r) => (r.localId === localId ? ticketRowFromServer(saved) : r)));
    } catch (err) {
      setError(translateApiError(err, "Não foi possível salvar o tipo de ingresso."));
      setTickets((rows) => rows.map((r) => (r.localId === localId ? { ...r, saving: false } : r)));
    }
  }

  async function removeTicketRow(localId: string) {
    const row = tickets.find((r) => r.localId === localId);
    if (!row) return;
    if (row.remoteId) {
      setError(null);
      try {
        await deleteTicketType(row.remoteId);
      } catch (err) {
        setError(translateApiError(err, "Não foi possível remover o tipo de ingresso."));
        return;
      }
    }
    setTickets((rows) => rows.filter((r) => r.localId !== localId));
  }

  function addFormFieldRow() {
    setFormFields((rows) => [
      ...rows,
      {
        localId: crypto.randomUUID(),
        label: "",
        type: FormFieldType.TEXT,
        optionsText: "",
        isRequired: false,
        displayOrder: rows.length,
        saving: false,
        dirty: true,
      },
    ]);
  }

  function updateFormFieldRow(localId: string, patch: Partial<FormFieldRow>) {
    setFormFields((rows) =>
      rows.map((r) => (r.localId === localId ? { ...r, ...patch, dirty: true } : r)),
    );
  }

  async function saveFormFieldRow(localId: string) {
    const row = formFields.find((r) => r.localId === localId);
    if (!row || !row.label.trim()) return;
    if (row.type === FormFieldType.SELECT && parseOptions(row.optionsText).length === 0) return;

    setFormFields((rows) => rows.map((r) => (r.localId === localId ? { ...r, saving: true } : r)));
    setError(null);
    try {
      const payload = {
        label: row.label,
        type: row.type,
        options: row.type === FormFieldType.SELECT ? parseOptions(row.optionsText) : undefined,
        isRequired: row.isRequired,
        displayOrder: row.displayOrder,
      };
      const saved = row.remoteId
        ? await updateFormField(row.remoteId, payload)
        : await createFormField({ eventId, ...payload });
      setFormFields((rows) =>
        rows.map((r) => (r.localId === localId ? formFieldRowFromServer(saved) : r)),
      );
    } catch (err) {
      setError(translateApiError(err, "Não foi possível salvar o campo do formulário."));
      setFormFields((rows) => rows.map((r) => (r.localId === localId ? { ...r, saving: false } : r)));
    }
  }

  async function removeFormFieldRow(localId: string) {
    const row = formFields.find((r) => r.localId === localId);
    if (!row) return;
    if (row.remoteId) {
      setError(null);
      try {
        await deleteFormField(row.remoteId);
      } catch (err) {
        setError(translateApiError(err, "Não foi possível remover o campo do formulário."));
        return;
      }
    }
    setFormFields((rows) => rows.filter((r) => r.localId !== localId));
  }

  async function persistFormFieldOrder(rows: FormFieldRow[]) {
    setError(null);
    try {
      await Promise.all(
        rows
          .filter((r) => r.remoteId)
          .map((r) => updateFormField(r.remoteId as string, { displayOrder: r.displayOrder })),
      );
    } catch (err) {
      setError(translateApiError(err, "Não foi possível reordenar os campos do formulário."));
    }
  }

  function reorderFormFieldRows(activeLocalId: string, overLocalId: string) {
    setFormFields((rows) => {
      const oldIndex = rows.findIndex((r) => r.localId === activeLocalId);
      const newIndex = rows.findIndex((r) => r.localId === overLocalId);
      if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) return rows;

      const reordered = [...rows];
      const [moved] = reordered.splice(oldIndex, 1);
      reordered.splice(newIndex, 0, moved);
      const withOrder = reordered.map((r, i) => ({ ...r, displayOrder: i }));
      void persistFormFieldOrder(withOrder);
      return withOrder;
    });
  }

  return {
    loading,
    notFound,
    error,
    event,
    overview,
    updateOverview,
    overviewSaving,
    overviewSaved,
    saveOverview,
    publishing,
    publish,
    tickets,
    addTicketRow,
    updateTicketRow,
    saveTicketRow,
    removeTicketRow,
    formFields,
    addFormFieldRow,
    updateFormFieldRow,
    saveFormFieldRow,
    removeFormFieldRow,
    reorderFormFieldRows,
  };
}
