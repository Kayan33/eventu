import { ApiError } from "./client";

const KNOWN_MESSAGES: Record<string, string> = {
  "Invalid credentials": "Email ou senha incorretos.",
  "User already exists": "Já existe uma conta com esse email.",
  "An organization with this name already exists":
    "Já existe uma organização com esse nome. Tente outro nome.",
};

export function translateApiError(err: unknown, fallback: string): string {
  if (!(err instanceof ApiError)) return fallback;
  return KNOWN_MESSAGES[err.message] ?? fallback;
}
