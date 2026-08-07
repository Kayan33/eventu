"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";

export function EventPageHeader({ slug }: { slug: string }) {
  const { actor, loading, logout } = useAuth();

  if (loading) {
    return <div className="mb-3 h-5" />;
  }

  return (
    <div className="mb-3 flex items-center justify-end gap-4 text-sm">
      {actor?.type === "client" ? (
        <>
          <Link href="/minhas-inscricoes" className="font-medium text-accent-700 hover:underline">
            Minhas inscrições
          </Link>
          <button
            type="button"
            onClick={() => void logout()}
            className="text-ink-soft hover:text-ink"
          >
            Sair
          </button>
        </>
      ) : (
        <Link href={`/${slug}/inscricao`} className="font-medium text-accent-700 hover:underline">
          Já tem conta? Entrar
        </Link>
      )}
    </div>
  );
}
