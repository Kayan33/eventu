import { useCallback, useEffect, useState } from "react";
import { getEvent, publishEvent, updateEvent, type EventPayload } from "@/lib/api/events";
import {
  createTicketType,
  deleteTicketType,
  listTicketTypes,
  updateTicketType,
} from "@/lib/api/ticketTypes";
import { translateApiError } from "@/lib/api/errorMessages";
import type { EventEntity } from "@/lib/types/event";
import type { TicketType } from "@/lib/types/ticketType";

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

export function useEventDetail(eventId: string) {
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [event, setEvent] = useState<EventEntity | null>(null);
  const [tickets, setTickets] = useState<TicketRow[]>([]);

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
      const [ev, ticketTypes] = await Promise.all([getEvent(eventId), listTicketTypes(eventId)]);
      setEvent(ev);
      setTickets(ticketTypes.map(ticketRowFromServer));

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
  };
}
