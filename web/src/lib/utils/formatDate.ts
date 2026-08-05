const MONTH_DAY = new Intl.DateTimeFormat("pt-BR", { day: "numeric", month: "long" });
const DAY_ONLY = new Intl.DateTimeFormat("pt-BR", { day: "numeric" });

export function formatDateRange(startIso: string, endIso: string): string {
  const start = new Date(startIso);
  const end = new Date(endIso);
  const sameDay = start.toDateString() === end.toDateString();

  if (sameDay) {
    return MONTH_DAY.format(start) + " de " + start.getFullYear();
  }

  const sameMonth = start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear();
  if (sameMonth) {
    return `${DAY_ONLY.format(start)}–${MONTH_DAY.format(end)} de ${end.getFullYear()}`;
  }

  return `${MONTH_DAY.format(start)} – ${MONTH_DAY.format(end)} de ${end.getFullYear()}`;
}

/** "Expira em Xh" / "Expira em X min" — null once the deadline has passed. */
export function formatTimeRemaining(expiresAtIso: string): string | null {
  const diffMs = new Date(expiresAtIso).getTime() - Date.now();
  if (diffMs <= 0) return null;

  const minutes = Math.round(diffMs / 60_000);
  if (minutes < 60) {
    return `Expira em ${minutes} min`;
  }

  const hours = Math.round(minutes / 60);
  if (hours < 24) {
    return `Expira em ${hours}h`;
  }

  const days = Math.round(hours / 24);
  return `Expira em ${days} dia${days > 1 ? "s" : ""}`;
}
