import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { SegmentedControl } from "@/components/wizard/SegmentedControl";
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
  const { state, update } = wizard;

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

      <p className="text-xs text-ink-soft">
        Fica salvo na sua organização — você só preenche uma vez.
      </p>
    </div>
  );
}
