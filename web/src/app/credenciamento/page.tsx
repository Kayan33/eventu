"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { UserCheck } from "lucide-react";
import { useRequireUser } from "@/lib/hooks/useRequireUser";
import { PanelLayout } from "@/components/panel/PanelLayout";
import { CredenciamentoTab } from "@/components/credenciamento/CredenciamentoTab";
import { listEvents } from "@/lib/api/events";
import { translateApiError } from "@/lib/api/errorMessages";
import type { EventEntity } from "@/lib/types/event";

function CredenciamentoContent() {
  const { ready } = useRequireUser();
  const router = useRouter();
  const searchParams = useSearchParams();
  const eventId = searchParams.get("eventId");

  const [events, setEvents] = useState<EventEntity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!ready) return;
    listEvents()
      .then(setEvents)
      .catch((err: unknown) => setError(translateApiError(err, "Não foi possível carregar seus eventos.")))
      .finally(() => setLoading(false));
  }, [ready]);

  if (!ready) return null;

  const selectedEvent = events.find((e) => e.id === eventId) ?? null;

  function selectEvent(id: string) {
    router.push(`/credenciamento?eventId=${id}`);
  }

  return (
    <PanelLayout>
      <div className="mx-auto max-w-[900px] p-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold text-ink">Credenciamento</h1>
            {selectedEvent ? (
              <p className="mt-0.5 text-sm text-ink-soft">{selectedEvent.title}</p>
            ) : null}
          </div>
          {selectedEvent ? (
            <select
              value={selectedEvent.id}
              onChange={(e) => selectEvent(e.target.value)}
              className="h-10 rounded-md border border-divider bg-surface px-3 text-sm text-ink outline-none focus:border-accent-700 focus:ring-1 focus:ring-accent-700"
            >
              {events.map((event) => (
                <option key={event.id} value={event.id}>
                  {event.title}
                </option>
              ))}
            </select>
          ) : null}
        </div>

        {error ? <p className="mb-4 text-sm text-danger">{error}</p> : null}

        {loading ? (
          <p className="text-sm text-ink-soft">Carregando…</p>
        ) : events.length === 0 ? (
          <div className="flex flex-col items-center gap-2 rounded-md border border-dashed border-divider py-16 text-center">
            <UserCheck size={28} className="text-ink-soft" />
            <p className="text-sm font-medium text-ink">Nenhum evento ainda</p>
            <p className="text-sm text-ink-soft">Crie um evento pra poder credenciar participantes.</p>
          </div>
        ) : selectedEvent ? (
          <CredenciamentoTab eventId={selectedEvent.id} />
        ) : (
          <div>
            <p className="mb-3 text-sm text-ink-soft">Qual evento você quer credenciar?</p>
            <div className="flex flex-col gap-2.5">
              {events.map((event) => (
                <button
                  key={event.id}
                  type="button"
                  onClick={() => selectEvent(event.id)}
                  className="flex items-center justify-between rounded-md border border-divider bg-surface p-4 text-left transition-colors hover:border-accent-700"
                >
                  <span className="text-sm font-medium text-ink">{event.title}</span>
                  <span className="text-xs text-ink-soft">
                    {event.status === "published" ? "Publicado" : "Rascunho"}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </PanelLayout>
  );
}

export default function CredenciamentoPage() {
  return (
    <Suspense fallback={null}>
      <CredenciamentoContent />
    </Suspense>
  );
}
