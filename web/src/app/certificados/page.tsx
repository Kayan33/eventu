"use client";

import { Award } from "lucide-react";
import { useRequireClient } from "@/lib/hooks/useRequireClient";
import { ClientPanelLayout } from "@/components/client-panel/ClientPanelLayout";
import { ClientLoginForm } from "@/components/client-panel/ClientLoginForm";

export default function CertificadosPage() {
  const { actor, ready } = useRequireClient();

  if (!ready) return null;

  if (!actor) {
    return <ClientLoginForm />;
  }

  return (
    <ClientPanelLayout>
      <div className="mx-auto max-w-[880px] px-4 py-8 sm:px-8 sm:py-10">
        <h1 className="mb-1 text-2xl font-semibold text-ink">Certificados</h1>
        <p className="mb-8 text-sm text-ink-soft">Seus certificados de participação vão aparecer aqui.</p>

        <div className="flex flex-col items-center gap-2 rounded-md border border-dashed border-divider py-16 text-center">
          <Award size={28} className="text-ink-soft" />
          <p className="text-sm font-medium text-ink">Em breve</p>
          <p className="text-sm text-ink-soft">Ainda estamos construindo essa parte.</p>
        </div>
      </div>
    </ClientPanelLayout>
  );
}
