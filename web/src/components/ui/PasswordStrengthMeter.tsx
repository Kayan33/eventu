import type { PasswordStrength } from "@/lib/hooks/usePasswordStrength";

interface PasswordStrengthMeterProps {
  strength: PasswordStrength;
}

const BAR_COUNT = 4;

export function PasswordStrengthMeter({ strength }: PasswordStrengthMeterProps) {
  const { score, label, colorVar } = strength;

  return (
    <div className="flex flex-col gap-1">
      <div className="flex gap-1">
        {Array.from({ length: BAR_COUNT }).map((_, i) => (
          <div
            key={i}
            className="h-1 flex-1 rounded-full transition-colors"
            style={{
              background: i < score ? colorVar : "var(--color-neutral-bar)",
            }}
          />
        ))}
      </div>
      <span className="text-xs" style={{ color: label ? colorVar : "transparent" }}>
        {label || " "}
      </span>
    </div>
  );
}
