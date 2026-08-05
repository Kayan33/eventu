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
  "Tenant must have at least one admin":
    "A organização precisa ter pelo menos um admin, não é possível remover ou rebaixar o único admin restante.",
  "Event needs at least one ticket type to be published":
    "Cadastre pelo menos um tipo de ingresso antes de publicar o evento.",
  "A paid event needs an active Pix key to be published":
    "Configure uma chave Pix ativa em Configurações antes de publicar um evento pago.",
  "Cannot change the title of a published event":
    "Não é possível mudar o nome de um evento já publicado.",
};

export function translateApiError(err: unknown, fallback: string): string {
  if (!(err instanceof ApiError)) return fallback;
  return KNOWN_MESSAGES[err.message] ?? fallback;
}
