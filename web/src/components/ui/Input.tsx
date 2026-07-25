import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean;
}

export function inputBaseClasses(invalid: boolean | undefined, className?: string) {
  return cn(
    "h-10 w-full rounded-md border bg-surface px-3 text-sm text-ink outline-none transition-colors",
    "placeholder:text-ink-soft/60",
    "focus:border-accent-700 focus:ring-1 focus:ring-accent-700",
    invalid ? "border-danger" : "border-divider",
    className,
  );
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, invalid, ...props }, ref) => {
    return (
      <input ref={ref} className={inputBaseClasses(invalid, className)} {...props} />
    );
  },
);
Input.displayName = "Input";
