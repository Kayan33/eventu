"use client";

import { useState, type ReactNode } from "react";
import { Menu } from "lucide-react";
import { Sidebar } from "./Sidebar";

export function PanelLayout({ children }: { children: ReactNode }) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="min-h-screen bg-bg md:flex">
      <Sidebar open={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-3 border-b border-divider px-4 py-3 md:hidden">
          <button
            type="button"
            onClick={() => setMobileNavOpen(true)}
            aria-label="Abrir menu"
            className="text-ink-soft"
          >
            <Menu size={20} />
          </button>
          <span className="text-lg font-semibold text-ink">Eventu</span>
        </div>

        {children}
      </div>
    </div>
  );
}
