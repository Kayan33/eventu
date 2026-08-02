"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Calendar, Globe, MapPin } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { getEventBySlug } from "@/lib/api/events";
import { translateApiError } from "@/lib/api/errorMessages";
import { formatDateRange } from "@/lib/utils/formatDate";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { Button } from "@/components/ui/Button";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { RegistrationForm } from "./_components/RegistrationForm";
import type { EventEntity } from "@/lib/types/event";

type Mode = "login" | "signup";

export default function InscricaoPage() {
  const params = useParams<{ slug: string }>();
  const { actor, loginAsClient, registerAsClient } = useAuth();

  const [event, setEvent] = useState<EventEntity | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [mode, setMode] = useState<Mode>("login");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [cpf, setCpf] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    getEventBySlug(params.slug)
      .then(setEvent)
      .catch(() => setNotFound(true));
  }, [params.slug]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      if (mode === "login") {
        await loginAsClient({ email, password });
      } else {
        await registerAsClient({ name, email, password, cpf });
      }
    } catch (err) {
      setError(
        translateApiError(
          err,
          mode === "login" ? "Não foi possível entrar." : "Não foi possível criar sua conta.",
        ),
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (notFound) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-3 bg-bg px-6 text-center">
        <h1 className="text-xl font-semibold text-ink">Evento não encontrado</h1>
        <Link href="/" className="text-sm font-medium text-accent-700 hover:underline">
          Ir para a página inicial
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-bg">
      <div className="mx-auto max-w-[900px] px-4 py-8 sm:px-6 sm:py-12">
        <Link
          href={event ? `/${event.slug}` : "#"}
          className="mb-6 inline-flex items-center gap-1 text-sm text-ink-soft hover:text-ink"
        >
          <ArrowLeft size={14} /> Voltar pro evento
        </Link>

        <div className="grid grid-cols-1 items-start gap-6 md:grid-cols-[340px_1fr] md:gap-8">
          <div className="overflow-hidden rounded-md border border-divider bg-surface">
            {event?.coverImageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={event.coverImageUrl} alt="" className="h-auto w-full" />
            ) : (
              <div className="aspect-[5/2] w-full bg-accent-700" />
            )}

            <div className="p-6">
              <p className="mb-1 text-xs font-medium text-accent-700">Inscrição</p>
              <h1 className="text-xl font-semibold text-ink">{event?.title}</h1>

              {event ? (
                <>
                  <div className="mt-4 flex items-center gap-2 text-sm text-ink-soft">
                    <Calendar size={16} aria-hidden="true" />
                    {formatDateRange(event.startDate, event.endDate)}
                  </div>
                  <div className="mt-2 flex items-center gap-2 text-sm text-ink-soft">
                    {event.locationType === "online" ? (
                      <Globe size={16} aria-hidden="true" />
                    ) : (
                      <MapPin size={16} aria-hidden="true" />
                    )}
                    {event.locationType === "online" ? "Evento online" : event.location}
                  </div>
                </>
              ) : null}
            </div>
          </div>

          <div className="rounded-md border border-divider bg-surface p-5 sm:p-8">
            {actor?.type === "client" ? (
              event ? <RegistrationForm event={event} /> : null
            ) : (
              <>
                <h2 className="mb-1.5 text-lg font-semibold text-ink">
                  {mode === "login" ? "Entrar" : "Criar conta"}
                </h2>
                <p className="mb-5 text-sm text-ink-soft">
                  Você precisa de uma conta pra se inscrever nesse evento.
                </p>

                <SegmentedControl
                  value={mode}
                  onChange={(m) => {
                    setMode(m);
                    setError(null);
                  }}
                  options={[
                    { value: "login", label: "Entrar" },
                    { value: "signup", label: "Criar conta" },
                  ]}
                />

                <form onSubmit={onSubmit} className="mt-6 flex flex-col gap-4">
                  {mode === "signup" ? (
                    <Field label="Nome completo" htmlFor="name">
                      <Input
                        id="name"
                        required
                        autoComplete="name"
                        placeholder="Maria Souza"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                      />
                    </Field>
                  ) : null}

                  {mode === "signup" ? (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <Field label="Email" htmlFor="email">
                        <Input
                          id="email"
                          type="email"
                          required
                          autoComplete="email"
                          placeholder="maria@email.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                        />
                      </Field>

                      <Field label="CPF" htmlFor="cpf">
                        <Input
                          id="cpf"
                          required
                          placeholder="000.000.000-00"
                          value={cpf}
                          onChange={(e) => setCpf(e.target.value)}
                        />
                      </Field>
                    </div>
                  ) : (
                    <Field label="Email" htmlFor="email">
                      <Input
                        id="email"
                        type="email"
                        required
                        autoComplete="email"
                        placeholder="maria@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </Field>
                  )}

                  <Field label="Senha" htmlFor="password">
                    <PasswordInput
                      id="password"
                      required
                      minLength={mode === "signup" ? 6 : undefined}
                      autoComplete={mode === "login" ? "current-password" : "new-password"}
                      placeholder={mode === "signup" ? "Mínimo 6 caracteres" : "Sua senha"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </Field>

                  {error ? <p className="text-sm text-danger">{error}</p> : null}

                  <Button type="submit" loading={submitting} className="mt-1 w-full">
                    {mode === "login" ? "Entrar" : "Criar minha conta"}
                  </Button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
