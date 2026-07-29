"use client";

import { useEffect, useState } from "react";
import { useRequireUser } from "@/lib/hooks/useRequireUser";
import { PanelLayout } from "@/components/panel/PanelLayout";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { Button } from "@/components/ui/Button";
import { getTenant, updateTenant } from "@/lib/api/tenants";
import { translateApiError } from "@/lib/api/errorMessages";
import type { PixKeyType } from "@/lib/types/tenant";

const PIX_KEY_TYPES: { value: PixKeyType; label: string }[] = [
  { value: "cpf", label: "CPF/CNPJ" },
  { value: "email", label: "Email" },
  { value: "phone", label: "Telefone" },
  { value: "random", label: "Aleatória" },
];

export default function ConfiguracoesPage() {
  const { actor, ready } = useRequireUser();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [pixKeyType, setPixKeyType] = useState<PixKeyType>("cpf");
  const [pixKey, setPixKey] = useState("");
  const [pixBeneficiary, setPixBeneficiary] = useState("");

  useEffect(() => {
    if (!ready || !actor) return;
    getTenant(actor.tenantId)
      .then((tenant) => {
        setName(tenant.name);
        setPixKeyType(tenant.pixKeyType ?? "cpf");
        setPixKey(tenant.pixKey ?? "");
        setPixBeneficiary(tenant.pixBeneficiary ?? "");
      })
      .catch((err: unknown) => setError(translateApiError(err, "Não foi possível carregar os dados.")))
      .finally(() => setLoading(false));
  }, [ready, actor]);

  async function handleSave() {
    if (!actor) return;
    setSaving(true);
    setError(null);
    try {
      await updateTenant(actor.tenantId, { name, pixKey, pixKeyType, pixBeneficiary });
      setSaved(true);
      setTimeout(() => setSaved(false), 1500);
    } catch (err) {
      setError(translateApiError(err, "Não foi possível salvar as alterações."));
    } finally {
      setSaving(false);
    }
  }

  if (!ready) return null;

  return (
    <PanelLayout>
      <div className="mx-auto max-w-[560px] p-8">
        <h1 className="mb-6 text-2xl font-semibold text-ink">Configurações</h1>

        {loading ? (
          <p className="text-sm text-ink-soft">Carregando…</p>
        ) : (
          <div className="rounded-md border border-divider bg-surface p-6">
            <Field label="Nome da organização" htmlFor="orgName">
              <Input id="orgName" value={name} onChange={(e) => setName(e.target.value)} />
            </Field>

            <div className="my-6 h-px bg-divider" />
            <h2 className="mb-3 text-sm font-medium text-accent-700">Recebimento via Pix</h2>

            <Field label="Tipo de chave" htmlFor="pixKeyType">
              <div className="mt-1">
                <SegmentedControl value={pixKeyType} onChange={setPixKeyType} options={PIX_KEY_TYPES} />
              </div>
            </Field>

            <div className="mt-3.5">
              <Field label="Chave Pix" htmlFor="pixKey">
                <Input id="pixKey" value={pixKey} onChange={(e) => setPixKey(e.target.value)} />
              </Field>
            </div>

            <div className="mt-3.5">
              <Field label="Nome do recebedor" htmlFor="pixBeneficiary">
                <Input
                  id="pixBeneficiary"
                  value={pixBeneficiary}
                  onChange={(e) => setPixBeneficiary(e.target.value)}
                />
              </Field>
            </div>

            {error ? <p className="mt-4 text-sm text-danger">{error}</p> : null}

            <Button type="button" onClick={() => void handleSave()} loading={saving} className="mt-6 px-6">
              {saved ? "Salvo!" : "Salvar alterações"}
            </Button>
          </div>
        )}
      </div>
    </PanelLayout>
  );
}
