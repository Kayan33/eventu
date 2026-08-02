import { apiFetch } from "./client";
import type { ClientJwtPayload, JwtPayload, UserJwtPayload } from "@/lib/types/auth";

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterOrganizationPayload {
  tenantName: string;
  name: string;
  email: string;
  password: string;
}

export interface RegisterClientPayload {
  name: string;
  email: string;
  password: string;
  cpf: string;
}

interface AuthResponse<T> {
  actor: T;
}

export function loginStaff(payload: LoginPayload): Promise<AuthResponse<UserJwtPayload>> {
  return apiFetch<AuthResponse<UserJwtPayload>>("/auth/login", {
    method: "POST",
    body: payload,
  });
}

export function registerOrganization(
  payload: RegisterOrganizationPayload,
): Promise<AuthResponse<UserJwtPayload>> {
  return apiFetch<AuthResponse<UserJwtPayload>>("/auth/register", {
    method: "POST",
    body: payload,
  });
}

export function loginClient(payload: LoginPayload): Promise<AuthResponse<ClientJwtPayload>> {
  return apiFetch<AuthResponse<ClientJwtPayload>>("/auth/client-login", {
    method: "POST",
    body: payload,
  });
}

export function registerClient(payload: RegisterClientPayload): Promise<void> {
  return apiFetch<void>("/clients", { method: "POST", body: payload });
}

export function fetchMe(): Promise<AuthResponse<JwtPayload>> {
  return apiFetch<AuthResponse<JwtPayload>>("/auth/me");
}

export function logout(): Promise<void> {
  return apiFetch<void>("/auth/logout", { method: "POST" });
}
