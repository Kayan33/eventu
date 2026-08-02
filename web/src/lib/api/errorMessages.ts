import { ApiError } from "./client";

const KNOWN_MESSAGES: Record<string, string> = {
  "Invalid credentials": "Email ou senha incorretos.",
  "User already exists": "Já existe uma conta com esse email.",
  "An organization with this name already exists":
    "Já existe uma organização com esse nome. Tente outro nome.",
  "Event with this title already exists":
    "Já existe um evento com esse nome. Tente outro nome.",
  "Client with this email already exists":
    "Já existe uma conta com esse email.",
  "Client with this CPF already exists":
    "Já existe uma conta com esse CPF.",
};

export function translateApiError(err: unknown, fallback: string): string {
  if (!(err instanceof ApiError)) return fallback;
  return KNOWN_MESSAGES[err.message] ?? fallback;
}
