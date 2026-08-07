"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { useRequireUser } from "@/lib/hooks/useRequireUser";
import { useEventDetail } from "@/lib/hooks/useEventDetail";
import { PanelLayout } from "@/components/panel/PanelLayout";
import { StatusBadge } from "@/components/panel/StatusBadge";
import { Tabs } from "@/components/panel/Tabs";
import { Button } from "@/components/ui/Button";
import { formatDateRange } from "@/lib/utils/formatDate";
import { OverviewTab } from "./_components/OverviewTab";
import { TicketsTab } from "./_components/TicketsTab";
import { FormFieldsTab } from "./_components/FormFieldsTab";
import { CredenciamentoTab } from "@/components/credenciamento/CredenciamentoTab";

type TabValue = "overview" | "tickets" | "form" | "credenciamento";

export default function EventDetailPage() {
  const { ready } = useRequireUser();
  const params = useParams<{ id: string }>();
  const detail = useEventDetail(params.id);
  const [tab, setTab] = useState<TabValue>("overview");
  const [confirmPublish, setConfirmPublish] = useState(false);

  if (!ready) return null;

  if (detail.loading) {
    return (
      <PanelLayout>
        <div className="mx-auto max-w-[900px] p-8">
          <p className="text-sm text-ink-soft">Carregando…</p>
        </div>
      </PanelLayout>
    );
  }

  if (detail.notFound || !detail.event) {
    return (
      <PanelLayout>
        <div className="mx-auto max-w-[900px] p-8">
          <p className="text-sm text-danger">Evento não encontrado.</p>
          <Link href="/" className="mt-3 inline-block text-sm font-medium text-accent-700">
            ← Voltar pra Eventos
          </Link>
        </div>
      </PanelLayout>
    );
  }

  const { event } = detail;

  return (
    <PanelLayout>
      <div className="mx-auto max-w-[900px] p-8">
        <Link
          href="/"
          className="mb-2 inline-flex items-center gap-1 text-[13px] text-ink-soft hover:text-ink"
        >
          <ArrowLeft size={14} /> Voltar
        </Link>

        <div className="mb-1 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-2xl font-semibold text-ink">{event.title}</h1>
            <StatusBadge status={event.status} />
          </div>
          {event.status === "draft" ? (
            <Button
              type="button"
              onClick={() => setConfirmPublish(true)}
              loading={detail.publishing}
              disabled={Boolean(detail.publishBlockedReason)}
              title={detail.publishBlockedReason ?? undefined}
              className="px-4"
            >
              Publicar
            </Button>
          ) : null}
        </div>

        <div className="mb-6 flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-ink-soft">
          <span>{formatDateRange(event.startDate, event.endDate)}</span>
          {event.status === "draft" ? (
            <span>
              {detail.publishBlockedReason ?? "Página pública disponível após publicar"}
            </span>
          ) : (
            <a
              href={`/${event.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-medium text-accent-700 hover:underline"
            >
              Ver página pública <ExternalLink size={12} />
            </a>
          )}
        </div>

        {detail.error ? <p className="mb-4 text-sm text-danger">{detail.error}</p> : null}

        <Tabs
          value={tab}
          onChange={setTab}
          items={[
            { value: "overview", label: "Visão geral" },
            { value: "tickets", label: "Ingressos" },
            { value: "form", label: "Formulário" },
            { value: "credenciamento", label: "Credenciamento" },
          ]}
        />

        {tab === "overview" ? <OverviewTab detail={detail} /> : null}
        {tab === "tickets" ? <TicketsTab detail={detail} /> : null}
        {tab === "form" ? <FormFieldsTab detail={detail} /> : null}
        {tab === "credenciamento" ? <CredenciamentoTab eventId={event.id} /> : null}
      </div>

      {confirmPublish && event.status === "draft" ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-[420px] rounded-md border border-divider bg-surface p-6">
            <h2 className="mb-2 text-lg font-semibold text-ink">Publicar evento</h2>
            <p className="mb-5 text-sm text-ink-soft">
              Depois de publicado, o <strong>nome e a URL do evento não poderão mais ser
              alterados</strong>. Confira se está tudo certo antes de continuar.
            </p>

            {detail.error ? <p className="mb-4 text-sm text-danger">{detail.error}</p> : null}

            <div className="flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setConfirmPublish(false)}
                disabled={detail.publishing}
                className="h-10 rounded-md border border-divider bg-surface px-4 text-sm font-medium text-ink hover:border-accent-700 hover:text-accent-700 disabled:opacity-50"
              >
                Cancelar
              </button>
              <Button
                type="button"
                onClick={() => void detail.publish()}
                loading={detail.publishing}
                className="px-4"
              >
                Publicar
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </PanelLayout>
  );
}
