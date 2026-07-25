import { useMemo } from "react";

export interface PasswordStrength {
  score: 0 | 1 | 2 | 3 | 4;
  label: string;
  colorVar: string;
}

const LABELS = ["Muito fraca", "Muito fraca", "Fraca", "Boa", "Forte"];

function colorForScore(score: number): string {
  if (score <= 1) return "var(--color-danger)";
  if (score === 2) return "var(--color-warning)";
  return "var(--color-success)";
}

export function usePasswordStrength(password: string): PasswordStrength {
  return useMemo(() => {
    let score = 0;
    if (password.length >= 6) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    return {
      score: score as PasswordStrength["score"],
      label: password ? LABELS[score] : "",
      colorVar: colorForScore(score),
    };
  }, [password]);
}
