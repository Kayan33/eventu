"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRequireUser } from "@/lib/hooks/useRequireUser";
import { PanelLayout } from "@/components/panel/PanelLayout";
import { EventCard } from "@/components/panel/EventCard";
import { listEvents, publishEvent } from "@/lib/api/events";
import { getTenant } from "@/lib/api/tenants";
import { translateApiError } from "@/lib/api/errorMessages";
import type { EventEntity } from "@/lib/types/event";

export default function EventosPage() {
  const { ready, actor } = useRequireUser();
  const [events, setEvents] = useState<EventEntity[]>([]);
  const [loading, setLoading] = useState(true);
  const [publishingId, setPublishingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hasSavedPix, setHasSavedPix] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await listEvents();
      setEvents(data);
    } catch (err) {
      setError(translateApiError(err, "Não foi possível carregar seus eventos."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (ready) void load();
  }, [ready, load]);

  useEffect(() => {
    if (!actor) return;
    let cancelled = false;
    getTenant(actor.tenantId).then((tenant) => {
      if (cancelled) return;
      setHasSavedPix(Boolean(tenant.pixKey && tenant.pixBeneficiary));
    });
    return () => {
      cancelled = true;
    };
  }, [actor]);

  async function handlePublish(id: string) {
    setPublishingId(id);
    setError(null);
    try {
      const updated = await publishEvent(id);
      setEvents((evs) => evs.map((e) => (e.id === id ? updated : e)));
    } catch (err) {
      setError(translateApiError(err, "Não foi possível publicar o evento."));
    } finally {
      setPublishingId(null);
    }
  }

  if (!ready) return null;

  return (
    <PanelLayout>
      <div className="mx-auto max-w-[960px] p-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-semibold text-ink">Seus eventos</h1>
          <Link
            href="/eventos/novo"
            className="flex h-10 items-center rounded-md bg-accent-700 px-4 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          >
            + Novo evento
          </Link>
        </div>

        {error ? <p className="mb-4 text-sm text-danger">{error}</p> : null}

        {!hasSavedPix ? (
          <div className="mb-6 flex flex-wrap items-center justify-between gap-2 rounded-md border border-divider bg-surface px-4 py-3 text-sm">
            <span className="text-ink-soft">
              Configure sua chave Pix pra conseguir publicar eventos pagos.
            </span>
            <Link href="/configuracoes" className="font-medium text-accent-700 hover:underline">
              Ir para Configurações →
            </Link>
          </div>
        ) : null}

        {loading ? (
          <p className="text-sm text-ink-soft">Carregando…</p>
        ) : events.length === 0 ? (
          <div className="rounded-md border border-divider bg-surface p-14 text-center">
            <p className="mb-4 text-[15px] text-ink-soft">
              Sua organização ainda não tem nenhum evento.
            </p>
            <Link
              href="/eventos/novo"
              className="inline-flex h-10 items-center rounded-md bg-accent-700 px-4 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            >
              Criar meu primeiro evento
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {events.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                onPublish={handlePublish}
                publishing={publishingId === event.id}
              />
            ))}
          </div>
        )}
      </div>
    </PanelLayout>
  );
}
