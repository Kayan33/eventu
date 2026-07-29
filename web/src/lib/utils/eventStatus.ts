import type { EventStatus } from "@/lib/types/event";

interface StatusMeta {
  label: string;
  className: string;
}

const STATUS_META: Record<EventStatus, StatusMeta> = {
  draft: { label: "Rascunho", className: "bg-neutral-bar text-ink-soft" },
  published: { label: "Publicado", className: "bg-success/15 text-success" },
  ongoing: { label: "Em andamento", className: "bg-accent-700/15 text-accent-700" },
  finished: { label: "Encerrado", className: "bg-neutral-bar text-ink-soft" },
  cancelled: { label: "Cancelado", className: "bg-danger/15 text-danger" },
};

export function eventStatusMeta(status: EventStatus): StatusMeta {
  return STATUS_META[status];
}
