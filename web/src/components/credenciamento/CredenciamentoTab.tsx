"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Search, Check, QrCode } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { listTickets, checkInTicket, type TicketEntity } from "@/lib/api/tickets";
import { translateApiError } from "@/lib/api/errorMessages";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Tabs } from "@/components/panel/Tabs";
import { QrScannerModal, type ScanOutcome } from "./QrScannerModal";

type StatusFilter = "pending" | "checked_in" | "all";

const EMPTY_STATE_LABEL: Record<StatusFilter, string> = {
  pending: "Ninguém aguardando entrada no momento.",
  checked_in: "Ainda ninguém foi credenciado.",
  all: "Nenhum participante encontrado.",
};

const STATUS_META: Record<string, { label: string; className: string }> = {
  reserved: { label: "Aguardando pagamento", className: "bg-neutral-bar text-ink-soft" },
  confirmed: { label: "Confirmado", className: "bg-accent-700/10 text-accent-700" },
  used: { label: "Credenciado", className: "bg-success/10 text-success" },
  cancelled: { label: "Cancelado", className: "bg-danger/10 text-danger" },
  expired: { label: "Expirado", className: "bg-neutral-bar text-ink-soft" },
};

function matchesSearch(ticket: TicketEntity, term: string): boolean {
  if (!term) return true;
  const haystack = `${ticket.client?.name ?? ""} ${ticket.client?.email ?? ""} ${ticket.code}`.toLowerCase();
  return haystack.includes(term.toLowerCase());
}


export function CredenciamentoTab({ eventId }: { eventId: string }) {
  const { actor } = useAuth();
  const canCheckIn = actor?.type === "user" && (actor.role === "admin" || actor.role === "editor");

  const [tickets, setTickets] = useState<TicketEntity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("pending");
  const [ticketTypeFilter, setTicketTypeFilter] = useState<string>("all");
  const [checkingInId, setCheckingInId] = useState<string | null>(null);
  const [showScanner, setShowScanner] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setTickets(await listTickets({ eventId }));
    } catch (err) {
      setError(translateApiError(err, "Não foi possível carregar os participantes."));
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);

  async function handleCheckIn(id: string) {
    setCheckingInId(id);
    setError(null);
    try {
      const updated = await checkInTicket(id);
      setTickets((rows) => rows.map((t) => (t.id === id ? updated : t)));
    } catch (err) {
      setError(translateApiError(err, "Não foi possível confirmar a entrada."));
    } finally {
      setCheckingInId(null);
    }
  }

  async function handleScan(ticketId: string): Promise<ScanOutcome> {
    try {
      const updated = await checkInTicket(ticketId);
      setTickets((rows) =>
        rows.some((t) => t.id === ticketId)
          ? rows.map((t) => (t.id === ticketId ? updated : t))
          : [...rows, updated],
      );
      return {
        ok: true,
        message: "Entrada confirmada",
        name: updated.client?.name ?? "Participante",
        subtitle: updated.client?.email,
      };
    } catch (err) {
      return { ok: false, message: translateApiError(err, "Não foi possível confirmar a entrada.") };
    }
  }

  const relevant = useMemo(
    () => tickets.filter((t) => t.status !== "cancelled" && t.status !== "expired"),
    [tickets],
  );
  const pendingCount = relevant.filter((t) => t.status === "confirmed").length;
  const checkedInCount = relevant.filter((t) => t.status === "used").length;

  const statusFilterOptions: { value: StatusFilter; label: string }[] = [
    { value: "pending", label: `Aguardando entrada (${pendingCount})` },
    { value: "checked_in", label: `Credenciados (${checkedInCount})` },
    { value: "all", label: `Todos (${tickets.length})` },
  ];

  const ticketTypeOptions = useMemo(() => {
    const byId = new Map<string, string>();
    for (const t of tickets) {
      if (t.ticketType) byId.set(t.ticketType.id, t.ticketType.name);
    }
    return Array.from(byId, ([id, name]) => ({ id, name }));
  }, [tickets]);

  const filtered = useMemo(
    () =>
      tickets.filter((t) => {
        if (statusFilter === "pending" && t.status !== "confirmed") return false;
        if (statusFilter === "checked_in" && t.status !== "used") return false;
        if (ticketTypeFilter !== "all" && t.ticketTypeId !== ticketTypeFilter) return false;
        return matchesSearch(t, search);
      }),
    [tickets, search, statusFilter, ticketTypeFilter],
  );

  return (
    <div className="rounded-md border border-divider bg-surface p-4 sm:p-6">
      <p className="mb-4 text-sm text-ink-soft">
        <span className="font-medium text-ink">{checkedInCount}</span> de{" "}
        <span className="font-medium text-ink">{relevant.length}</span> credenciados
      </p>

      <Tabs value={statusFilter} onChange={setStatusFilter} items={statusFilterOptions} />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 sm:max-w-72">
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-soft" />
          <Input
            placeholder="Buscar por nome, email ou código"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9"
          />
        </div>
        {canCheckIn ? (
          <button
            type="button"
            onClick={() => setShowScanner(true)}
            className="flex h-10 items-center gap-1.5 rounded-md border border-divider bg-surface px-3.5 text-sm font-medium text-ink hover:border-accent-700 hover:text-accent-700"
          >
            <QrCode size={16} />
            Escanear QR code
          </button>
        ) : null}
        {ticketTypeOptions.length > 1 ? (
          <select
            value={ticketTypeFilter}
            onChange={(e) => setTicketTypeFilter(e.target.value)}
            className="h-10 rounded-md border border-divider bg-surface px-3 text-sm text-ink outline-none focus:border-accent-700 focus:ring-1 focus:ring-accent-700"
          >
            <option value="all">Todos os tipos de ingresso</option>
            {ticketTypeOptions.map((tt) => (
              <option key={tt.id} value={tt.id}>
                {tt.name}
              </option>
            ))}
          </select>
        ) : null}
      </div>

      {error ? <p className="mb-4 text-sm text-danger">{error}</p> : null}

      {loading ? (
        <p className="text-sm text-ink-soft">Carregando…</p>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-ink-soft">
          {tickets.length === 0 ? "Ainda não tem nenhum ingresso vendido." : EMPTY_STATE_LABEL[statusFilter]}
        </p>
      ) : (
        <div className="flex flex-col gap-2.5">
          {filtered.map((ticket) => {
            const meta = STATUS_META[ticket.status] ?? { label: ticket.status, className: "bg-neutral-bar text-ink-soft" };
            const canConfirm = canCheckIn && ticket.status === "confirmed";
            return (
              <div
                key={ticket.id}
                className="flex flex-col gap-3 rounded-md border border-divider p-3.5 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <div className="text-sm font-medium text-ink">{ticket.client?.name ?? "—"}</div>
                  <div className="truncate text-[13px] text-ink-soft">{ticket.client?.email}</div>
                  <div className="mt-0.5 text-xs text-ink-soft">
                    {ticket.ticketType?.name} · Código {ticket.code}
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${meta.className}`}>
                    {meta.label}
                  </span>
                  {ticket.status === "used" ? (
                    <span className="flex h-9 w-9 items-center justify-center text-success">
                      <Check size={18} />
                    </span>
                  ) : (
                    <Button
                      type="button"
                      onClick={() => void handleCheckIn(ticket.id)}
                      loading={checkingInId === ticket.id}
                      disabled={!canConfirm}
                      title={
                        !canCheckIn
                          ? "Só admin e editor podem confirmar entrada"
                          : ticket.status !== "confirmed"
                            ? "Só ingressos confirmados podem ser credenciados"
                            : undefined
                      }
                      className="h-9 px-3.5 text-sm"
                    >
                      Confirmar entrada
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showScanner ? (
        <QrScannerModal onScan={handleScan} onClose={() => setShowScanner(false)} />
      ) : null}
    </div>
  );
}
