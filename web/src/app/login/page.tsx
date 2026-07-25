"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/contexts/AuthContext";
import { translateApiError } from "@/lib/api/errorMessages";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login({ email, password });
      router.push("/");
    } catch (err) {
      setError(translateApiError(err, "Não foi possível entrar."));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthLayout
      eyebrow="Bem-vindo de volta"
      title="Gerencie seus eventos e acompanhe suas vendas."
      description="Congressos, semanas acadêmicas e festas — tudo em um só painel."
    >
      <h6 className="mb-2 text-sm font-medium text-accent-700">Acesso</h6>
      <h2 className="mb-1.5 text-2xl font-semibold text-ink">Entrar</h2>
      <p className="mb-7 text-sm text-ink-soft">
        Entre para acessar o painel da sua organização.
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

        <Button type="submit" loading={submitting} className="mt-2">
          Entrar
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-ink-soft">
        Não tem conta?{" "}
        <Link href="/cadastro" className="font-medium text-accent-700">
          Cadastre-se
        </Link>
      </p>
    </AuthLayout>
  );
}
