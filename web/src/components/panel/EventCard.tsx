import Link from "next/link";
import { StatusBadge } from "./StatusBadge";
import { cn } from "@/lib/utils/cn";
import { formatDateRange } from "@/lib/utils/formatDate";
import type { EventEntity } from "@/lib/types/event";

interface EventCardProps {
  event: EventEntity;
  onPublish: (id: string) => void;
  publishing: boolean;
}

export function EventCard({ event, onPublish, publishing }: EventCardProps) {
  const isDraft = event.status === "draft";
  const showSales = event.status === "published" || event.status === "ongoing";

  const sold = event.ticketTypes?.reduce((sum, t) => sum + t.sold, 0) ?? 0;
  const total =
    event.capacityMode === "total"
      ? (event.totalCapacity ?? 0)
      : (event.ticketTypes?.reduce((sum, t) => sum + (t.quantity ?? 0), 0) ?? 0);
  const soldPct = total > 0 ? Math.round((sold / total) * 100) : 0;

  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-between gap-4 rounded-md border bg-surface p-5",
        isDraft ? "border-dashed border-divider opacity-80" : "border-divider",
      )}
    >
      <div className="min-w-0 flex-1">
        <div className="mb-1 flex flex-wrap items-center gap-2.5">
          <span className="text-[17px] font-semibold text-ink">{event.title}</span>
          <StatusBadge status={event.status} />
        </div>
        <div className="text-[13px] text-ink-soft">{formatDateRange(event.startDate, event.endDate)}</div>

        {showSales ? (
          <div className="mt-2">
            <div className="text-[13px] text-ink">
              {sold}/{total} ingressos vendidos
            </div>
            <div className="mt-1 h-1.5 w-[180px] max-w-full overflow-hidden rounded-full bg-neutral-bar">
              <div className="h-full bg-accent-700" style={{ width: `${soldPct}%` }} />
            </div>
          </div>
        ) : null}
      </div>

      <div className="flex shrink-0 items-center gap-2.5">
        <Link
          href={`/eventos/${event.id}`}
          className="flex h-10 items-center rounded-md border border-divider bg-surface px-4 text-sm font-medium text-ink transition-colors hover:border-accent-700 hover:text-accent-700"
        >
          Ver detalhes
        </Link>
        {isDraft ? (
          <button
            type="button"
            onClick={() => onPublish(event.id)}
            disabled={publishing}
            className="flex h-10 items-center rounded-md bg-accent-700 px-4 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {publishing ? "Publicando…" : "Publicar"}
          </button>
        ) : null}
      </div>
    </div>
  );
}
