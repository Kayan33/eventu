import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { MapPin, Globe, Calendar } from "lucide-react";
import { getEventBySlug } from "@/lib/api/events";
import { formatDateRange } from "@/lib/utils/formatDate";
import { TicketList } from "./_components/TicketList";
import { EventPageHeader } from "./_components/EventPageHeader";
import type { EventEntity } from "@/lib/types/event";

interface PageProps {
  params: Promise<{ slug: string }>;
}

async function loadEvent(slug: string): Promise<EventEntity | null> {
  try {
    return await getEventBySlug(slug);
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const event = await loadEvent(slug);
  if (!event) {
    return { title: "Evento não encontrado" };
  }

  const description = (event.description ?? "").slice(0, 155);
  return {
    title: event.title,
    description,
    openGraph: {
      title: event.title,
      description,
      images: event.coverImageUrl ? [event.coverImageUrl] : undefined,
    },
  };
}

export default async function EventLandingPage({ params }: PageProps) {
  const { slug } = await params;
  const event = await loadEvent(slug);
  if (!event) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-bg">
      <div className="mx-auto max-w-[1100px] px-4 pb-10 pt-5 sm:px-6 sm:pb-14 sm:pt-8">
        <EventPageHeader slug={event.slug} />

        {event.coverImageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={event.coverImageUrl}
            alt=""
            className="h-auto w-full rounded-md"
          />
        ) : (
          <div className="aspect-[5/2] w-full rounded-md bg-accent-700" />
        )}

        <div className="mt-4 rounded-md border border-divider bg-surface p-5 sm:mt-6 sm:p-8">
          <h1 className="text-2xl font-semibold text-ink sm:text-3xl">{event.title}</h1>

          <div className="mt-4 flex items-center gap-2 text-sm text-ink-soft sm:text-[15px]">
            <Calendar size={18} aria-hidden="true" />
            {formatDateRange(event.startDate, event.endDate)}
          </div>

          <div className="mt-2.5 flex flex-col gap-2 text-sm text-ink-soft sm:flex-row sm:items-center sm:justify-between sm:text-[15px]">
            <div className="flex items-center gap-2">
              {event.locationType === "online" ? (
                <Globe size={18} aria-hidden="true" />
              ) : (
                <MapPin size={18} aria-hidden="true" />
              )}
              {event.locationType === "online" ? "Evento online" : event.location}
            </div>
            {event.locationType === "presencial" && event.location ? (
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.location)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium text-accent-700 hover:underline sm:shrink-0"
              >
                Ver no mapa
              </a>
            ) : null}
          </div>

          {event.description ? (
            <p className="mt-5 whitespace-pre-line text-sm leading-relaxed text-ink-soft sm:text-[15px]">
              {event.description}
            </p>
          ) : null}
        </div>

        <div className="mt-4 rounded-md border border-divider bg-surface p-5 sm:mt-6 sm:p-8">
          <h2 className="mb-4 text-lg font-semibold text-ink sm:text-xl">Ingressos</h2>
          <TicketList
            slug={event.slug}
            ticketTypes={event.ticketTypes ?? []}
            capacityMode={event.capacityMode}
            totalCapacity={event.totalCapacity}
            hasForm={(event.formFields?.length ?? 0) > 0}
          />
        </div>
      </div>
    </main>
  );
}
