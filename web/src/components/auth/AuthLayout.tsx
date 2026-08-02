import type { ReactNode } from "react";

interface AuthLayoutProps {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
  formMaxWidth?: string;
}

export function AuthLayout({
  eyebrow,
  title,
  description,
  children,
  formMaxWidth = "max-w-[420px]",
}: AuthLayoutProps) {
  return (
    <div className="grid min-h-screen grid-cols-1 md:grid-cols-2">
      <div className="hidden flex-col justify-between bg-brand-panel p-14 text-brand-panel-fg md:flex">
        <span className="text-xl font-semibold">Eventu</span>
        <div className="max-w-md">
          <h6 className="mb-3 text-sm font-medium text-brand-panel-fg-soft">{eyebrow}</h6>
          <h1 className="mb-4 text-4xl font-semibold leading-tight text-balance">{title}</h1>
          <p className="text-[15px] opacity-75">{description}</p>
        </div>
        <p className="text-xs opacity-50">© 2026 Eventu.</p>
      </div>

      <div className="flex items-center justify-center p-8">
        <div className={`w-full ${formMaxWidth}`}>{children}</div>
      </div>
    </div>
  );
}
