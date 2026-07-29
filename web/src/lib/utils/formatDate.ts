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
