"use client";

import QRCode from "react-qr-code";

export function TicketQrCode({ ticketId, size = 176 }: { ticketId: string; size?: number }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="rounded-md border border-divider bg-white p-3">
        <QRCode value={ticketId} size={size} />
      </div>
      <p className="text-xs text-ink-soft">Mostre esse QR code na entrada do evento</p>
    </div>
  );
}
