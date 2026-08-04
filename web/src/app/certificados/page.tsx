"use client";

import Link from "next/link";
import { Award } from "lucide-react";
import { useRequireClient } from "@/lib/hooks/useRequireClient";
import { ClientPanelLayout } from "@/components/client-panel/ClientPanelLayout";

export default function CertificadosPage() {
  const { actor, ready } = useRequireClient();

  if (!ready) return null;

  if (!actor) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-3 bg-bg px-6 text-center">
        <h1 className="text-xl font-semibold text-ink">Você precisa estar logado</h1>
        <p className="text-sm text-ink-soft">Entre pela página do evento em que você se inscreveu.</p>
        <Link href="/" className="text-sm font-medium text-accent-700 hover:underline">
          Ir para a página inicial
        </Link>
      </main>
    );
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
