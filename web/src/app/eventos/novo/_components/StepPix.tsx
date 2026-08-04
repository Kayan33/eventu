import type { ChangeEvent } from "react";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import type { useEventWizard } from "@/lib/hooks/useEventWizard";
import type { PixKeyType } from "@/lib/types/tenant";

type Wizard = ReturnType<typeof useEventWizard>;

const PIX_KEY_TYPES: { value: PixKeyType; label: string }[] = [
  { value: "cpf", label: "CPF/CNPJ" },
  { value: "email", label: "Email" },
  { value: "phone", label: "Telefone" },
  { value: "random", label: "Aleatória" },
];

const PIX_KEY_PLACEHOLDERS: Record<PixKeyType, string> = {
  cpf: "000.000.000-00",
  email: "contato@atleticamed.com",
  phone: "(14) 99999-9999",
  random: "Chave aleatória gerada pelo seu banco",
};

export function StepPix({ wizard }: { wizard: Wizard }) {
  const { state, update, uploadPixQrCode } = wizard;

  function handleQrCodeChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (file) void uploadPixQrCode(file);
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="mb-1 text-2xl font-semibold text-ink">Receber via Pix</h2>
        <p className="text-sm text-ink-soft">
          Pra receber os pagamentos, informe sua chave Pix.
        </p>
      </div>

      <Field label="Tipo de chave" htmlFor="pixKeyType">
        <SegmentedControl
          value={state.pixKeyType}
          onChange={(pixKeyType) => update({ pixKeyType })}
          options={PIX_KEY_TYPES}
        />
      </Field>

      <Field label="Chave Pix" htmlFor="pixKey">
        <Input
          id="pixKey"
          required
          placeholder={PIX_KEY_PLACEHOLDERS[state.pixKeyType]}
          value={state.pixKey}
          onChange={(e) => update({ pixKey: e.target.value })}
        />
      </Field>

      <Field label="Nome do recebedor" htmlFor="pixBeneficiary">
        <Input
          id="pixBeneficiary"
          required
          placeholder="Atlética de Medicina UNIP"
          value={state.pixBeneficiary}
          onChange={(e) => update({ pixBeneficiary: e.target.value })}
        />
      </Field>

      <Field
        label="QR code do Pix"
        htmlFor="pixQrCode"
        hint="Opcional — mostrado pro cliente junto com a chave Pix"
      >
        {state.pixQrCodeUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={state.pixQrCodeUrl}
            alt=""
            className="mb-2.5 h-40 w-40 rounded-md border border-divider object-contain"
          />
        ) : null}
        <div className="flex items-center gap-2.5">
          <input
            id="pixQrCode"
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={handleQrCodeChange}
            disabled={state.qrUploading}
            className="text-sm text-ink-soft file:mr-3 file:h-9 file:rounded-md file:border file:border-divider file:bg-surface file:px-3.5 file:text-sm file:font-medium file:text-ink hover:file:border-accent-700"
          />
          {state.qrUploading ? <span className="text-xs text-ink-soft">Enviando…</span> : null}
        </div>
      </Field>

      <p className="text-xs text-ink-soft">
        Fica salvo na sua organização — você só preenche uma vez.
      </p>
    </div>
  );
}
