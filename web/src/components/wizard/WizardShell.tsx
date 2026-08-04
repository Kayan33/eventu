import type { ReactNode } from "react";

interface WizardShellProps {
  children: ReactNode;
}

export function WizardShell({ children }: WizardShellProps) {
  return (
    <div className="min-h-screen bg-bg">
      <header className="flex items-center justify-between border-b border-divider px-8 py-3.5">
        <span className="text-xl font-semibold text-ink">Eventkt</span>
        <span className="text-[13px] text-ink-soft">Rascunho salvo automaticamente</span>
      </header>

      <div className="mx-auto max-w-[640px] px-6 py-10 sm:px-4 sm:py-6">{children}</div>
    </div>
  );
}
