"use client";

import { useState } from "react";
import Link from "next/link";
import type { TicketType } from "@/lib/types/ticketType";
import type { CapacityMode } from "@/lib/types/event";

interface TicketListProps {
  slug: string;
  ticketTypes: TicketType[];
  capacityMode: CapacityMode;
  totalCapacity?: number;
  hasForm: boolean;
}

export function TicketList({
  slug,
  ticketTypes,
  capacityMode,
  totalCapacity,
  hasForm,
}: TicketListProps) {
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  const sortedTypes = [...ticketTypes].sort((a, b) => a.displayOrder - b.displayOrder);
  const isTotal = capacityMode === "total";
  const totalSold = ticketTypes.reduce((sum, t) => sum + t.sold, 0);
  const totalRemaining = (totalCapacity ?? 0) - totalSold;

  function isSoldOut(t: TicketType): boolean {
    if (isTotal) return totalRemaining <= 0;
    return t.sold >= (t.quantity ?? 0);
  }

  function remainingFor(t: TicketType): number {
    return isTotal ? totalRemaining : (t.quantity ?? 0) - t.sold;
  }

  function updateQty(id: string, delta: number, max: number) {
    setQuantities((q) => {
      const next = Math.max(0, Math.min(max, (q[id] ?? 0) + delta));
      return { ...q, [id]: next };
    });
  }

  const anyAvailable = sortedTypes.some((t) => !isSoldOut(t));

  return (
    <div>
      {isTotal ? (
        <p className="mb-3 text-[13px] text-ink-soft">
          {totalSold} de {totalCapacity} vagas ocupadas
        </p>
      ) : null}

      {hasForm ? (
        <p className="mb-3 text-[13px] text-ink-soft">
          O valor de cada ingresso é calculado depois que você responde o formulário de
          inscrição.
        </p>
      ) : null}

      <div className="flex flex-col gap-3">
        {sortedTypes.map((t) => {
          const soldOut = isSoldOut(t);
          const remaining = remainingFor(t);

          return (
            <div
              key={t.id}
              className={`rounded-md border border-divider p-3.5 ${soldOut ? "opacity-50" : ""}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-sm font-medium text-ink">{t.name}</div>
                  {soldOut ? (
                    <div className="mt-0.5 text-xs font-medium text-danger">Esgotado</div>
                  ) : (
                    <div className="mt-0.5 text-xs text-ink-soft">
                      {remaining} vaga{remaining === 1 ? "" : "s"} restante{remaining === 1 ? "" : "s"}
                    </div>
                  )}
                </div>
                {hasForm ? null : (
                  <div className="whitespace-nowrap text-sm font-semibold text-accent-700">
                    {Number(t.basePrice) > 0 ? `R$ ${t.basePrice}` : "Gratuito"}
                  </div>
                )}
              </div>

              {soldOut || hasForm ? null : (
                <div className="mt-2.5 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    aria-label="Diminuir quantidade"
                    onClick={() => updateQty(t.id, -1, remaining)}
                    className="flex h-7 w-7 items-center justify-center rounded-full border border-divider text-ink-soft transition-colors hover:border-accent-700 hover:text-accent-700"
                  >
                    −
                  </button>
                  <span className="min-w-[16px] text-center text-sm font-medium text-ink">
                    {quantities[t.id] ?? 0}
                  </span>
                  <button
                    type="button"
                    aria-label="Aumentar quantidade"
                    onClick={() => updateQty(t.id, 1, remaining)}
                    className="flex h-7 w-7 items-center justify-center rounded-full border border-divider text-ink-soft transition-colors hover:border-accent-700 hover:text-accent-700"
                  >
                    +
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {anyAvailable ? (
        <Link
          href={`/${slug}/inscricao`}
          className="mt-4 flex h-11 w-full items-center justify-center rounded-md bg-accent-700 text-sm font-semibold text-white transition-opacity hover:opacity-90"
        >
          Fazer inscrição
        </Link>
      ) : (
        <button
          type="button"
          disabled
          className="mt-4 flex h-11 w-full cursor-not-allowed items-center justify-center rounded-md bg-accent-700 text-sm font-semibold text-white opacity-40"
        >
          Esgotado
        </button>
      )}
    </div>
  );
}
