"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { Scanner, type IDetectedBarcode } from "@yudiel/react-qr-scanner";

export interface ScanOutcome {
  ok: boolean;
  message: string;
}

interface QrScannerModalProps {
  onScan: (ticketId: string) => Promise<ScanOutcome>;
  onClose: () => void;
}

export function QrScannerModal({ onScan, onClose }: QrScannerModalProps) {
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<ScanOutcome | null>(null);
  const [paused, setPaused] = useState(false);

  function handleScan(codes: IDetectedBarcode[]) {
    const value = codes[0]?.rawValue;
    if (!value || paused) return;

    setPaused(true);
    void onScan(value).then((outcome) => {
      setFeedback(outcome);
      setTimeout(() => {
        setFeedback(null);
        setPaused(false);
      }, 1500);
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-sm rounded-md border border-divider bg-surface p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-ink">Escanear QR code</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="flex h-8 w-8 items-center justify-center rounded-md text-ink-soft hover:bg-neutral-bar hover:text-ink"
          >
            <X size={18} />
          </button>
        </div>

        {cameraError ? (
          <p className="text-sm text-danger">{cameraError}</p>
        ) : (
          <div className="relative overflow-hidden rounded-md">
            <Scanner
              onScan={handleScan}
              onError={() =>
                setCameraError("Não foi possível acessar a câmera. Verifique a permissão do navegador.")
              }
              formats={["qr_code"]}
              paused={paused}
              components={{ finder: true, torch: true }}
              styles={{ container: { width: "100%" } }}
            />
            {feedback ? (
              <div
                className={`absolute inset-0 flex items-center justify-center p-4 text-center text-sm font-medium text-white ${
                  feedback.ok ? "bg-success/90" : "bg-danger/90"
                }`}
              >
                {feedback.message}
              </div>
            ) : null}
          </div>
        )}

        <p className="mt-3 text-center text-xs text-ink-soft">
          Aponte a câmera pro QR code do ingresso
        </p>
      </div>
    </div>
  );
}
