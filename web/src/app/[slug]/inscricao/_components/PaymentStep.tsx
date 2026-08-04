"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, Copy } from "lucide-react";
import { uploadReceipt } from "@/lib/api/payments";
import { translateApiError } from "@/lib/api/errorMessages";
import { Button } from "@/components/ui/Button";
import type { TicketEntity } from "@/lib/api/tickets";

const PIX_KEY_TYPE_LABELS: Record<string, string> = {
  cpf: "CPF",
  email: "Email",
  phone: "Telefone",
  random: "Chave aleatória",
};

interface PaymentStepProps {
  ticket: TicketEntity;
}

export function PaymentStep({ ticket }: PaymentStepProps) {
  const payment = ticket.payment;
  const tenant = ticket.ticketType?.event?.tenant;

  const [copied, setCopied] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState(payment?.status);
  const [error, setError] = useState<string | null>(null);

  function copyKey() {
    if (!tenant?.pixKey) return;
    void navigator.clipboard.writeText(tenant.pixKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleUpload() {
    if (!file || !payment) return;
    setUploading(true);
    setError(null);
    try {
      await uploadReceipt(payment.id, file);
      setStatus("uploaded");
    } catch (err) {
      setError(translateApiError(err, "Não foi possível enviar o comprovante."));
    } finally {
      setUploading(false);
    }
  }

  if (status === "approved") {
    return (
      <div>
        <p className="text-sm font-medium text-ink">Pagamento aprovado!</p>
        <p className="mt-1.5 text-sm text-ink-soft">
          Sua inscrição está confirmada. Código:{" "}
          <span className="font-medium text-ink">{ticket.code}</span>
        </p>
        <Link
          href="/minhas-inscricoes"
          className="mt-4 inline-block text-sm font-medium text-accent-700 hover:underline"
        >
          Ver minhas inscrições →
        </Link>
      </div>
    );
  }

  if (status === "uploaded") {
    return (
      <div>
        <p className="text-sm font-medium text-ink">Comprovante enviado!</p>
        <p className="mt-1.5 text-sm text-ink-soft">
          A organização vai revisar seu pagamento em breve.
        </p>
        <Link
          href="/minhas-inscricoes"
          className="mt-4 inline-block text-sm font-medium text-accent-700 hover:underline"
        >
          Ver minhas inscrições →
        </Link>
      </div>
    );
  }

  return (
    <div>
      <p className="text-sm font-medium text-ink">Inscrição confirmada!</p>
      <p className="mt-1 text-sm text-ink-soft">
        Código: <span className="font-medium text-ink">{ticket.code}</span>
      </p>

      {status === "rejected" ? (
        <p className="mt-3 text-sm text-danger">
          Seu comprovante anterior foi rejeitado
          {payment?.rejectionReason ? `: ${payment.rejectionReason}` : "."} Envie um novo
          comprovante abaixo.
        </p>
      ) : null}

      <div className="mt-4 rounded-md border border-divider bg-bg p-4">
        <p className="text-center text-xs text-ink-soft">Valor a pagar</p>
        <p className="text-center text-2xl font-semibold text-ink">R$ {payment?.amount}</p>

        {tenant?.pixQrCodeUrl ? (
          <div className="mt-4 flex flex-col items-center">
            <p className="mb-2 text-xs text-ink-soft">Escaneie o QR code</p>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={tenant.pixQrCodeUrl}
              alt="QR code do Pix"
              className="h-64 w-64 rounded-md border border-divider bg-surface object-contain"
            />
          </div>
        ) : null}

        {tenant?.pixKey ? (
          <div className="mt-4">
            <p className="text-xs text-ink-soft">
              {tenant.pixQrCodeUrl ? "Ou use a chave PIX" : "Chave PIX"} (
              {PIX_KEY_TYPE_LABELS[tenant.pixKeyType ?? ""] ?? tenant.pixKeyType})
              {tenant.pixBeneficiary ? ` — ${tenant.pixBeneficiary}` : ""}
            </p>
            <div className="mt-1.5 flex items-center gap-2">
              <code className="flex-1 truncate rounded-md border border-divider bg-surface px-3 py-2 text-sm text-ink">
                {tenant.pixKey}
              </code>
              <button
                type="button"
                onClick={copyKey}
                aria-label="Copiar chave PIX"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-divider text-ink-soft transition-colors hover:border-accent-700 hover:text-accent-700"
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
              </button>
            </div>
          </div>
        ) : null}
      </div>

      <div className="mt-4">
        <label htmlFor="receipt" className="mb-1.5 block text-sm font-medium text-ink">
          Comprovante do PIX
        </label>
        <input
          id="receipt"
          type="file"
          accept="image/png,image/jpeg,image/webp,application/pdf"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className="text-sm text-ink-soft file:mr-3 file:h-9 file:rounded-md file:border file:border-divider file:bg-surface file:px-3.5 file:text-sm file:font-medium file:text-ink hover:file:border-accent-700"
        />
      </div>

      {error ? <p className="mt-2 text-sm text-danger">{error}</p> : null}

      <Button
        type="button"
        onClick={() => void handleUpload()}
        loading={uploading}
        disabled={!file}
        className="mt-4 w-full"
      >
        Enviar comprovante
      </Button>
    </div>
  );
}
