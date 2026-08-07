"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, Check, X } from "lucide-react";
import { Scanner, type IDetectedBarcode } from "@yudiel/react-qr-scanner";

export type ScanStatus = "success" | "warning" | "error";

export interface ScanOutcome {
  status: ScanStatus;
  message: string;
  /** Participant's name — shown big, only rendered when `status` is "success". */
  name?: string;
  /** Secondary line under the name, e.g. the participant's email. */
  subtitle?: string;
}

interface ScanFeedback extends ScanOutcome {
  key: number;
}

interface QrScannerModalProps {
  onScan: (ticketId: string) => Promise<ScanOutcome>;
  onClose: () => void;
}

/** How long the result card stays up before the scanner resumes — same for every outcome. */
const FEEDBACK_DURATION_MS = 5000;

export function QrScannerModal({ onScan, onClose }: QrScannerModalProps) {
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<ScanFeedback | null>(null);
  const [paused, setPaused] = useState(false);

  function handleScan(codes: IDetectedBarcode[]) {
    const value = codes[0]?.rawValue;
    if (!value || paused) return;

    setPaused(true);
    void onScan(value).then((outcome) => {
      setFeedback({ ...outcome, key: Date.now() });
      setTimeout(() => {
        setFeedback(null);
        setPaused(false);
      }, FEEDBACK_DURATION_MS);
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
            {feedback ? <ScanResultCard feedback={feedback} /> : null}
          </div>
        )}

        <p className="mt-3 text-center text-xs text-ink-soft">
          Aponte a câmera pro QR code do ingresso
        </p>
      </div>
    </div>
  );
}

const TONE_META: Record<
  ScanStatus,
  { icon: typeof Check; label: string; iconBg: string; iconFg: string; text: string; bar: string }
> = {
  success: {
    icon: Check,
    label: "Credenciado",
    iconBg: "bg-success/15",
    iconFg: "text-success",
    text: "text-success",
    bar: "bg-success",
  },
  warning: {
    icon: AlertTriangle,
    label: "Atenção",
    iconBg: "bg-warning/15",
    iconFg: "text-warning",
    text: "text-warning",
    bar: "bg-warning",
  },
  error: {
    icon: X,
    label: "Não credenciado",
    iconBg: "bg-danger/15",
    iconFg: "text-danger",
    text: "text-danger",
    bar: "bg-danger",
  },
};

function ScanResultCard({ feedback }: { feedback: ScanFeedback }) {
  const tone = TONE_META[feedback.status];
  const Icon = tone.icon;

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black/70 p-4">
      <div
        key={feedback.key}
        className="w-full max-w-[260px] overflow-hidden rounded-xl bg-surface shadow-xl animate-scan-pop"
      >
        <div className="flex flex-col items-center gap-1.5 px-5 pb-5 pt-6 text-center">
          <div className={`mb-1 flex h-14 w-14 items-center justify-center rounded-full ${tone.iconBg} ${tone.iconFg}`}>
            <Icon size={28} />
          </div>

          <p className={`text-[11px] font-semibold uppercase tracking-wide ${tone.text}`}>
            {tone.label}
          </p>

          {feedback.status === "success" && feedback.name ? (
            <>
              <p className="text-lg font-semibold leading-tight text-ink">{feedback.name}</p>
              {feedback.subtitle ? (
                <p className="text-[13px] leading-snug text-ink-soft">{feedback.subtitle}</p>
              ) : null}
            </>
          ) : (
            <p className="text-sm leading-snug text-ink-soft">{feedback.message}</p>
          )}
        </div>

        <ScanProgressBar key={feedback.key} durationMs={FEEDBACK_DURATION_MS} barClassName={tone.bar} />
      </div>
    </div>
  );
}

function ScanProgressBar({ durationMs, barClassName }: { durationMs: number; barClassName: string }) {
  const [shrink, setShrink] = useState(false);

  useEffect(() => {
    // Paint at 100% first, then flip to 0% so the width transition actually animates.
    const raf = requestAnimationFrame(() => setShrink(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div className="h-1 w-full bg-ink/10">
      <div
        className={`h-full ${barClassName}`}
        style={{
          width: shrink ? "0%" : "100%",
          transitionProperty: "width",
          transitionTimingFunction: "linear",
          transitionDuration: `${durationMs}ms`,
        }}
      />
    </div>
  );
}
