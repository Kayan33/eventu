"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { getEventBySlug } from "@/lib/api/events";
import { translateApiError } from "@/lib/api/errorMessages";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { Button } from "@/components/ui/Button";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
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
      <div className="mx-auto max-w-[480px] px-4 py-10 sm:px-6">
        <Link
          href={event ? `/${event.slug}` : "#"}
          className="mb-4 inline-flex items-center gap-1 text-sm text-ink-soft hover:text-ink"
        >
          <ArrowLeft size={14} /> Voltar pro evento
        </Link>

        {event?.coverImageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={event.coverImageUrl} alt="" className="mb-4 h-auto w-full rounded-md" />
        ) : null}

        <div className="rounded-md border border-divider bg-surface p-6 sm:p-8">
          {event ? (
            <>
              <p className="mb-1 text-xs font-medium text-accent-700">Inscrição</p>
              <h1 className="mb-6 text-base font-semibold text-ink">{event.title}</h1>
            </>
          ) : null}

          {actor?.type === "client" ? (
            <div>
              <p className="text-sm text-ink">Você já está conectado.</p>

            </div>
          ) : (
            <>
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

              <form onSubmit={onSubmit} className="mt-5 flex flex-col gap-4">
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

                {mode === "signup" ? (
                  <Field label="CPF" htmlFor="cpf">
                    <Input
                      id="cpf"
                      required
                      placeholder="000.000.000-00"
                      value={cpf}
                      onChange={(e) => setCpf(e.target.value)}
                    />
                  </Field>
                ) : null}

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
    </main>
  );
}
