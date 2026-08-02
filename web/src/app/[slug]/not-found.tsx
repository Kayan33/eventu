import Link from "next/link";

export default function EventNotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-3 bg-bg px-6 text-center">
      <h1 className="text-xl font-semibold text-ink">Evento não encontrado</h1>
      <p className="text-sm text-ink-soft">
        O link pode estar errado, ou o evento ainda não foi publicado.
      </p>
    </main>
  );
}
