"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { Button } from "@/components/ui/Button";
import { PasswordStrengthMeter } from "@/components/ui/PasswordStrengthMeter";
import { usePasswordStrength } from "@/lib/hooks/usePasswordStrength";
import { useAuth } from "@/contexts/AuthContext";
import { translateApiError } from "@/lib/api/errorMessages";
import { resolvePostAuthDestination } from "@/lib/api/events";

export default function CadastroPage() {
  const router = useRouter();
  const { register } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [orgName, setOrgName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const strength = usePasswordStrength(password);
  const showMismatch = confirmPassword.length > 0 && password !== confirmPassword;

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("As senhas não coincidem.");
      return;
    }

    setSubmitting(true);
    let actor;
    try {
      actor = await register({ tenantName: orgName, name, email, password });
    } catch (err) {
      setError(translateApiError(err, "Não foi possível criar sua conta."));
      setSubmitting(false);
      return;
    }

    // Account already exists at this point — a failure here (e.g. the
    // session cookie not landing yet) shouldn't be reported as a failed
    // sign-up, so it gets its own try/catch with a safe fallback route.
    try {
      router.push(await resolvePostAuthDestination(actor));
    } catch {
      router.push("/");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthLayout
      eyebrow="Para organizadores"
      title="Crie sua organização e comece a vender ingressos em minutos."
      description="Sem aprovação, sem burocracia, sem taxa de cadastro. Recebimento direto via Pix."
      formMaxWidth="max-w-[560px]"
    >
      <h6 className="mb-2 text-sm font-medium text-accent-700">Cadastro de organizador</h6>
      <h2 className="mb-1.5 text-2xl font-semibold text-ink">Criar minha conta</h2>
      <p className="mb-7 text-sm text-ink-soft">
        Grátis, sem taxa de cadastro. Sua organização nasce junto com sua conta.
      </p>

      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Nome completo" htmlFor="name">
            <Input
              id="name"
              required
              autoComplete="name"
              placeholder="Maria Clara Santos"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </Field>

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
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Senha" htmlFor="password">
            <PasswordInput
              id="password"
              required
              minLength={6}
              autoComplete="new-password"
              placeholder="Mínimo 6 caracteres"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </Field>

          <Field
            label="Confirmar senha"
            htmlFor="confirmPassword"
            error={showMismatch ? "As senhas não coincidem." : undefined}
          >
            <PasswordInput
              id="confirmPassword"
              required
              autoComplete="new-password"
              placeholder="Repita a senha"
              invalid={showMismatch}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </Field>
        </div>
        <PasswordStrengthMeter strength={strength} />

        <div className="my-2 h-px bg-divider" />

        <Field label="Nome da organização" htmlFor="orgName">
          <Input
            id="orgName"
            required
            placeholder="Atlética de Medicina UNIP"
            value={orgName}
            onChange={(e) => setOrgName(e.target.value)}
          />
        </Field>

        {error ? <p className="text-sm text-danger">{error}</p> : null}

        <Button type="submit" loading={submitting} className="mt-2 w-full">
          Criar minha conta
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-ink-soft">
        Já tenho conta →{" "}
        <Link href="/login" className="font-medium text-accent-700">
          Entrar
        </Link>
      </p>
    </AuthLayout>
  );
}
