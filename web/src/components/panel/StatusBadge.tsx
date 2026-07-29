import type { EventStatus } from "@/lib/types/event";
import { eventStatusMeta } from "@/lib/utils/eventStatus";
import { cn } from "@/lib/utils/cn";

export function StatusBadge({ status, className }: { status: EventStatus; className?: string }) {
  const meta = eventStatusMeta(status);
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        meta.className,
        className,
      )}
    >
      {meta.label}
    </span>
  );
}
