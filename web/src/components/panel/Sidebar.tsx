"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Calendar, Receipt, UserCheck, Users, Settings, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { getTeamMember } from "@/lib/api/users";
import { cn } from "@/lib/utils/cn";

const ROLE_LABELS: Record<string, string> = {
  admin: "Admin",
  editor: "Editor",
  viewer: "Visualizador",
};

function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? "") : "";
  return (first + last).toUpperCase();
}

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { actor, logout } = useAuth();
  const [name, setName] = useState<string | null>(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  useEffect(() => {
    if (actor?.type !== "user") return;
    getTeamMember(actor.sub)
      .then((member) => setName(member.name))
      .catch(() => setName(null));
  }, [actor]);

  if (actor?.type !== "user") return null;

  const navItems = [
    { href: "/", label: "Eventos", icon: Calendar, active: pathname === "/" || pathname.startsWith("/eventos") },
    { href: "/credenciamento", label: "Credenciamento", icon: UserCheck, active: pathname === "/credenciamento" },
    { href: "/pagamentos", label: "Pagamentos", icon: Receipt, active: pathname === "/pagamentos" },
    { href: "/equipe", label: "Equipe", icon: Users, active: pathname === "/equipe", adminOnly: true },
    { href: "/configuracoes", label: "Configurações", icon: Settings, active: pathname === "/configuracoes" },
  ];

  async function handleLogout() {
    await logout();
    router.push("/login");
  }

  return (
    <>
      {open ? (
        <div
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          onClick={onClose}
        />
      ) : null}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-[240px] -translate-x-full flex-col justify-between bg-brand-panel text-brand-panel-fg transition-transform md:sticky md:top-0 md:h-screen md:translate-x-0",
          open && "translate-x-0",
        )}
      >
        <div>
          <div className="flex items-center justify-between px-4 py-5">
            <span className="text-xl font-semibold">Eventkt</span>
            <button
              type="button"
              onClick={onClose}
              aria-label="Fechar menu"
              className="text-brand-panel-fg-soft md:hidden"
            >
              <X size={20} />
            </button>
          </div>

          <nav className="flex flex-col gap-0.5 px-2">
            {navItems.map((item) => {
              if (item.adminOnly && actor.role !== "admin") return null;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={cn(
                    "flex items-center gap-2.5 rounded-md px-3.5 py-2.5 text-sm text-brand-panel-fg-soft transition-colors hover:bg-white/5 hover:text-brand-panel-fg",
                    item.active && "bg-white/10 font-medium text-brand-panel-fg",
                  )}
                >
                  <Icon size={16} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="relative border-t border-white/10 p-3.5">
          {userMenuOpen ? (
            <div className="absolute bottom-[64px] left-3.5 right-3.5 rounded-md border border-divider bg-surface p-1 text-ink shadow-lg">
              <button
                type="button"
                onClick={() => void handleLogout()}
                className="w-full rounded-sm px-2.5 py-2 text-left text-sm hover:bg-neutral-bar"
              >
                Sair
              </button>
            </div>
          ) : null}
          <button
            type="button"
            onClick={() => setUserMenuOpen((v) => !v)}
            className="flex w-full items-center gap-2.5 rounded-md p-1 text-left hover:bg-white/5"
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent-700 text-[13px] font-semibold">
              {name ? initialsOf(name) : "…"}
            </div>
            <div className="min-w-0">
              <div className="truncate text-[13px] font-medium">{name ?? "Carregando…"}</div>
              <div className="text-[11px] text-brand-panel-fg-soft">{ROLE_LABELS[actor.role]}</div>
            </div>
          </button>
        </div>
      </aside>
    </>
  );
}
