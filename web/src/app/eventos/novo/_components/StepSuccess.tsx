import Link from "next/link";
import { Copy, Check, PartyPopper, CircleCheckBig } from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { useEventWizard } from "@/lib/hooks/useEventWizard";

type Wizard = ReturnType<typeof useEventWizard>;

export function StepSuccess({ wizard }: { wizard: Wizard }) {
  const { state, publicLink, onCopyLink, onShareWhatsapp, publishNow } = wizard;

  return (
    <div className="flex flex-col items-center py-6 text-center">
      <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-accent-700/10 text-accent-700">
        {state.published ? <PartyPopper size={28} /> : <CircleCheckBig size={28} />}
      </div>
      <h1 className="mb-2 text-3xl font-semibold text-ink">
        {state.published ? "Seu evento está no ar!" : "Rascunho pronto!"}
      </h1>
      <p className="mb-8 text-[15px] text-ink-soft">
        {state.published
          ? `${state.title} já pode ser encontrado e compartilhado.`
          : `${state.title} está salvo como rascunho. Você ainda pode adicionar um formulário de inscrição personalizado antes de publicar.`}
      </p>

      <div className="mb-5 w-full rounded-md border border-divider bg-surface p-5">
        <div className="break-all text-xl font-semibold text-accent-700">{publicLink}</div>
      </div>

      {state.error ? <p className="mb-4 text-sm text-danger">{state.error}</p> : null}

      {state.published ? (
        <div className="mb-7 flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={onCopyLink}
            className="flex h-10 items-center gap-2 rounded-md bg-accent-700 px-4 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          >
            {state.copied ? <Check size={16} /> : <Copy size={16} />}
            {state.copied ? "Link copiado!" : "Copiar link"}
          </button>
          <button
            type="button"
            onClick={onShareWhatsapp}
            className="flex h-10 items-center rounded-md border border-divider bg-surface px-4 text-sm font-medium text-ink transition-colors hover:border-accent-700 hover:text-accent-700"
          >
            Compartilhar no WhatsApp
          </button>
        </div>
      ) : (
        <div className="mb-7">
          <Button type="button" onClick={() => void publishNow()} loading={state.submitting} className="px-6">
            Publicar evento
          </Button>
        </div>
      )}

      <Link href="/" className="text-sm font-medium text-accent-700">
        Ir para o painel
      </Link>
    </div>
  );
}
