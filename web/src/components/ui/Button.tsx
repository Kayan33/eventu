import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, loading, disabled, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          "flex h-10 items-center justify-center rounded-md bg-accent-700 px-4 text-sm font-semibold text-white transition-opacity",
          "hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60",
          className,
        )}
        {...props}
      >
        {loading ? "Carregando…" : children}
      </button>
    );
  },
);
Button.displayName = "Button";
