"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { Ticket } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { Button } from "@/components/ui/Button";
import { translateApiError } from "@/lib/api/errorMessages";

export function ClientLoginForm() {
  const { loginAsClient } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await loginAsClient({ email, password });
    } catch (err) {
      setError(translateApiError(err, "Não foi possível entrar."));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthLayout
      eyebrow="Área do participante"
      title="Acompanhe suas inscrições e comprovantes."
      description="Entre com o email e senha que você usou pra se inscrever em qualquer evento."
    >
      <span className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-divider bg-bg px-3 py-1 text-xs font-medium text-ink-soft">
        <Ticket size={12} aria-hidden="true" />
        Login de participante
      </span>
      <h6 className="mb-2 text-sm font-medium text-accent-700">Acesso</h6>
      <h2 className="mb-1.5 text-2xl font-semibold text-ink">Entrar</h2>
      <p className="mb-7 text-sm text-ink-soft">
        Use o mesmo login que você criou ao se inscrever em um evento.
      </p>

      <form onSubmit={onSubmit} className="flex flex-col gap-4">
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

        <Field label="Senha" htmlFor="password">
          <PasswordInput
            id="password"
            required
            autoComplete="current-password"
            placeholder="Sua senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </Field>

        {error ? <p className="text-sm text-danger">{error}</p> : null}

        <Button type="submit" loading={submitting} className="mt-2 w-full">
          Entrar
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-ink-soft">
        Ainda não se inscreveu em nenhum evento?{" "}
        <Link href="/" className="font-medium text-accent-700">
          Ver eventos
        </Link>
      </p>

      <p className="mt-2 text-center text-xs text-ink-soft">
        É organizador de eventos?{" "}
        <Link href="/login" className="font-medium text-accent-700">
          Entre como organizador
        </Link>
      </p>
    </AuthLayout>
  );
}
